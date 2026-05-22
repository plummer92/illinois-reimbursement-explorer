"""Discover facility careers pages and public job-opening counts.

This importer starts from Illinois Hospital Report Card hospital website fields,
matches them to the local CMS hospital master file, discovers likely careers
links, and writes dated observations for the dashboard.

Counts are labor-market signals. They are not proof of actual vacancy rates,
staffing levels, turnover, or budgeted headcount.
"""

from __future__ import annotations

import argparse
import json
import re
import time
from dataclasses import dataclass
from datetime import date
from html.parser import HTMLParser
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urljoin, urlparse
from urllib.request import Request, urlopen


HOSPITAL_REPORT_CARD_URL = "https://healthcarereportcard.illinois.gov/api/hospitals?per_page=100"
USER_AGENT = "IllinoisReimbursementExplorer/0.1 (public research; contact: local-user)"
CAREER_KEYWORDS = (
    "career",
    "careers",
    "employment",
    "jobs",
    "job openings",
    "join our team",
    "work with us",
    "work for us",
    "opportunities",
)
PLATFORM_HINTS = {
    "myworkdayjobs.com": "Workday",
    "wd1.myworkdaysite.com": "Workday",
    "wd5.myworkdaysite.com": "Workday",
    "icims.com": "iCIMS",
    "oraclecloud.com": "Oracle Recruiting",
    "taleo.net": "Oracle Taleo",
    "ultipro.com": "UKG",
    "ukg.com": "UKG",
    "greenhouse.io": "Greenhouse",
    "lever.co": "Lever",
    "smartrecruiters.com": "SmartRecruiters",
    "successfactors": "SAP SuccessFactors",
    "healthcaresource.com": "HealthcareSource",
    "symplr.com": "symplr",
}


@dataclass
class Link:
    href: str
    text: str


class LinkParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.links: list[Link] = []
        self._href: str | None = None
        self._text: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag.lower() != "a":
            return
        attrs_dict = dict(attrs)
        href = attrs_dict.get("href")
        if href:
            self._href = href
            self._text = []

    def handle_data(self, data: str) -> None:
        if self._href:
            self._text.append(data)

    def handle_endtag(self, tag: str) -> None:
        if tag.lower() == "a" and self._href:
            self.links.append(Link(self._href, " ".join(self._text).strip()))
            self._href = None
            self._text = []


def fetch_text(url: str, timeout: int) -> str:
    request = Request(url, headers={"User-Agent": USER_AGENT, "Accept": "text/html,application/json;q=0.9,*/*;q=0.8"})
    with urlopen(request, timeout=timeout) as response:
        charset = response.headers.get_content_charset() or "utf-8"
        return response.read().decode(charset, errors="replace")


def fetch_json(url: str, timeout: int) -> Any:
    return json.loads(fetch_text(url, timeout))


def normalize_homepage(value: object) -> str | None:
    text = str(value or "").strip()
    if not text:
        return None
    if not re.match(r"^https?://", text, re.I):
        text = f"https://{text}"
    parsed = urlparse(text)
    if not parsed.netloc:
        return None
    return text.rstrip("/")


def normalize_name(value: object) -> str:
    text = str(value or "").upper()
    text = re.sub(r"\b(HOSPITAL|MEDICAL|CENTER|CENTRE|MEMORIAL|SAINT|ST|THE|INC|LLC|CORP|CORPORATION)\b", " ", text)
    text = re.sub(r"[^A-Z0-9 ]", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def normalize_city(value: object) -> str:
    return re.sub(r"\s+", " ", str(value or "").upper()).strip()


def extract_items(payload: Any) -> list[dict[str, Any]]:
    if isinstance(payload, list):
        return [item for item in payload if isinstance(item, dict)]
    if isinstance(payload, dict):
        for key in ("data", "hospitals", "results", "items"):
            value = payload.get(key)
            if isinstance(value, list):
                return [item for item in value if isinstance(item, dict)]
    return []


def next_page_url(payload: Any, current_url: str) -> str | None:
    if not isinstance(payload, dict):
        return None
    if payload.get("next_page_url"):
        return str(payload["next_page_url"])
    links = payload.get("links")
    if isinstance(links, dict) and links.get("next"):
        return str(links["next"])
    meta = payload.get("meta") or payload.get("pagination") or {}
    if isinstance(meta, dict):
        current = meta.get("current_page") or meta.get("page")
        total = meta.get("total_pages") or meta.get("last_page")
        if isinstance(current, int) and isinstance(total, int) and current < total:
            separator = "&" if "?" in current_url else "?"
            return re.sub(r"([?&])page=\d+", rf"\g<1>page={current + 1}", current_url) if "page=" in current_url else f"{current_url}{separator}page={current + 1}"
    return None


def load_report_card_hospitals(timeout: int) -> list[dict[str, Any]]:
    url: str | None = HOSPITAL_REPORT_CARD_URL
    hospitals: list[dict[str, Any]] = []
    seen_urls: set[str] = set()
    while url and url not in seen_urls:
        seen_urls.add(url)
        payload = fetch_json(url, timeout)
        page_items = extract_items(payload)
        hospitals.extend(page_items)
        url = next_page_url(payload, url)
        if not url and len(page_items) == 100:
            separator = "&" if "?" in HOSPITAL_REPORT_CARD_URL else "?"
            url = f"{HOSPITAL_REPORT_CARD_URL}{separator}page={len(seen_urls) + 1}"
    return hospitals


def load_cms_hospitals(path: Path) -> list[dict[str, Any]]:
    return json.loads(path.read_text(encoding="utf-8"))


def match_report_card_to_cms(report_card: dict[str, Any], cms_records: list[dict[str, Any]]) -> dict[str, Any] | None:
    mpn = str(report_card.get("mpn_id") or "").strip()
    if mpn:
        for record in cms_records:
            if str(record.get("facilityId") or "").strip() == mpn:
                return record

    rc_name = normalize_name(report_card.get("name"))
    rc_city = normalize_city(report_card.get("city"))
    for record in cms_records:
        if normalize_city(record.get("city")) != rc_city:
            continue
        cms_name = normalize_name(record.get("facilityName"))
        if rc_name and cms_name and (rc_name in cms_name or cms_name in rc_name):
            return record
    return None


def parse_links(html: str, base_url: str) -> list[Link]:
    parser = LinkParser()
    parser.feed(html)
    links: list[Link] = []
    seen: set[str] = set()
    for link in parser.links:
        href = urljoin(base_url, link.href)
        if href not in seen:
            links.append(Link(href, link.text))
            seen.add(href)
    return links


def score_career_link(link: Link) -> int:
    haystack = f"{link.text} {link.href}".lower()
    score = 0
    for keyword in CAREER_KEYWORDS:
        if keyword in haystack:
            score += 5 if keyword in {"careers", "employment", "jobs"} else 3
    if any(domain in haystack for domain in PLATFORM_HINTS):
        score += 8
    if "volunteer" in haystack:
        score -= 4
    if any(word in haystack for word in ("physician referral", "doctor", "provider directory")):
        score -= 3
    return score


def discover_careers_url(homepage: str, timeout: int) -> tuple[str | None, str, str | None]:
    try:
        html = fetch_text(homepage, timeout)
    except (HTTPError, URLError, TimeoutError, OSError) as error:
        return None, "homepage-fetch-failed", str(error)

    links = parse_links(html, homepage)
    ranked = sorted(((score_career_link(link), link) for link in links), key=lambda item: item[0], reverse=True)
    if ranked and ranked[0][0] > 0:
        return ranked[0][1].href, "homepage-link", None

    for suffix in ("/careers", "/career", "/jobs", "/employment"):
        candidate = urljoin(homepage + "/", suffix.lstrip("/"))
        try:
            fetch_text(candidate, timeout)
            return candidate, "guessed-path", None
        except (HTTPError, URLError, TimeoutError, OSError):
            continue

    return None, "not-found", "No careers link or common careers path found."


def platform_for_url(url: str | None) -> str | None:
    if not url:
        return None
    lowered = url.lower()
    for needle, platform in PLATFORM_HINTS.items():
        if needle in lowered:
            return platform
    return "Facility website"


def extract_job_count(html: str) -> tuple[int | None, str, str]:
    text = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", html))
    patterns = [
        r"(\d{1,5})\s+(?:open\s+)?(?:jobs|positions|openings|opportunities|results)",
        r"(?:jobs|positions|openings|opportunities|results)\s+\(?(\d{1,5})\)?",
        r"showing\s+\d+\s*[-–]\s*\d+\s+of\s+(\d{1,5})",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.I)
        if match:
            return int(match.group(1)), "page-text-count", f"Matched count pattern: {pattern}"

    job_hrefs = set(re.findall(r'href=["\']([^"\']*(?:job|career|requisition|opening)[^"\']*)["\']', html, re.I))
    filtered = {href for href in job_hrefs if not re.search(r"privacy|terms|login|talent|alert|benefit", href, re.I)}
    if filtered:
        return len(filtered), "job-link-count", "Counted unique job-like links in static HTML."

    return None, "not-counted", "No reliable static job count found; page may require JavaScript or platform-specific API handling."


def count_job_openings(careers_url: str | None, timeout: int) -> tuple[int | None, str, str]:
    if not careers_url:
        return None, "not-counted", "No careers URL available."
    try:
        html = fetch_text(careers_url, timeout)
    except (HTTPError, URLError, TimeoutError, OSError) as error:
        return None, "careers-fetch-failed", str(error)
    return extract_job_count(html)


def build_observation(report_card: dict[str, Any], cms: dict[str, Any] | None, timeout: int) -> dict[str, Any]:
    homepage = normalize_homepage(report_card.get("website"))
    careers_url, discovery_method, discovery_note = discover_careers_url(homepage, timeout) if homepage else (None, "no-homepage", "Hospital Report Card did not include a website.")
    count, count_method, count_note = count_job_openings(careers_url, timeout)

    return {
        "facilityId": cms.get("facilityId") if cms else str(report_card.get("mpn_id") or ""),
        "reportCardEntityId": report_card.get("entity_id"),
        "facilityName": cms.get("facilityName") if cms else report_card.get("name"),
        "reportCardName": report_card.get("name"),
        "city": cms.get("city") if cms else report_card.get("city"),
        "county": cms.get("county") if cms else report_card.get("county_name"),
        "facilityHomepageUrl": homepage,
        "careerPageUrl": careers_url,
        "platform": platform_for_url(careers_url),
        "jobOpeningCount": count,
        "countMethod": count_method,
        "discoveryMethod": discovery_method,
        "observedDate": date.today().isoformat(),
        "source": "Illinois Hospital Report Card website field and facility careers page",
        "sourceUrl": careers_url or homepage,
        "confidence": "medium" if count is not None else "low",
        "notes": "; ".join(note for note in (discovery_note, count_note) if note),
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--cms-hospitals", type=Path, default=Path("data/cms-hospital-general-illinois.json"), help="Local CMS Illinois hospital JSON.")
    parser.add_argument("--output", type=Path, default=Path("data/facility-careers.json"), help="Output JSON path.")
    parser.add_argument("--limit", type=int, default=None, help="Optional maximum number of hospitals to inspect.")
    parser.add_argument("--timeout", type=int, default=12, help="HTTP timeout in seconds.")
    parser.add_argument("--delay", type=float, default=0.25, help="Delay between facilities in seconds.")
    args = parser.parse_args()

    cms_records = load_cms_hospitals(args.cms_hospitals)
    report_card_records = load_report_card_hospitals(args.timeout)
    observations: list[dict[str, Any]] = []

    for index, report_card in enumerate(report_card_records):
        if args.limit is not None and index >= args.limit:
            break
        cms = match_report_card_to_cms(report_card, cms_records)
        observation = build_observation(report_card, cms, args.timeout)
        observations.append(observation)
        print(
            f"{index + 1}. {observation['facilityName']}: "
            f"{observation['jobOpeningCount'] if observation['jobOpeningCount'] is not None else 'not counted'}"
        )
        time.sleep(args.delay)

    output = {
        "description": "Facility careers pages and public job-opening counts. Counts are labor-market signals, not proof of staffing levels or vacancy rates.",
        "lastUpdated": date.today().isoformat(),
        "source": "Illinois Hospital Report Card API plus facility careers pages",
        "sourceUrl": HOSPITAL_REPORT_CARD_URL,
        "records": observations,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(output, indent=2), encoding="utf-8")
    print(f"Wrote {len(observations)} career observations to {args.output}")


if __name__ == "__main__":
    main()
