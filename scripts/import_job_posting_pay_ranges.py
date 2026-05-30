"""Import public job-posting pay ranges for Illinois healthcare facilities.

The importer starts from data/facility-careers.json, finds job-like links on
public careers pages, visits posting pages when possible, and extracts pay
ranges such as "$32.00 - $48.00/hour" or "$68,000 to $92,000 annually".

These records are recruitment-posting signals. They are not proof of actual
wages, payroll, staffing levels, vacancy rate, or physician compensation.
"""

from __future__ import annotations

import argparse
import json
import re
import time
from http.client import IncompleteRead, InvalidURL
from dataclasses import dataclass
from datetime import date
from html.parser import HTMLParser
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urljoin, urlparse
from urllib.request import Request, urlopen


USER_AGENT = "IllinoisReimbursementExplorer/0.1 (public research; contact: local-user)"
JOB_LINK_RE = re.compile(r"(job|career|requisition|opening|position|apply)", re.I)
SKIP_LINK_RE = re.compile(r"(privacy|terms|login|talent|alert|benefit|facebook|twitter|linkedin|mailto:)", re.I)
PAY_RANGE_RE = re.compile(
    r"\$\s*([0-9]{2,6}(?:,[0-9]{3})?(?:\.[0-9]{1,2})?)"
    r"\s*(?:-|to|through|up to)\s*"
    r"\$?\s*([0-9]{2,6}(?:,[0-9]{3})?(?:\.[0-9]{1,2})?)"
    r"\s*(?:per\s+)?(?:/|\s+)?"
    r"(hour|hr|year|yr|annual|annually|salary)?",
    re.I,
)
SINGLE_PAY_RE = re.compile(
    r"(?:starting\s+(?:pay|salary|wage|rate)|starts\s+at|minimum\s+(?:pay|salary|wage|rate)|min\.?\s+(?:pay|salary|wage|rate)|salary|pay|wage|hourly\s+rate|base\s+pay|compensation)\s*(?:at|range|is|:)?\s*"
    r"\$?\s*([0-9]{2,6}(?:,[0-9]{3})?(?:\.[0-9]{1,2})?)"
    r"\s*(?:per\s+)?(?:/|\s+)?"
    r"(hour|hr|year|yr|annual|annually|salary)?",
    re.I,
)
BENEFIT_RE = re.compile(r"\b(medical insurance|health insurance|dental|vision|retirement|401k|tuition|pto|paid time off|life insurance)\b", re.I)


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
            self.links.append(Link(self._href, clean_text(" ".join(self._text))))
            self._href = None
            self._text = []


class TextParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.title_parts: list[str] = []
        self.heading_parts: list[str] = []
        self.text_parts: list[str] = []
        self._tag_stack: list[str] = []
        self._ignored_depth = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        tag = tag.lower()
        self._tag_stack.append(tag)
        if tag in {"script", "style", "noscript", "svg"}:
            self._ignored_depth += 1

    def handle_data(self, data: str) -> None:
        if self._ignored_depth:
            return
        text = clean_text(data)
        if not text:
            return
        current = self._tag_stack[-1] if self._tag_stack else ""
        if current == "title":
            self.title_parts.append(text)
        if current in {"h1", "h2"}:
            self.heading_parts.append(text)
        self.text_parts.append(text)

    def handle_endtag(self, tag: str) -> None:
        tag = tag.lower()
        if tag in {"script", "style", "noscript", "svg"} and self._ignored_depth:
            self._ignored_depth -= 1
        for index in range(len(self._tag_stack) - 1, -1, -1):
            if self._tag_stack[index] == tag:
                del self._tag_stack[index:]
                break


def clean_text(value: object) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip()


def fetch_text(url: str, timeout: int) -> str:
    request = Request(url, headers={"User-Agent": USER_AGENT, "Accept": "text/html,application/json;q=0.9,*/*;q=0.8"})
    with urlopen(request, timeout=timeout) as response:
        charset = response.headers.get_content_charset() or "utf-8"
        return response.read().decode(charset, errors="replace")


def load_records(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        return []
    payload = json.loads(path.read_text(encoding="utf-8-sig"))
    if isinstance(payload, list):
        return [row for row in payload if isinstance(row, dict)]
    if isinstance(payload, dict) and isinstance(payload.get("records"), list):
        return [row for row in payload["records"] if isinstance(row, dict)]
    return []


def parse_links(html: str, base_url: str) -> list[Link]:
    parser = LinkParser()
    parser.feed(html)
    links: list[Link] = []
    seen: set[str] = set()
    for link in parser.links:
        href = urljoin(base_url, link.href)
        if re.search(r"\s", href):
            continue
        if href in seen:
            continue
        seen.add(href)
        links.append(Link(href, link.text))
    return links


def is_same_host_or_platform(base_url: str, candidate_url: str) -> bool:
    base = urlparse(base_url)
    candidate = urlparse(candidate_url)
    if not candidate.netloc:
        return True
    if base.netloc and candidate.netloc == base.netloc:
        return True
    return any(platform in candidate.netloc.lower() for platform in ("workday", "icims", "oraclecloud", "taleo", "ultipro", "ukg", "greenhouse", "lever", "smartrecruiters", "successfactors", "healthcaresource", "symplr"))


def find_posting_links(careers_url: str, html: str, limit: int) -> list[Link]:
    candidates: list[tuple[int, Link]] = []
    for link in parse_links(html, careers_url):
        haystack = f"{link.text} {link.href}"
        if SKIP_LINK_RE.search(haystack):
            continue
        if not JOB_LINK_RE.search(haystack):
            continue
        if not is_same_host_or_platform(careers_url, link.href):
            continue
        score = 1
        if re.search(r"\b(RN|nurse|pharmac|therap|tech|physician|provider|assistant|manager|analyst|specialist)\b", haystack, re.I):
            score += 4
        if re.search(r"(jobId|requisition|req|posting|apply)", link.href, re.I):
            score += 3
        candidates.append((score, link))
    return [link for _, link in sorted(candidates, key=lambda item: item[0], reverse=True)[:limit]]


def html_to_text(html: str) -> tuple[str, str]:
    parser = TextParser()
    parser.feed(html)
    title = parser.heading_parts[0] if parser.heading_parts else (parser.title_parts[0] if parser.title_parts else "")
    return clean_text(title), clean_text(" ".join(parser.text_parts))


def parse_money(value: str) -> float:
    return float(value.replace(",", ""))


def normalize_period(value: str | None, low: float) -> str:
    text = str(value or "").lower()
    if text in {"hour", "hr"} or low < 250:
        return "hourly"
    if text in {"year", "yr", "annual", "annually", "salary"} or low >= 1000:
        return "annual"
    return ""


def normalize_city(value: object) -> str:
    return re.sub(r"[^A-Z0-9 ]", " ", str(value or "").upper()).strip()


def extract_posting_location(title: str, text: str) -> tuple[str, str]:
    haystack = f"{title} {text[:600]}"
    match = re.search(r"\bin\s+([A-Z][A-Za-z .'-]+),\s*(Illinois|IL|Indiana|IN|Missouri|MO|California|CA|Wisconsin|WI|Iowa|IA)\b", haystack)
    if match:
        return clean_text(match.group(1)), clean_text(match.group(2))
    match = re.search(r"\b([A-Z][A-Za-z .'-]+),\s*(Illinois|IL)\b", haystack)
    if match:
        return clean_text(match.group(1)), clean_text(match.group(2))
    return "", ""


def is_location_compatible(record: dict[str, Any], posting_city: str, posting_state: str) -> bool:
    if posting_state and posting_state.upper() not in {"IL", "ILLINOIS"}:
        return False
    facility_city = normalize_city(record.get("city"))
    if posting_city and facility_city and normalize_city(posting_city) != facility_city:
        return False
    return True


def extract_pay(text: str) -> dict[str, Any] | None:
    text = re.sub(
        r"\$\s*([0-9]{2,3})\s*[Kk]\s*(?:-|to)\s*\$?\s*([0-9]{2,3})\s*[Kk]",
        lambda match: f"${int(match.group(1)) * 1000} - ${int(match.group(2)) * 1000}",
        text,
    )
    text = re.sub(
        r"\$\s*([0-9]{2,3})\s*[Kk]\b",
        lambda match: f"${int(match.group(1)) * 1000}",
        text,
    )
    match = PAY_RANGE_RE.search(text)
    if match:
        pay_min = parse_money(match.group(1))
        pay_max = parse_money(match.group(2))
        if pay_min > pay_max:
            pay_min, pay_max = pay_max, pay_min
        return {
            "payMin": pay_min,
            "payMax": pay_max,
            "midpoint": round((pay_min + pay_max) / 2, 2),
            "period": normalize_period(match.group(3), pay_min),
            "payText": clean_text(match.group(0)),
        }

    match = SINGLE_PAY_RE.search(text)
    if match and "$" in match.group(0):
        value = parse_money(match.group(1))
        period = normalize_period(match.group(2), value)
        if not period:
            return None
        return {
            "payMin": value,
            "payMax": None,
            "midpoint": value,
            "period": period,
            "payText": clean_text(match.group(0)),
        }
    return None


def extract_benefits_text(text: str) -> str:
    if not BENEFIT_RE.search(text):
        return ""
    sentences = re.split(r"(?<=[.!?])\s+", text)
    matches = [clean_text(sentence) for sentence in sentences if BENEFIT_RE.search(sentence)]
    return " ".join(matches[:2])[:400]


def categorize_role(title: str) -> str:
    text = title.lower()
    if re.search(r"\b(rn|registered nurse|nurse|lpn|cna|patient care|nursing assistant)\b", text):
        return "Nursing"
    if re.search(r"pharmac|rx|sterile compounding", text):
        return "Pharmacy"
    if re.search(r"physician|provider|advanced practice|np\b|pa\b", text):
        return "Provider"
    if re.search(r"therap|rehab", text):
        return "Therapy/Rehab"
    if re.search(r"imaging|radiology|x-ray|ct|mri|ultrasound|lab|phlebotom", text):
        return "Lab/Imaging"
    if re.search(r"billing|coding|revenue|finance|admin|clerk|registr|scheduler|analyst|specialist", text):
        return "Business/Admin"
    if re.search(r"evs|environmental|housekeep|janitor|clean|laundry|food|diet|cook", text):
        return "EVS/Food"
    return "Other"


def is_likely_role_title(title: str) -> bool:
    text = clean_text(title)
    if not text or len(text) < 4 or len(text) > 140:
        return False
    if re.fullmatch(r"(why .*|about .*|benefits?|home|search jobs?|job search|join our team|careers?)", text, re.I):
        return False
    return bool(re.search(r"nurse|rn|lpn|cna|pharmac|therap|tech|physician|provider|assistant|manager|director|coordinator|specialist|analyst|billing|coding|revenue|registr|clerk|lab|imaging|respiratory|security|social|case|surg|medical|patient|materials|environmental|housekeep|food|diet", text, re.I))


def extract_posting(record: dict[str, Any], posting_url: str, link_text: str, timeout: int) -> dict[str, Any] | None:
    try:
        html = fetch_text(posting_url, timeout)
    except (HTTPError, URLError, TimeoutError, OSError, ValueError, InvalidURL, IncompleteRead):
        return None
    role_title, text = html_to_text(html)
    pay = extract_pay(text)
    if not pay:
        return None
    title = clean_text(role_title or link_text or "Unknown role")
    if not is_likely_role_title(title):
        return None
    posting_city, posting_state = extract_posting_location(title, text)
    if not is_location_compatible(record, posting_city, posting_state):
        return None
    return {
        "facilityId": record.get("facilityId") or "",
        "facilityName": record.get("facilityName") or record.get("reportCardName") or "",
        "city": record.get("city") or "",
        "county": record.get("county") or "",
        "platform": record.get("platform") or "",
        "roleTitle": title,
        "category": categorize_role(title),
        "postingCity": posting_city,
        "postingState": posting_state,
        "postingUrl": posting_url,
        "careerPageUrl": record.get("careerPageUrl") or "",
        "observedDate": date.today().isoformat(),
        "benefitsText": extract_benefits_text(text),
        "source": "Public job posting",
        "confidence": "medium",
        **pay,
    }


def import_pay_ranges(records: list[dict[str, Any]], facility_limit: int | None, posting_limit: int, timeout: int, delay: float) -> list[dict[str, Any]]:
    output: list[dict[str, Any]] = []
    seen_postings: set[str] = set()
    facilities = records[:facility_limit] if facility_limit is not None else records
    for index, record in enumerate(facilities, start=1):
        careers_url = record.get("careerPageUrl")
        if not careers_url:
            continue
        try:
            careers_html = fetch_text(str(careers_url), timeout)
        except (HTTPError, URLError, TimeoutError, OSError, IncompleteRead) as error:
            print(f"{index}. {record.get('facilityName')}: careers fetch failed ({error})")
            continue
        links = find_posting_links(str(careers_url), careers_html, posting_limit)
        found = 0
        for link in links:
            if link.href in seen_postings:
                continue
            seen_postings.add(link.href)
            posting = extract_posting(record, link.href, link.text, timeout)
            if posting:
                output.append(posting)
                found += 1
            time.sleep(delay)
        print(f"{index}. {record.get('facilityName')}: {found} pay range posting(s)")
        time.sleep(delay)
    return output


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--careers", type=Path, default=Path("data/facility-careers.json"), help="Input careers observations JSON.")
    parser.add_argument("--output", type=Path, default=Path("data/facility-pay-ranges.json"), help="Output pay range JSON.")
    parser.add_argument("--facility-limit", type=int, default=None, help="Optional number of facilities to inspect.")
    parser.add_argument("--posting-limit", type=int, default=20, help="Maximum posting links to inspect per careers page.")
    parser.add_argument("--timeout", type=int, default=12, help="HTTP timeout in seconds.")
    parser.add_argument("--delay", type=float, default=0.25, help="Delay between public requests in seconds.")
    args = parser.parse_args()

    records = load_records(args.careers)
    pay_ranges = import_pay_ranges(records, args.facility_limit, args.posting_limit, args.timeout, args.delay)
    payload = {
        "description": "Public job-posting pay ranges for Illinois healthcare facilities. These are recruitment posting signals, not proof of actual wages, payroll, staffing levels, or physician compensation.",
        "lastUpdated": date.today().isoformat(),
        "source": "Facility careers pages and public job postings",
        "sourceUrl": str(args.careers),
        "records": pay_ranges,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    print(f"Wrote {len(pay_ranges)} pay range record(s) to {args.output}")


if __name__ == "__main__":
    main()
