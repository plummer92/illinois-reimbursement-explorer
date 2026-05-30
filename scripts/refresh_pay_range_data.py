"""Refresh careers observations and public job-posting pay ranges.

This orchestrates the two-step workforce compensation pipeline:

1. Refresh facility careers observations from Illinois Hospital Report Card
   website seeds.
2. Crawl those public careers pages for defensible, location-matched posted pay
   ranges.

The output is intended for dashboard data refreshes. Posted pay ranges are
recruitment signals, not proof of actual payroll or individual compensation.
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path
from typing import Any


def count_records(path: Path) -> int:
    if not path.exists():
        return 0
    payload = json.loads(path.read_text(encoding="utf-8-sig"))
    if isinstance(payload, list):
        return len(payload)
    if isinstance(payload, dict) and isinstance(payload.get("records"), list):
        return len(payload["records"])
    return 0


def run_step(args: list[str]) -> None:
    print(f"Running: {' '.join(args)}", flush=True)
    subprocess.run(args, check=True)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--cms-hospitals", type=Path, default=Path("data/cms-hospital-general-illinois.json"))
    parser.add_argument("--careers-output", type=Path, default=Path("data/facility-careers.json"))
    parser.add_argument("--pay-output", type=Path, default=Path("data/facility-pay-ranges.json"))
    parser.add_argument("--facility-limit", type=int, default=40)
    parser.add_argument("--posting-limit", type=int, default=25)
    parser.add_argument("--timeout", type=int, default=12)
    parser.add_argument("--delay", type=float, default=0.2)
    parser.add_argument("--skip-careers-refresh", action="store_true", help="Only rerun pay extraction against the current careers file.")
    args = parser.parse_args()

    before_careers = count_records(args.careers_output)
    before_pay = count_records(args.pay_output)

    if not args.skip_careers_refresh:
        run_step([
            sys.executable,
            "scripts/import_facility_careers.py",
            "--cms-hospitals",
            str(args.cms_hospitals),
            "--output",
            str(args.careers_output),
            "--limit",
            str(args.facility_limit),
            "--timeout",
            str(args.timeout),
            "--delay",
            str(args.delay),
        ])

    run_step([
        sys.executable,
        "scripts/import_job_posting_pay_ranges.py",
        "--careers",
        str(args.careers_output),
        "--output",
        str(args.pay_output),
        "--facility-limit",
        str(args.facility_limit),
        "--posting-limit",
        str(args.posting_limit),
        "--timeout",
        str(args.timeout),
        "--delay",
        str(args.delay),
    ])

    after_careers = count_records(args.careers_output)
    after_pay = count_records(args.pay_output)
    print(
        "Refresh complete: "
        f"careers {before_careers} -> {after_careers}; "
        f"posted pay ranges {before_pay} -> {after_pay}",
        flush=True,
    )


if __name__ == "__main__":
    main()
