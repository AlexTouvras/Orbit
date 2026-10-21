#!/usr/bin/env python3
"""Build an evidence-linked weekly delivery brief from a project export.

The rules are deterministic on purpose. A finding is kept only when every
material claim cites a row in the export. Narrative interpretation is marked
as an inference. The brief does not predict that a future date will be missed.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import html
import json
import re
import shutil
import sys
import tempfile
from dataclasses import asdict, dataclass, field
from datetime import date, datetime, timedelta
from pathlib import Path

import extract


RULES_VERSION = "2026-10-11"
DONE = {"done", "closed", "resolved"}
ACTIVE = {"in progress", "blocked", "waiting"}
KNOWN_STATUS = {"done", "in progress", "to do", "blocked", "waiting"}
KNOWN_PRIORITY = {"highest", "high", "medium", "low"}
HIGH = {"highest", "high"}
PRIORITY_RANK = {"highest": 0, "high": 1, "medium": 2, "low": 3}
ROLLUP_TYPES = {"epic", "feature", "initiative"}
GROUP_AT = 3
OPTIMISTIC = re.compile(r"\b(green|on track|no risks?|no blockers?)\b", re.I)
ONLY_OPEN = re.compile(r"\bonly open\b", re.I)


InputError = extract.InputError


@dataclass
class Evidence:
    source: str
    id: str
    field: str
    value: str

    def to_dict(self) -> dict:
        return asdict(self)


@dataclass
class Finding:
    id: str
    kind: str
    severity: int
    confidence: str
    project: str
    title: str
    summary: str
    blocks_delivery: bool
    suggested_question: str
    evidence: list[Evidence] = field(default_factory=list)

    def to_dict(self) -> dict:
        data = asdict(self)
        data["evidence"] = [e.to_dict() for e in self.evidence]
        return data


@dataclass
class WorkItem:
    key: str
    project: str
    project_name: str
    type: str
    summary: str
    status: str
    priority: str
    assignee: str
    story_points: float | None
    original_estimate: float | None
    remaining: float | None
    percent_complete: float | None
    created: date | None
    updated: date | None
    due: date | None
    parent: str
    blocked_by: str
    comment: str
    row: int


def _clean(value: str | None) -> str:
    return (value or "").strip()


def _parse_date(value: str, label: str, issues: list[str]) -> date | None:
    text = _clean(value)
    if not text:
        return None
    try:
        return datetime.strptime(text, "%Y-%m-%d").date()
    except ValueError:
        issues.append(f"{label} is not YYYY-MM-DD: {text}")
        return None


def _parse_number(value: str, label: str, issues: list[str]) -> float | None:
    text = _clean(value)
    if not text:
        return None
    try:
        return float(text)
    except ValueError:
        issues.append(f"{label} is not a number: {text}")
        return None


def _read_csv(path: Path) -> list[dict[str, str]]:
    with path.open(newline="", encoding="utf-8-sig") as handle:
        return list(csv.DictReader(handle))


def _fmt_date(value: date | None) -> str:
    if value is None:
        return "no date"
    return f"{value.day} {value.strftime('%b %Y')}"


def _fmt_num(value: float | None) -> str:
    if value is None:
        return "blank"
    if float(value).is_integer():
        return str(int(value))
    return f"{value:.1f}"


def _is_done(status: str) -> bool:
    return status.strip().lower() in DONE


def _priority(item: WorkItem) -> str:
    return item.priority.strip().lower()


def _status(item: WorkItem) -> str:
    return item.status.strip().lower()


def _overdue(item: WorkItem, as_of: date) -> bool:
    return item.due is not None and item.due < as_of and not _is_done(item.status)


def _quote(text: str, limit: int = 180) -> str:
    compact = " ".join(text.split())
    if len(compact) > limit:
        compact = compact[: limit - 1].rstrip() + "…"
    return f'"{compact}"'


def load_portfolio(directory: Path) -> dict:
    meta_path = directory / "meta.json"
    items_path = directory / "work_items.csv"
    if not meta_path.is_file() or not items_path.is_file():
        raise InputError(f"{directory} needs meta.json and work_items.csv")

    meta = json.loads(meta_path.read_text(encoding="utf-8"))
    issues: list[str] = []
    as_of = _parse_date(str(meta.get("as_of", "")), "meta.as_of", issues)
    if as_of is None:
        raise InputError("meta.json as_of must be YYYY-MM-DD")
    if not _clean(str(meta.get("portfolio", ""))):
        raise InputError("meta.json portfolio name is required")

    forced, overrides = extract.load_column_map(directory)
    profile = forced or str(meta.get("profile") or "") or None
    if profile is not None and profile not in extract.PROFILES:
        raise InputError(f"meta.json profile must be one of: {', '.join(extract.PROFILES)}")
    headers, _table = extract.read_table(items_path)
    profile = profile or extract.detect_profile(headers)
    mapped = extract.map_work_items(
        items_path,
        profile,
        overrides,
        issues,
        default_project=_clean(str(meta.get("default_project", ""))),
        default_project_name=_clean(str(meta.get("default_project_name", ""))),
    )
    items = [WorkItem(**asdict(item)) for item in mapped]

    def optional(name: str) -> list[dict[str, str]]:
        path = directory / name
        if not path.is_file():
            return []
        return _read_csv(path)

    milestones = []
    for offset, row in enumerate(optional("milestones.csv"), start=2):
        ident = _clean(row.get("id"))
        if not ident:
            issues.append(f"milestones.csv row {offset} has no id")
            continue
        milestones.append(
            {
                "id": ident,
                "project": _clean(row.get("project")),
                "name": _clean(row.get("name")),
                "due": _parse_date(row.get("due", ""), f"{ident} due", issues),
                "status": _clean(row.get("status")),
                "row": offset,
            }
        )

    dependencies = []
    for offset, row in enumerate(optional("dependencies.csv"), start=2):
        ident = _clean(row.get("id"))
        if not ident:
            issues.append(f"dependencies.csv row {offset} has no id")
            continue
        dependencies.append(
            {
                "id": ident,
                "predecessor": _clean(row.get("predecessor")),
                "successor": _clean(row.get("successor")),
                "note": _clean(row.get("note")),
                "row": offset,
            }
        )

    notes = []
    for offset, row in enumerate(optional("notes.csv"), start=2):
        ident = _clean(row.get("id"))
        if not ident:
            issues.append(f"notes.csv row {offset} has no id")
            continue
        notes.append(
            {
                "id": ident,
                "date": _parse_date(row.get("date", ""), f"{ident} date", issues),
                "project": _clean(row.get("project")),
                "author": _clean(row.get("author")),
                "text": _clean(row.get("text")),
                "row": offset,
            }
        )

    previous = []
    previous_path = directory / "previous_work_items.csv"
    if previous_path.is_file():
        for item in extract.map_work_items(previous_path, profile, overrides, issues):
            previous.append(
                {
                    "key": item.key,
                    "project": item.project,
                    "summary": item.summary,
                    "status": item.status,
                    "assignee": item.assignee,
                    "priority": item.priority,
                    "due": item.due.isoformat() if item.due else "",
                    "blocked_by": item.blocked_by,
                    "percent_complete": "" if item.percent_complete is None else _fmt_num(item.percent_complete),
                    "story_points": "" if item.story_points is None else _fmt_num(item.story_points),
                    "remaining": "" if item.remaining is None else _fmt_num(item.remaining),
                    "type": item.type,
                }
            )

    by_key = {item.key: item for item in items}
    for item in items:
        if item.parent and item.parent not in by_key:
            issues.append(f"{item.key} parent {item.parent} is not in the export")
        if item.blocked_by and item.blocked_by not in by_key:
            issues.append(f"{item.key} blocked_by {item.blocked_by} is not in the export")
    known = set(by_key) | {row["id"] for row in milestones}
    for dep in dependencies:
        if dep["predecessor"] not in known:
            issues.append(f"{dep['id']} predecessor {dep['predecessor']} is not in the export")
        if dep["successor"] not in known:
            issues.append(f"{dep['id']} successor {dep['successor']} is not in the export")

    return {
        "meta": meta,
        "as_of": as_of,
        "items": items,
        "by_key": by_key,
        "milestones": milestones,
        "milestone_by_id": {row["id"]: row for row in milestones},
        "dependencies": dependencies,
        "notes": notes,
        "previous": previous,
        "issues": issues,
        "stale_days": int(meta.get("stale_days", 14)),
        "top_n": int(meta.get("top_n", 5)),
        "min_severity": int(meta.get("min_severity", 40)),
        "source_profile": profile,
    }


def _ev(source: str, ident: str, field_name: str, value: object) -> Evidence:
    return Evidence(source, ident, field_name, "" if value is None else str(value))


_NUMBER_FIELDS = {"percent_complete", "story_points", "remaining"}


def _compared_current(item: WorkItem, name: str) -> str:
    if name == "due":
        return item.due.isoformat() if item.due else ""
    if name in _NUMBER_FIELDS:
        value = getattr(item, name)
        return "" if value is None else _fmt_num(value)
    return _clean(str(getattr(item, name) or ""))


def _compared_prior(old: dict, name: str) -> str:
    prior = _clean(old.get(name))
    if name in _NUMBER_FIELDS and prior:
        parsed = _parse_number(prior, name, [])
        if parsed is not None:
            return _fmt_num(parsed)
    return prior


def _item_evidence(item: WorkItem, field_name: str) -> Evidence:
    value = getattr(item, field_name)
    if isinstance(value, float):
        value = _fmt_num(value)
    return _ev("work_items", item.key, field_name, value)


def _and(items: list[str]) -> str:
    if len(items) <= 1:
        return items[0] if items else ""
    if len(items) == 2:
        return f"{items[0]} and {items[1]}"
    return ", ".join(items[:-1]) + f", and {items[-1]}"


def _quoted_comment(text: str) -> str:
    quoted = _quote(text)
    if text.rstrip().endswith((".", "!", "?", "…")):
        return f". The item comment says {quoted}"
    return f". The item comment says {quoted}."


def _project_names(data: dict) -> dict[str, str]:
    names: dict[str, str] = {}
    for item in data["items"]:
        names.setdefault(item.project, item.project_name)
    return names


def _children(data: dict, epic_key: str) -> list[WorkItem]:
    return [item for item in data["items"] if item.parent == epic_key]


def _milestone_done(row: dict) -> bool:
    return row["status"].strip().lower() in {"done", "met", "complete", "closed"}


def _record_done(data: dict, ident: str) -> bool:
    item = data["by_key"].get(ident)
    if item is not None:
        return _is_done(item.status)
    milestone = data["milestone_by_id"].get(ident)
    if milestone is not None:
        return _milestone_done(milestone)
    return False


def _record_overdue(data: dict, ident: str, as_of: date) -> bool:
    item = data["by_key"].get(ident)
    if item is not None:
        return _overdue(item, as_of)
    milestone = data["milestone_by_id"].get(ident)
    if milestone is None or _milestone_done(milestone):
        return False
    if milestone["status"].strip().lower() == "overdue":
        return True
    return milestone["due"] is not None and milestone["due"] < as_of


def _stale(item: WorkItem, as_of: date, stale_days: int) -> bool:
    if _is_done(item.status) or _status(item) not in ACTIVE:
        return False
    if item.updated is None:
        return True
    return (as_of - item.updated).days >= stale_days


def _related_notes(data: dict, project: str, tokens: list[str]) -> list[dict]:
    found = []
    for note in data["notes"]:
        if note["project"] != project:
            continue
        text = note["text"]
        if any(token and token in text for token in tokens):
            found.append(note)
    return found


def _priority_label(finding: Finding) -> str:
    match = re.search(r"\b([A-Za-z]+) priority\b", finding.title)
    return match.group(1) if match else ""


def _collapse_unassigned(findings: list[Finding]) -> list[Finding]:
    grouped: dict[tuple[str, str], list[Finding]] = {}
    rest: list[Finding] = []
    for finding in findings:
        if finding.kind != "unassigned":
            rest.append(finding)
            continue
        grouped.setdefault((finding.project, _priority_label(finding)), []).append(finding)
    collapsed: list[Finding] = []
    for (project, label), items in grouped.items():
        if len(items) < GROUP_AT or not label:
            collapsed.extend(items)
            continue
        ordered = sorted(items, key=lambda finding: (-finding.severity, finding.id))
        keys = [finding.id.split(":", 1)[1] for finding in ordered]
        shown = ", ".join(keys[:8])
        extra = f" and {len(keys) - 8} more" if len(keys) > 8 else ""
        evidence: list[Evidence] = []
        for finding in ordered:
            evidence.extend(finding.evidence)
        collapsed.append(
            Finding(
                id=f"unassigned-count:{project}:{label}",
                kind="unassigned_count",
                severity=ordered[0].severity,
                confidence="fact",
                project=project,
                title=f"{len(items)} {label} priority items have no assignee.",
                summary=(
                    f"{len(items)} open items are {label} priority and the assignee cell is empty: "
                    f"{shown}{extra}."
                ),
                blocks_delivery=False,
                suggested_question=f"Who owns the {len(items)} unassigned {label} priority items?",
                evidence=evidence,
            )
        )
    return rest + collapsed


def _collapse_missing_estimates(findings: list[Finding]) -> list[Finding]:
    grouped: dict[tuple[str, str], list[Finding]] = {}
    rest: list[Finding] = []
    for finding in findings:
        if finding.kind != "missing_estimate":
            rest.append(finding)
            continue
        grouped.setdefault((finding.project, _priority_label(finding)), []).append(finding)
    collapsed: list[Finding] = []
    for (project, label), items in grouped.items():
        if len(items) < GROUP_AT or not label:
            collapsed.extend(items)
            continue
        ordered = sorted(items, key=lambda finding: (-finding.severity, finding.id))
        keys = [finding.id.split(":", 1)[1] for finding in ordered]
        shown = ", ".join(keys[:8])
        extra = f" and {len(keys) - 8} more" if len(keys) > 8 else ""
        evidence: list[Evidence] = []
        for finding in ordered:
            evidence.extend(finding.evidence)
        collapsed.append(
            Finding(
                id=f"missing-estimate-count:{project}:{label}",
                kind="missing_estimate_count",
                severity=ordered[0].severity,
                confidence="fact",
                project=project,
                title=f"{len(items)} {label} priority items have no estimate.",
                summary=(
                    f"{len(items)} open items are {label} priority and the story point or effort cell is empty: "
                    f"{shown}{extra}."
                ),
                blocks_delivery=False,
                suggested_question=f"What is the estimate on the {len(items)} {label} priority items?",
                evidence=evidence,
            )
        )
    return rest + collapsed


def _progress_record(kind: str, ident: str, name: str, project: str, items: list[WorkItem]) -> dict | None:
    counted = [item for item in items if item.story_points is not None]
    omitted = [item for item in items if item.story_points is None]
    paired = [
        item
        for item in items
        if item.original_estimate is not None and item.remaining is not None
    ]
    if not counted and not paired:
        return None
    done_points = sum(item.story_points or 0 for item in counted if _is_done(item.status))
    total_points = sum(item.story_points or 0 for item in counted)
    parts = []
    percent = None
    if total_points > 0:
        percent = round(done_points / total_points * 100)
        parts.append(
            f"{_fmt_num(done_points)} of {_fmt_num(total_points)} story points are Done ({percent}%)."
        )
    if omitted:
        noun = "item has" if len(omitted) == 1 else "items have"
        parts.append(f"{len(omitted)} {noun} no story point or effort.")
    if paired:
        remaining_sum = sum(item.remaining or 0 for item in paired)
        original_sum = sum(item.original_estimate or 0 for item in paired)
        parts.append(
            f"Remaining {_fmt_num(remaining_sum)}, original estimate {_fmt_num(original_sum)}."
        )
    evidence = []
    for item in sorted(counted, key=lambda item: item.key):
        evidence.extend(
            [
                _item_evidence(item, "status").to_dict(),
                _item_evidence(item, "story_points").to_dict(),
            ]
        )
    for item in sorted(omitted, key=lambda item: item.key):
        evidence.append(_item_evidence(item, "story_points").to_dict())
    for item in sorted(paired, key=lambda item: item.key):
        evidence.extend(
            [
                _item_evidence(item, "remaining").to_dict(),
                _item_evidence(item, "original_estimate").to_dict(),
            ]
        )
    return {
        "kind": kind,
        "id": ident,
        "name": name,
        "project": project,
        "text": " ".join(parts),
        "percent": percent,
        "evidence": evidence,
    }


def _portfolio_progress(data: dict, names: dict[str, str]) -> list[dict]:
    rows = []
    for project in sorted(names):
        leaves = [
            item
            for item in data["items"]
            if item.project == project and item.type.strip().lower() not in ROLLUP_TYPES
        ]
        record = _progress_record("project", project, names[project], project, leaves)
        if record:
            rows.append(record)
        parents = [
            item
            for item in data["items"]
            if item.project == project and item.type.strip().lower() in ROLLUP_TYPES
        ]
        for parent in sorted(parents, key=lambda item: item.key):
            record = _progress_record(
                parent.type.strip().lower(),
                parent.key,
                parent.summary,
                project,
                _children(data, parent.key),
            )
            if record:
                rows.append(record)
    return rows


def _span(start: date, end: date) -> str:
    if start.year == end.year and start.month == end.month:
        return f"{start.day}–{end.day} {end.strftime('%b %Y')}"
    return f"{_fmt_date(start)} – {_fmt_date(end)}"


def _line(ident: str, text: str, evidence: list[Evidence]) -> dict:
    return {"id": ident, "text": text, "evidence": [item.to_dict() for item in evidence]}


def _change_fields(change: dict) -> dict[str, dict]:
    return {field["field"]: field for field in change["fields"]}


def _moved(before: str, after: str) -> str:
    return f"{before or 'blank'} → {after or 'blank'}"


def _build_reading(
    data: dict,
    names: dict[str, str],
    projects: list[dict],
    progress: list[dict],
    changes: list[dict],
    findings: list[Finding],
) -> dict:
    """A week reading from cells already in the export. Not a forecast."""
    as_of: date = data["as_of"]
    this_start, this_end = as_of, as_of + timedelta(days=6)
    next_start, next_end = as_of + timedelta(days=7), as_of + timedelta(days=13)
    horizon = as_of + timedelta(days=13)
    by_key: dict[str, WorkItem] = data["by_key"]

    by_change = {change["key"]: change for change in changes}
    closed = []
    for change in changes:
        status = _change_fields(change).get("status")
        if status and not _is_done(status["before"]) and _is_done(status["after"]):
            closed.append(change)

    def tight(before: str, after: str) -> str:
        return f"{before}→{after}"

    def day(value: date | None) -> str:
        if value is None:
            return "no date"
        if value.year == as_of.year:
            return f"{value.day} {value.strftime('%b')}"
        return _fmt_date(value)

    progress_lines: list[dict] = []
    if not data["previous"]:
        progress_lines.append(_line("progress:no-previous", "No previous export.", []))
    elif not closed:
        progress_lines.append(_line("progress:none-closed", "Nothing.", []))
    else:
        evidence = []
        points = 0.0
        counted = False
        keys = []
        for change in closed:
            item = by_key[change["key"]]
            keys.append(item.key)
            evidence.append(_item_evidence(item, "status"))
            if item.story_points is not None:
                points += item.story_points
                counted = True
                evidence.append(_item_evidence(item, "story_points"))
        if len(closed) == 1:
            item = by_key[closed[0]["key"]]
            text = f"{item.key}, {_fmt_num(item.story_points)} points." if item.story_points is not None else f"{item.key}."
        else:
            point_bit = f", {_fmt_num(points)} points" if counted else ""
            shown = ", ".join(keys[:3])
            more = f" +{len(keys) - 3}" if len(keys) > 3 else ""
            text = f"{len(closed)}{point_bit}: {shown}{more}."
        progress_lines.append(_line("progress:closed", text, evidence))

    def _fragment(change: dict) -> tuple[int, str, str, list[Evidence]] | None:
        fields = _change_fields(change)
        item = by_key.get(change["key"])
        if "key" in fields and fields["key"]["after"] == "removed":
            return 0, "scope", f"{change['key']} dropped out", []
        if item is None:
            return None
        if "key" in fields and fields["key"]["after"] == "added":
            return 0, "scope", f"{item.key} is new", [_item_evidence(item, "status")]
        status = fields.get("status")
        if status and not _is_done(status["before"]) and _is_done(status["after"]):
            return None
        bits: list[str] = []
        evidence: list[Evidence] = []
        rank = 5
        if "assignee" in fields:
            before, after = fields["assignee"]["before"], fields["assignee"]["after"]
            if after == "blank" and before != "blank":
                bits.append(f"lost {before}")
                rank = min(rank, 0)
            else:
                bits.append(f"owner {tight(before, after)}")
                rank = min(rank, 3)
            evidence.append(_item_evidence(item, "assignee"))
        if "story_points" in fields:
            bits.append(f"estimate {tight(fields['story_points']['before'], fields['story_points']['after'])}")
            rank = min(rank, 2)
            evidence.append(_item_evidence(item, "story_points"))
        if "remaining" in fields:
            before_n = _parse_number(fields["remaining"]["before"], "before", [])
            after_n = _parse_number(fields["remaining"]["after"], "after", [])
            grew = before_n is not None and after_n is not None and after_n > before_n
            bits.append(f"remaining {tight(fields['remaining']['before'], fields['remaining']['after'])}")
            rank = min(rank, 1 if grew else 4)
            evidence.append(_item_evidence(item, "remaining"))
        if "due" in fields:
            bits.append(f"due {tight(fields['due']['before'], fields['due']['after'])}")
            rank = min(rank, 3)
            evidence.append(_item_evidence(item, "due"))
        if "blocked_by" in fields:
            bits.append(f"blocker {tight(fields['blocked_by']['before'], fields['blocked_by']['after'])}")
            rank = min(rank, 1)
            evidence.append(_item_evidence(item, "blocked_by"))
        if "priority" in fields:
            bits.append(f"priority {tight(fields['priority']['before'], fields['priority']['after'])}")
            rank = min(rank, 3)
            evidence.append(_item_evidence(item, "priority"))
        if "percent_complete" in fields:
            bits.append(f"percent {tight(fields['percent_complete']['before'], fields['percent_complete']['after'])}")
            rank = min(rank, 4)
            evidence.append(_item_evidence(item, "percent_complete"))
        if status:
            bits.append(tight(status["before"], status["after"]))
            rank = min(rank, 4)
            evidence.append(_item_evidence(item, "status"))
        if not bits:
            return None
        return rank, "drift", f"{item.key} " + ", ".join(bits), evidence

    changed: list[dict] = []
    if not data["previous"]:
        changed.append(_line("change:no-previous", "No previous export.", []))
    elif not changes:
        changed.append(_line("change:same", "No change.", []))
    else:
        pieces = []
        for change in changes:
            got = _fragment(change)
            if got is not None:
                pieces.append(got)
        if not pieces:
            changed.append(_line("change:only-closed", "Only the close.", []))
        else:
            pieces.sort(key=lambda row: (row[0], row[2]))
            scope = [text for _rank, kind, text, _evidence in pieces if kind == "scope"]
            drift = [text for _rank, kind, text, _evidence in pieces if kind == "drift"]
            evidence = [piece for _rank, _kind, _text, group in pieces for piece in group]
            parts = []
            if scope:
                parts.append(". ".join(scope))
            if drift:
                parts.append(". ".join(drift))
            changed.append(_line("change:drift", ". ".join(parts) + ".", evidence))

    def _remaining_pressure(item: WorkItem) -> tuple[str, str] | None:
        change = by_change.get(item.key)
        remaining = _change_fields(change).get("remaining") if change else None
        if remaining is not None:
            before_n = _parse_number(remaining["before"], "before", [])
            after_n = _parse_number(remaining["after"], "after", [])
            if before_n is not None and after_n is not None and after_n > before_n:
                return "grew", tight(remaining["before"], remaining["after"])
        if (
            item.remaining is not None
            and item.original_estimate is not None
            and item.remaining > item.original_estimate
        ):
            return "above", f"{_fmt_num(item.remaining)} vs {_fmt_num(item.original_estimate)}"
        return None

    clear_bits: list[str] = []
    grew_bits: list[str] = []
    above_bits: list[str] = []
    blocked_bits: list[str] = []
    unowned_bits: list[str] = []
    coming_evidence: list[Evidence] = []
    next_items = [
        item
        for item in data["items"]
        if not _is_done(item.status)
        and item.type.strip().lower() not in ROLLUP_TYPES
        and item.due is not None
        and next_start <= item.due <= next_end
    ]
    next_items.sort(key=lambda item: (item.due or date.max, item.key))
    for item in next_items:
        evidence = [_item_evidence(item, "due"), _item_evidence(item, "status"), _item_evidence(item, "assignee")]
        pressure = _remaining_pressure(item)
        if pressure:
            evidence.extend([_item_evidence(item, "remaining"), _item_evidence(item, "original_estimate")])
        if item.blocked_by:
            evidence.append(_item_evidence(item, "blocked_by"))
            blocked_bits.append(f"{item.key} by {item.blocked_by}")
        elif not item.assignee:
            unowned_bits.append(f"{item.key} {day(item.due)}")
        elif pressure:
            kind, label = pressure
            (grew_bits if kind == "grew" else above_bits).append(f"{item.key} {label}")
        else:
            clear_bits.append(f"{item.key} {item.assignee}")
        coming_evidence.extend(evidence)
    milestone_bits: list[str] = []
    for milestone in sorted(data["milestones"], key=lambda row: (row["due"] or date.max, row["id"])):
        due = milestone["due"]
        if due is None or _milestone_done(milestone) or not (next_start <= due <= next_end):
            continue
        milestone_bits.append(f"{milestone['name']} {day(due)}")
        coming_evidence.extend(
            [
                _ev("milestones", milestone["id"], "due", milestone["due"]),
                _ev("milestones", milestone["id"], "status", milestone["status"]),
            ]
        )
    coming_bits: list[str] = []
    if not next_items and not milestone_bits:
        coming_bits.append("Nothing dated")
    else:
        if clear_bits:
            coming_bits.append("Ready " + ", ".join(clear_bits))
        if grew_bits:
            coming_bits.append("Remaining up " + ", ".join(grew_bits))
        if above_bits:
            coming_bits.append("Over estimate " + ", ".join(above_bits))
        if blocked_bits:
            coming_bits.append("Blocked " + ", ".join(blocked_bits))
        if milestone_bits:
            coming_bits.append(", ".join(milestone_bits) + ", milestone")
        if unowned_bits:
            coming_bits.append(", ".join(unowned_bits) + ", no owner")
    coming = [_line("coming:read", ". ".join(coming_bits) + ".", coming_evidence)]

    forward: dict[str, list[str]] = {}
    for dep in data["dependencies"]:
        forward.setdefault(dep["predecessor"], []).append(dep["successor"])

    def _open_id(ident: str) -> bool:
        item = by_key.get(ident)
        if item is not None:
            return not _is_done(item.status)
        milestone = data["milestone_by_id"].get(ident)
        return milestone is not None and not _milestone_done(milestone)

    def _in_play(ident: str) -> bool:
        item = by_key.get(ident)
        if item is not None:
            if _is_done(item.status):
                return False
            return item.due is None or item.due <= horizon or _overdue(item, as_of)
        milestone = data["milestone_by_id"].get(ident)
        if milestone is None or _milestone_done(milestone):
            return False
        due = milestone["due"]
        return due is not None and due <= horizon

    held_by_open: set[str] = set()
    for pred, succs in forward.items():
        if not _open_id(pred):
            continue
        for succ in succs:
            if _open_id(succ):
                held_by_open.add(succ)

    def _walk(ident: str, seen: set[str]) -> list:
        if ident in seen or not _in_play(ident):
            return []
        seen.add(ident)
        item = by_key.get(ident)
        nodes: list = [item] if item is not None else [data["milestone_by_id"][ident]]
        for succ in forward.get(ident, []):
            nodes.extend(_walk(succ, seen))
        return nodes

    def _chain_phrase(nodes: list) -> str:
        work = [node for node in nodes if not isinstance(node, dict)]
        milestones = [node for node in nodes if isinstance(node, dict)]
        unowned = [item for item in work if not item.assignee]
        mark_each = len(unowned) != len(work)

        def work_bit(item: WorkItem) -> str:
            if mark_each and not item.assignee:
                return f"{item.key} (no owner)"
            return item.key

        if len(work) == 1 and not milestones:
            item = work[0]
            why = []
            if not item.assignee:
                why.append("no owner")
            if item.blocked_by:
                why.append(f"blocked by {item.blocked_by}")
            return item.key + (", " + ", ".join(why) if why else "")
        parts = [work_bit(item) for item in work]
        for row in milestones:
            parts.append(f"{row['name']} {day(row['due'])}" if row["due"] else row["name"])
        text = " → ".join(parts)
        if len(work) > 1 and unowned and len(unowned) == len(work):
            text += ", no owners"
        return text

    def _chain_evidence(nodes: list) -> list[Evidence]:
        evidence: list[Evidence] = []
        ids: set[str] = set()
        for node in nodes:
            if isinstance(node, dict):
                ids.add(node["id"])
                evidence.extend(
                    [
                        _ev("milestones", node["id"], "due", node["due"]),
                        _ev("milestones", node["id"], "status", node["status"]),
                    ]
                )
            else:
                ids.add(node.key)
                evidence.extend(
                    [
                        _item_evidence(node, "summary"),
                        _item_evidence(node, "due"),
                        _item_evidence(node, "status"),
                        _item_evidence(node, "assignee"),
                        _item_evidence(node, "priority"),
                    ]
                )
                if node.blocked_by:
                    evidence.append(_item_evidence(node, "blocked_by"))
        for dep in data["dependencies"]:
            if dep["predecessor"] in ids and dep["successor"] in ids:
                evidence.extend(
                    [
                        _ev("dependencies", dep["id"], "predecessor", dep["predecessor"]),
                        _ev("dependencies", dep["id"], "successor", dep["successor"]),
                    ]
                )
        return evidence

    def _this_window(item: WorkItem) -> bool:
        return _overdue(item, as_of) or (item.due is not None and this_start <= item.due <= this_end)

    roots = []
    for item in data["items"]:
        if _is_done(item.status) or item.key in held_by_open or not _this_window(item):
            continue
        blocks = any(_in_play(succ) for succ in forward.get(item.key, []))
        if _priority(item) == "highest" or item.blocked_by or blocks:
            roots.append(item)
    roots.sort(key=lambda item: (item.due or date.min, item.key))
    chains = []
    chained: set[str] = set()
    for root in roots:
        if root.key in chained:
            continue
        nodes = _walk(root.key, set())
        if not nodes:
            continue
        worth = any(
            isinstance(node, dict) or _priority(node) == "highest" or node.blocked_by or _overdue(node, as_of)
            for node in nodes
        )
        if not worth:
            continue
        for node in nodes:
            chained.add(node["id"] if isinstance(node, dict) else node.key)
        chains.append(nodes)

    priorities: list[dict] = []
    phrases = [_chain_phrase(nodes) for nodes in chains]
    priority_evidence = [piece for nodes in chains for piece in _chain_evidence(nodes)]
    later = [
        item
        for item in data["items"]
        if not _is_done(item.status) and _priority(item) == "highest" and item.key not in chained
    ]
    later.sort(key=lambda item: (item.due or date.max, item.key))
    if later:
        grouped: dict[date | None, list[WorkItem]] = {}
        for item in later:
            grouped.setdefault(item.due, []).append(item)
        parts = []
        evidence = []
        for due in sorted(grouped, key=lambda value: value or date.max):
            group = grouped[due]
            when = day(due) if due else "no date"
            if len(group) == 1:
                item = group[0]
                extra = []
                if not item.assignee:
                    extra.append("no owner")
                if item.story_points is None:
                    extra.append("no estimate")
                tail = " " + " ".join(extra) if extra else ""
                parts.append(f"{item.key}{tail} {when}")
            else:
                extra = []
                if all(not item.assignee for item in group):
                    extra.append("no owner")
                elif any(not item.assignee for item in group):
                    extra.append(", ".join(item.key for item in group if not item.assignee) + " no owner")
                if all(item.story_points is None for item in group):
                    extra.append("no estimate")
                elif any(item.story_points is None for item in group):
                    extra.append(", ".join(item.key for item in group if item.story_points is None) + " no estimate")
                tail = " " + " ".join(extra) if extra else ""
                parts.append(f"{', '.join(item.key for item in group)}{tail} {when}")
            for item in group:
                evidence.extend(
                    [
                        _item_evidence(item, "priority"),
                        _item_evidence(item, "due"),
                        _item_evidence(item, "assignee"),
                        _item_evidence(item, "story_points"),
                    ]
                )
        phrases.append(("Later: " if phrases else "") + "; ".join(parts))
        priority_evidence.extend(evidence)
    if phrases:
        priorities.append(_line("priority:late", ". ".join(phrases) + ".", priority_evidence))
    else:
        priorities.append(_line("priority:none", "None.", []))
    mentioned_milestones = {node["id"] for nodes in chains for node in nodes if isinstance(node, dict)}

    delay: list[dict] = []
    for milestone in sorted(data["milestones"], key=lambda row: (row["due"] or date.max, row["id"])):
        due = milestone["due"]
        if due is None or _milestone_done(milestone) or due > horizon or milestone["id"] in mentioned_milestones:
            continue
        for dep in data["dependencies"]:
            if dep["successor"] != milestone["id"]:
                continue
            pred = by_key.get(dep["predecessor"])
            if pred is None or _is_done(pred.status):
                continue
            blocker = by_key.get(pred.blocked_by) if pred.blocked_by else None
            pressed = (
                _overdue(pred, as_of)
                or _status(pred) == "blocked"
                or not pred.assignee
                or (blocker is not None and (_overdue(blocker, as_of) or not blocker.assignee))
            )
            if not pressed:
                continue
            evidence = [
                _ev("milestones", milestone["id"], "due", milestone["due"]),
                _ev("dependencies", dep["id"], "predecessor", dep["predecessor"]),
                _ev("dependencies", dep["id"], "successor", dep["successor"]),
                _item_evidence(pred, "status"),
                _item_evidence(pred, "due"),
            ]
            if blocker is None:
                who = "" if pred.assignee else " no owner"
                text = f"{milestone['name']} {day(due)} behind {pred.key}{who}"
            else:
                evidence.extend(
                    [
                        _item_evidence(pred, "blocked_by"),
                        _item_evidence(blocker, "status"),
                        _item_evidence(blocker, "assignee"),
                        _item_evidence(blocker, "due"),
                    ]
                )
                who = "" if blocker.assignee else " no owner"
                text = f"{milestone['name']} {day(due)} behind {blocker.key}{who}"
            delay.append(_line(f"delay:milestone:{milestone['id']}", text, evidence))
    for finding in findings:
        if finding.kind == "note_conflict":
            overdue = [
                item
                for item in data["items"]
                if item.project == finding.project and _overdue(item, as_of) and item.type.strip().lower() != "epic"
            ]
            newest = max((item.updated for item in overdue if item.updated), default=None)
            keys = _and([item.key for item in sorted(overdue, key=lambda item: item.key)[:4]])
            note = next((piece for piece in finding.evidence if piece.source == "notes"), None)
            note_id = note.id if note else "A note"
            gap = (as_of - newest).days if newest is not None else None
            age = f", {gap}d" if gap is not None else ""
            delay.append(_line(f"delay:{finding.id}", f"{note_id} vs {keys}{age}", list(finding.evidence)))
        elif finding.kind == "misleading_completion":
            note = next((piece for piece in finding.evidence if piece.source == "notes" and ONLY_OPEN.search(piece.value)), None)
            match = re.search(r"(\d+(?:\.\d+)?)% complete; (\S+) of (\S+) story points", finding.title)
            text = f"{match.group(1)}% is {match.group(2)}/{match.group(3)}" if match else finding.title
            if note:
                text += f". {note.id}: one item"
            delay.append(_line(f"delay:{finding.id}", text, list(finding.evidence)))
    if not delay:
        delay.append(_line("delay:none", "None.", []))
    elif len(delay) > 1:
        delay = [
            {
                "id": "delay:read",
                "text": ". ".join(row["text"].rstrip(".") for row in delay) + ".",
                "evidence": [piece for row in delay for piece in row["evidence"]],
            }
        ]
    elif not delay[0]["text"].endswith("."):
        delay[0]["text"] += "."

    return {
        "this_week": [this_start.isoformat(), this_end.isoformat()],
        "next_week": [next_start.isoformat(), next_end.isoformat()],
        "progress": progress_lines,
        "changed": changed,
        "coming": coming,
        "priorities": priorities,
        "delay_risks": delay,
    }


FLOW_WEEKS = 8
FLOW_SKIP = ROLLUP_TYPES | {"decision"}


def _flow_leaf(type_name: str) -> bool:
    return type_name.strip().lower() not in FLOW_SKIP


def _percentile_rank(count: int, percent: int) -> int:
    return (percent * count + 99) // 100


def _build_flow(data: dict, names: dict[str, str]) -> dict:
    """Counts a table can hold. Weeks come from dates already on the rows."""
    as_of: date = data["as_of"]
    ends = [as_of - timedelta(days=7 * (FLOW_WEEKS - 1 - index)) for index in range(FLOW_WEEKS)]

    def bucket(updated: date | None) -> int | None:
        if updated is None or updated > as_of:
            return None
        index = FLOW_WEEKS - 1 - (as_of - updated).days // 7
        if index < 0:
            return None
        return index

    def pack(ident: str, label: str, items: list[WorkItem], previous: list[dict] | None) -> dict:
        weekly = [0] * FLOW_WEEKS
        latest: list[WorkItem] = []
        for item in items:
            if not _is_done(item.status):
                continue
            index = bucket(item.updated)
            if index is None:
                continue
            weekly[index] += 1
            if index == FLOW_WEEKS - 1:
                latest.append(item)
        since = []
        previous_by_key = {row.get("key"): row for row in previous} if previous is not None else {}
        if previous is not None:
            for item in items:
                if not _is_done(item.status):
                    continue
                prior = previous_by_key.get(item.key)
                if prior is None or not _is_done(str(prior.get("status", ""))):
                    since.append(item)
        open_items = [item for item in items if not _is_done(item.status)]
        wip_previous = None
        if previous is not None:
            wip_previous = sum(
                1
                for row in previous
                if not _is_done(str(row.get("status", ""))) and _flow_leaf(str(row.get("type", "")))
            )
        cycles = [
            ((item.updated - item.created).days, item)
            for item in items
            if _is_done(item.status) and item.created is not None and item.updated is not None and item.updated >= item.created
        ]
        cycles.sort(key=lambda pair: (pair[0], pair[1].key))
        p85_days = None
        p85_item = None
        if cycles:
            p85_days, p85_item = cycles[_percentile_rank(len(cycles), 85) - 1]
        since_points = sum(item.story_points or 0 for item in since)
        since_has_points = any(item.story_points is not None for item in since)
        evidence: list[Evidence] = []
        for item in since:
            evidence.extend([_item_evidence(item, "status"), _item_evidence(item, "updated")])
            if item.story_points is not None:
                evidence.append(_item_evidence(item, "story_points"))
        for item in latest:
            evidence.extend([_item_evidence(item, "status"), _item_evidence(item, "updated"), _item_evidence(item, "type")])
        for item in open_items:
            evidence.append(_item_evidence(item, "status"))
        if p85_item is not None:
            evidence.extend([_item_evidence(p85_item, "created"), _item_evidence(p85_item, "updated")])
        return {
            "id": ident,
            "name": label,
            "closed": len(since) if previous is not None else None,
            "closed_points": since_points if since_has_points else None,
            "wip": len(open_items),
            "wip_previous": wip_previous,
            "p85_days": p85_days,
            "p85_n": len(cycles),
            "p85_key": p85_item.key if p85_item is not None else "",
            "weekly": weekly,
            "evidence": [item.to_dict() for item in evidence],
        }

    leaves = [item for item in data["items"] if _flow_leaf(item.type)]
    previous = data["previous"] if data["previous"] else None
    rows = [pack("all", "All", leaves, previous)]
    for project in sorted(names):
        project_previous = None
        if previous is not None:
            project_previous = [row for row in previous if row.get("project") == project]
        rows.append(
            pack(
                project,
                names[project].split(" — ")[0].split(" - ")[0],
                [item for item in leaves if item.project == project],
                project_previous,
            )
        )
    scale = max((value for row in rows for value in row["weekly"]), default=0)
    return {
        "week_ends": [day.isoformat() for day in ends],
        "scale": scale,
        "rows": rows,
    }


def _file_limits(items: list[WorkItem]) -> list[str]:
    open_items = [item for item in items if not _is_done(item.status)]
    if not open_items:
        return []
    limits = []
    if not any(item.due for item in open_items):
        limits.append("no due dates, so lateness is left out")
    unknown_priority = []
    seen: set[str] = set()
    for item in open_items:
        label = item.priority.strip()
        token = label.casefold()
        if label and token not in KNOWN_PRIORITY and token not in seen:
            seen.add(token)
            unknown_priority.append(label)
    if unknown_priority:
        limits.append("unrecognized priority: " + ", ".join(unknown_priority[:6]))
    elif not any(item.priority.strip() for item in open_items):
        limits.append("no priority")
    counts: dict[str, int] = {}
    for item in open_items:
        if item.status.strip().lower() not in KNOWN_STATUS:
            counts[item.status] = counts.get(item.status, 0) + 1
    if counts:
        parts = [
            f"{count} {name}"
            for name, count in sorted(counts.items(), key=lambda pair: (-pair[1], pair[0]))[:4]
        ]
        limits.append("unrecognized status: " + ", ".join(parts))
    if not any(item.story_points is not None for item in items):
        limits.append("no story points")
    return limits


def _rules_could_not_run(items: list[WorkItem], project: str) -> bool:
    open_items = [item for item in items if item.project == project and not _is_done(item.status)]
    if not open_items:
        return False
    ranked = any(item.priority.strip().casefold() in KNOWN_PRIORITY for item in open_items)
    dated = any(item.due for item in open_items)
    return not ranked and not dated


def _optimistic_notes(data: dict, project: str) -> list[dict]:
    return [
        note
        for note in data["notes"]
        if note["project"] == project and OPTIMISTIC.search(note["text"])
    ]


def analyse(data: dict) -> dict:
    as_of: date = data["as_of"]
    names = _project_names(data)
    findings: list[Finding] = []
    set_aside: list[Finding] = []
    covered: set[str] = set()

    for project in names:
        notes = _optimistic_notes(data, project)
        if not notes:
            continue
        stale_items = [item for item in data["items"] if item.project == project and _stale(item, as_of, data["stale_days"])]
        overdue_items = [item for item in data["items"] if item.project == project and _overdue(item, as_of)]
        if not stale_items and not overdue_items:
            continue
        note = notes[0]
        focus = []
        seen: set[str] = set()
        for item in overdue_items + stale_items:
            if item.key in seen or item.type.strip().lower() == "epic":
                continue
            seen.add(item.key)
            focus.append(item)
        if not focus:
            focus = overdue_items or stale_items
        covered.update(item.key for item in focus)
        newest = max((item.updated for item in focus if item.updated), default=None)
        overdue_keys = [item.key for item in focus if _overdue(item, as_of)]
        detail = ", ".join(
            f"{item.key} due {_fmt_date(item.due)}, updated {_fmt_date(item.updated)}"
            for item in focus
        )
        overdue_clause = (
            f"{_and(overdue_keys)} {'is' if len(overdue_keys) == 1 else 'are'} already overdue. "
            if overdue_keys
            else ""
        )
        findings.append(
            Finding(
                id=f"note_conflict:{note['id']}",
                kind="note_conflict",
                severity=86 if overdue_keys else 76,
                confidence="inference",
                project=project,
                title=f"{names[project]} is described as on track, but the export disagrees.",
                summary=(
                    f"{note['id']} on {_fmt_date(note['date'])} says the work is on track. "
                    f"{overdue_clause}"
                    f"The newest update among these open items is {_fmt_date(newest)}. {detail}."
                ),
                blocks_delivery=False,
                suggested_question=(
                    f"What changed on {names[project]} after {_fmt_date(newest)}? "
                    f"{note['id']} and the work-item export disagree."
                ),
                evidence=[
                    _ev("notes", note["id"], "text", note["text"]),
                    _ev("notes", note["id"], "date", note["date"]),
                    *[
                        piece
                        for item in focus
                        for piece in (
                            _item_evidence(item, "status"),
                            _item_evidence(item, "updated"),
                            _item_evidence(item, "due"),
                        )
                    ],
                ],
            )
        )

    for item in data["items"]:
        if item.key in covered or _is_done(item.status):
            continue
        if item.type.strip().lower() == "decision" or _status(item) == "waiting":
            continue
        if _priority(item) not in HIGH or item.assignee:
            continue
        overdue = _overdue(item, as_of)
        imminent = item.due is not None and 0 <= (item.due - as_of).days <= 7
        if overdue:
            severity = 90
            when = f"due {_fmt_date(item.due)} (before this report)"
        elif imminent:
            severity = 82
            when = f"due {_fmt_date(item.due)}"
        else:
            severity = 74
            when = f"due {_fmt_date(item.due)}" if item.due else "with no due date"
        comment = _quoted_comment(item.comment) if item.comment else ""
        evidence = [
            _item_evidence(item, "assignee"),
            _item_evidence(item, "priority"),
            _item_evidence(item, "status"),
            _item_evidence(item, "due"),
        ]
        if item.comment:
            evidence.append(_item_evidence(item, "comment"))
        findings.append(
            Finding(
                id=f"unassigned:{item.key}",
                kind="unassigned",
                severity=severity,
                confidence="fact",
                project=item.project,
                title=f"{item.key} is {item.priority} priority, open, and has no assignee.",
                summary=(
                    f"{item.key} ({item.summary}) is {item.status}, {when}, "
                    f"and the assignee cell is empty{comment or '.'}"
                ),
                blocks_delivery=False,
                suggested_question=f"Who owns {item.key} ({item.summary})?",
                evidence=evidence,
            )
        )
        covered.add(item.key)

    for project in names:
        if _optimistic_notes(data, project):
            continue
        for item in data["items"]:
            if item.project != project or item.key in covered or _is_done(item.status):
                continue
            if item.type.strip().lower() in {"decision", "epic"} or _status(item) == "waiting":
                continue
            overdue = _overdue(item, as_of)
            stale = item.updated is not None and _stale(item, as_of, data["stale_days"])
            if not overdue and not stale:
                continue
            if overdue:
                findings.append(
                    Finding(
                        id=f"overdue:{item.key}",
                        kind="overdue",
                        severity=64,
                        confidence="fact",
                        project=item.project,
                        title=f"{item.key} is overdue and still {item.status}.",
                        summary=(
                            f"{item.key} ({item.summary}) is {item.status}, due {_fmt_date(item.due)}, "
                            f"and the assignee is {item.assignee or 'blank'}."
                        ),
                        blocks_delivery=False,
                        suggested_question=f"What is keeping {item.key} ({item.summary}) open past {_fmt_date(item.due)}?",
                        evidence=[
                            _item_evidence(item, "status"),
                            _item_evidence(item, "due"),
                            _item_evidence(item, "assignee"),
                        ],
                    )
                )
            else:
                findings.append(
                    Finding(
                        id=f"stale:{item.key}",
                        kind="stale",
                        severity=58,
                        confidence="fact",
                        project=item.project,
                        title=f"{item.key} is {item.status} and has not been updated since {_fmt_date(item.updated)}.",
                        summary=(
                            f"{item.key} ({item.summary}) is {item.status}. "
                            f"The newest update is {_fmt_date(item.updated)}."
                        ),
                        blocks_delivery=False,
                        suggested_question=f"What moved on {item.key} ({item.summary}) since {_fmt_date(item.updated)}?",
                        evidence=[
                            _item_evidence(item, "status"),
                            _item_evidence(item, "updated"),
                            _item_evidence(item, "assignee"),
                        ],
                    )
                )
            covered.add(item.key)

    for item in data["items"]:
        if _status(item) != "blocked" or _is_done(item.status):
            continue
        blocker = data["by_key"].get(item.blocked_by) if item.blocked_by else None
        evidence = [_item_evidence(item, "status"), _item_evidence(item, "blocked_by")]
        if blocker is None:
            findings.append(
                Finding(
                    id=f"blocked:{item.key}",
                    kind="blocked",
                    severity=68,
                    confidence="fact",
                    project=item.project,
                    title=f"{item.key} is blocked and names no open blocker.",
                    summary=f"{item.key} ({item.summary}) is Blocked and blocked_by is empty or unknown.",
                    blocks_delivery=True,
                    suggested_question=f"What is {item.key} waiting on?",
                    evidence=evidence,
                )
            )
            covered.add(item.key)
            continue
        evidence.extend(
            [
                _item_evidence(blocker, "status"),
                _item_evidence(blocker, "assignee"),
                _item_evidence(blocker, "due"),
            ]
        )
        if _is_done(blocker.status):
            findings.append(
                Finding(
                    id=f"blocked:{item.key}",
                    kind="blocker_finished",
                    severity=48,
                    confidence="fact",
                    project=item.project,
                    title=f"{item.key} is still blocked by {blocker.key}, which is already {blocker.status}.",
                    summary=(
                        f"{item.key} ({item.summary}) points at {blocker.key}, "
                        f"and that item is {blocker.status}."
                    ),
                    blocks_delivery=False,
                    suggested_question=f"Can {item.key} leave Blocked now that {blocker.key} is {blocker.status}?",
                    evidence=evidence,
                )
            )
            covered.add(item.key)
            continue
        severity = 70
        qualifier = []
        if _overdue(blocker, as_of) or not blocker.assignee:
            severity = 85
        if _overdue(blocker, as_of):
            qualifier.append(f"overdue ({_fmt_date(blocker.due)})")
        if not blocker.assignee:
            qualifier.append("unassigned")
        qualifier_text = " and ".join(qualifier) if qualifier else "still open"
        milestone_bits = []
        for dep in data["dependencies"]:
            if dep["predecessor"] != item.key:
                continue
            milestone = data["milestone_by_id"].get(dep["successor"])
            if milestone is None or _milestone_done(milestone):
                continue
            evidence.append(_ev("dependencies", dep["id"], "successor", dep["successor"]))
            evidence.append(_ev("milestones", milestone["id"], "due", milestone["due"]))
            milestone_bits.append(f"{milestone['name']} ({milestone['id']}) is due {_fmt_date(milestone['due'])}")
        milestone_text = (" " + " ".join(milestone_bits) + ".") if milestone_bits else ""
        findings.append(
            Finding(
                id=f"blocked:{item.key}",
                kind="blocked",
                severity=severity,
                confidence="fact",
                project=item.project,
                title=f"{item.key} is blocked by {blocker.key}, which is {qualifier_text}.",
                summary=(
                    f"{item.key} ({item.summary}) is Blocked by {blocker.key} ({blocker.summary}). "
                    f"{blocker.key} is {blocker.status}"
                    + (f", {qualifier_text}" if qualifier else "")
                    + f".{milestone_text}"
                ),
                blocks_delivery=True,
                suggested_question=(
                    f"Does the dependent milestone still hold while {item.key} is blocked by {blocker.key}?"
                ),
                evidence=evidence,
            )
        )
        covered.add(item.key)

    for epic in data["items"]:
        if epic.type.strip().lower() != "epic" or epic.percent_complete is None:
            continue
        if epic.percent_complete < 70:
            continue
        children = [
            child
            for child in _children(data, epic.key)
            if child.type.strip().lower() != "epic" and child.story_points is not None
        ]
        total = sum(child.story_points or 0 for child in children)
        if total <= 0:
            continue
        done_points = sum(child.story_points or 0 for child in children if _is_done(child.status))
        ratio = done_points / total
        if ratio > 0.5:
            continue
        reported = _fmt_num(epic.percent_complete)
        done_label = _fmt_num(done_points)
        total_label = _fmt_num(total)
        percent_done = round(ratio * 100)
        open_critical = [
            child
            for child in _children(data, epic.key)
            if not _is_done(child.status) and _priority(child) in HIGH
        ]
        evidence = [
            _item_evidence(epic, "percent_complete"),
            *[
                piece
                for child in children
                for piece in (_item_evidence(child, "status"), _item_evidence(child, "story_points"))
            ],
        ]
        note_sentence = ""
        for note in data["notes"]:
            if note["project"] != epic.project:
                continue
            if reported in note["text"] or ONLY_OPEN.search(note["text"]):
                evidence.append(_ev("notes", note["id"], "text", note["text"]))
                note_sentence = f" {note['id']} says {_quote(note['text'])}"
                break
        critical_sentence = ""
        if open_critical:
            critical_sentence = (
                " Still open at High or Highest: "
                + ", ".join(f"{child.key} ({child.summary})" for child in open_critical)
                + "."
            )
        findings.append(
            Finding(
                id=f"completion:{epic.key}",
                kind="misleading_completion",
                severity=80,
                confidence="fact",
                project=epic.project,
                title=(
                    f"{names[epic.project]} reports {reported}% complete; "
                    f"{done_label} of {total_label} story points are done."
                ),
                summary=(
                    f"{epic.key} percent_complete is {reported}. "
                    f"Child items with story points total {total_label}, of which {done_label} "
                    f"are Done ({percent_done}%).{critical_sentence}{note_sentence}"
                ),
                blocks_delivery=False,
                suggested_question=(
                    f"Which completion figure should the steering pack use: {reported}% "
                    f"or {done_label} of {total_label} story points?"
                ),
                evidence=evidence,
            )
        )

    for item in data["items"]:
        if _is_done(item.status) or _priority(item) not in HIGH or item.story_points is not None:
            continue
        findings.append(
            Finding(
                id=f"missing-estimate:{item.key}",
                kind="missing_estimate",
                severity=56,
                confidence="fact",
                project=item.project,
                title=f"{item.key} is {item.priority} priority, open, and has no estimate.",
                summary=(
                    f"{item.key} ({item.summary}) is {item.status} and {item.priority} priority. "
                    "The story point or effort cell is empty."
                ),
                blocks_delivery=False,
                suggested_question=f"What is the estimate on {item.key} ({item.summary})?",
                evidence=[
                    _item_evidence(item, "status"),
                    _item_evidence(item, "priority"),
                    _item_evidence(item, "story_points"),
                ],
            )
        )

    for item in data["items"]:
        if item.original_estimate is None or item.remaining is None or item.remaining <= item.original_estimate:
            continue
        original = _fmt_num(item.original_estimate)
        left = _fmt_num(item.remaining)
        findings.append(
            Finding(
                id=f"remaining-above:{item.key}",
                kind="remaining_above_original",
                severity=62,
                confidence="fact",
                project=item.project,
                title=f"{item.key} remaining is {left} and the original estimate is {original}.",
                summary=(
                    f"{item.key} ({item.summary}) is {item.status}. "
                    f"Remaining is {left}. The original estimate is {original}."
                ),
                blocks_delivery=False,
                suggested_question=(
                    f"Why is remaining {left} on {item.key} ({item.summary}) "
                    f"when the original estimate is {original}?"
                ),
                evidence=[
                    _item_evidence(item, "remaining"),
                    _item_evidence(item, "original_estimate"),
                ],
            )
        )

    for item in data["items"]:
        if not _is_done(item.status) or item.remaining is None or item.remaining == 0:
            continue
        left = _fmt_num(item.remaining)
        findings.append(
            Finding(
                id=f"done-remaining:{item.key}",
                kind="done_remaining",
                severity=54,
                confidence="fact",
                project=item.project,
                title=f"{item.key} is Done and remaining is {left}.",
                summary=f"{item.key} ({item.summary}) is {item.status} and the remaining cell is {left}.",
                blocks_delivery=False,
                suggested_question=f"Why does {item.key} ({item.summary}) still have remaining {left} after it was marked Done?",
                evidence=[
                    _item_evidence(item, "status"),
                    _item_evidence(item, "remaining"),
                ],
            )
        )

    for dep in data["dependencies"]:
        pred = dep["predecessor"]
        succ = dep["successor"]
        if pred not in data["by_key"] and pred not in data["milestone_by_id"]:
            continue
        if succ not in data["by_key"] and succ not in data["milestone_by_id"]:
            continue
        if not _record_overdue(data, pred, as_of) or _record_done(data, pred):
            continue
        if not _record_done(data, succ):
            continue
        succ_item = data["by_key"].get(succ)
        pred_label = pred
        milestone = data["milestone_by_id"].get(pred)
        evidence = [
            _ev("dependencies", dep["id"], "predecessor", pred),
            _ev("dependencies", dep["id"], "successor", succ),
        ]
        if milestone is not None:
            pred_label = f"{milestone['name']} ({pred})"
            evidence.extend(
                [
                    _ev("milestones", pred, "status", milestone["status"]),
                    _ev("milestones", pred, "due", milestone["due"]),
                ]
            )
        if succ_item is not None:
            evidence.append(_item_evidence(succ_item, "status"))
        note_sentence = ""
        project = succ_item.project if succ_item is not None else (milestone["project"] if milestone else "")
        for note in _related_notes(data, project, [succ, pred]):
            evidence.append(_ev("notes", note["id"], "text", note["text"]))
            note_sentence = f" {note['id']} says {_quote(note['text'])}"
            break
        set_aside.append(
            Finding(
                id=f"non_blocking:{dep['id']}",
                kind="non_blocking_dependency",
                severity=15,
                confidence="fact",
                project=project,
                title=f"{pred_label} is overdue, and it does not block {succ}.",
                summary=(
                    f"{dep['id']} says {pred} precedes {succ}. "
                    f"{pred_label} is overdue, and {succ} is Done.{note_sentence}"
                ),
                blocks_delivery=False,
                suggested_question="",
                evidence=evidence,
            )
        )

    decisions = []
    for item in data["items"]:
        if _is_done(item.status):
            continue
        if item.type.strip().lower() != "decision" and _status(item) != "waiting":
            continue
        successors = [
            dep["successor"]
            for dep in data["dependencies"]
            if dep["predecessor"] == item.key
        ]
        unknowns = []
        if not item.assignee:
            unknowns.append("owner")
        decisions.append(
            {
                "key": item.key,
                "project": item.project,
                "project_name": names.get(item.project, item.project),
                "summary": item.summary,
                "status": item.status,
                "owner": item.assignee or "missing",
                "due": item.due.isoformat() if item.due else None,
                "overdue": _overdue(item, as_of),
                "successors": successors,
                "unknowns": unknowns,
                "comment": item.comment,
                "evidence": [
                    _item_evidence(item, "status").to_dict(),
                    _item_evidence(item, "assignee").to_dict(),
                    _item_evidence(item, "due").to_dict(),
                    *[
                        _ev("dependencies", dep["id"], "successor", dep["successor"]).to_dict()
                        for dep in data["dependencies"]
                        if dep["predecessor"] == item.key
                    ],
                ],
            }
        )

    previous_by_key = {}
    for row in data["previous"]:
        key = _clean(row.get("key"))
        if key:
            previous_by_key[key] = row
    changes = []
    compared = (
        "status",
        "assignee",
        "priority",
        "due",
        "blocked_by",
        "percent_complete",
        "story_points",
        "remaining",
    )
    current_keys = set(data["by_key"])
    for key in sorted(current_keys & set(previous_by_key)):
        item = data["by_key"][key]
        old = previous_by_key[key]
        fields = []
        for name in compared:
            current = _compared_current(item, name)
            prior = _compared_prior(old, name)
            if current != prior:
                fields.append({"field": name, "before": prior or "blank", "after": current or "blank"})
        if fields:
            changes.append(
                {
                    "key": key,
                    "project": item.project,
                    "summary": item.summary,
                    "fields": fields,
                }
            )
    for key in sorted(current_keys - set(previous_by_key)):
        if previous_by_key:
            item = data["by_key"][key]
            changes.append({"key": key, "project": item.project, "summary": item.summary, "fields": [{"field": "key", "before": "absent", "after": "added"}]})
    for key in sorted(set(previous_by_key) - current_keys):
        changes.append({"key": key, "project": _clean(previous_by_key[key].get("project")), "summary": _clean(previous_by_key[key].get("summary")), "fields": [{"field": "key", "before": "present", "after": "removed"}]})

    dropped = 0
    kept_findings = []
    for finding in findings:
        if finding.evidence and all(item.id and item.field for item in finding.evidence):
            kept_findings.append(finding)
        else:
            dropped += 1
    kept_aside = []
    for finding in set_aside:
        if finding.evidence and all(item.id and item.field for item in finding.evidence):
            kept_aside.append(finding)
        else:
            dropped += 1
    findings = _collapse_missing_estimates(_collapse_unassigned(kept_findings))
    set_aside = kept_aside

    min_severity = data["min_severity"]
    ranked = sorted(
        [finding for finding in findings if finding.severity >= min_severity],
        key=lambda finding: (
            -finding.severity,
            PRIORITY_RANK.get(_priority_label(finding).casefold(), 9),
            finding.id,
        ),
    )
    top = ranked[: data["top_n"]]
    also = [finding for finding in ranked if finding not in top]

    progress = _portfolio_progress(data, names)
    project_progress = {row["id"]: row["text"] for row in progress if row["kind"] == "project"}
    projects = []
    blocked_projects = {
        item.project
        for item in data["items"]
        if _status(item) == "blocked" and not _is_done(item.status)
    }
    severe_projects = {finding.project for finding in findings if finding.severity >= min_severity}
    for project in sorted(names):
        if project in blocked_projects:
            state = "blocked"
        elif project in severe_projects:
            state = "needs_attention"
        elif _rules_could_not_run(data["items"], project):
            state = "unchecked"
        else:
            state = "on_track"
        projects.append(
            {
                "id": project,
                "name": names[project],
                "state": state,
                "progress": project_progress.get(project, ""),
            }
        )

    limits = _file_limits(data["items"])
    on_track = [row["name"] for row in projects if row["state"] == "on_track"]
    disclaimer = "This brief cites rows in the approved export. It does not forecast that a future date will be missed."
    count = next((finding for finding in top if finding.kind == "unassigned_count"), None)
    unchecked = [row["name"] for row in projects if row["state"] == "unchecked"]
    if count is not None:
        gap = " Lateness is left out because the file has no due dates." if any(
            item.startswith("no due dates") for item in limits
        ) else ""
        lead = f"As of {_fmt_date(as_of)}, {count.title}{gap} {disclaimer}"
    elif unchecked and not severe_projects:
        gap = "; ".join(limits) if limits else "the export does not support the rules"
        lead = f"As of {_fmt_date(as_of)}, {', '.join(unchecked)} cannot be called on track. {gap}. {disclaimer}"
    else:
        lead = (
            f"As of {_fmt_date(as_of)}, {len(on_track)} of {len(projects)} projects "
            f"{'is' if len(on_track) == 1 else 'are'} on track"
            + (f" ({', '.join(on_track)})" if on_track else "")
            + ". "
            + disclaimer
        )

    questions = []
    for finding in top:
        if finding.suggested_question and finding.suggested_question not in questions:
            questions.append(finding.suggested_question)
    for decision in decisions:
        if decision["unknowns"] or decision["overdue"]:
            successor = (
                f" Recorded successor: {_and(decision['successors'])}."
                if decision["successors"]
                else ""
            )
            owner = (
                "No owner is named."
                if decision["owner"] == "missing"
                else f"The owner is {decision['owner']}."
            )
            question = f"Who can close {decision['key']} ({decision['summary']})? {owner}{successor}"
            if question not in questions:
                questions.append(question)
    actions = [
        {
            "text": question,
            "requires_approval": True,
            "status": "proposed",
        }
        for question in questions
    ]

    reading = _build_reading(data, names, projects, progress, changes, findings)
    flow = _build_flow(data, names)

    traceable = dropped == 0 and all(finding.evidence for finding in findings + set_aside)
    identity = {
        "top": [finding.id for finding in top],
        "aside": [finding.id for finding in set_aside],
        "decisions": [decision["key"] for decision in decisions],
        "pulse": [[row["id"], row["state"]] for row in projects],
        "changes": [
            [
                change["key"],
                [[field["field"], field["before"], field["after"]] for field in change["fields"]],
            ]
            for change in changes
        ],
    }
    result_id = hashlib.sha256(json.dumps(identity, sort_keys=True).encode()).hexdigest()[:10]
    return {
        "portfolio": data["meta"]["portfolio"],
        "as_of": as_of.isoformat(),
        "audience": data["meta"].get("audience", ""),
        "description": data["meta"].get("description", ""),
        "approval": "pending",
        "synthetic": bool(data["meta"].get("synthetic", False)),
        "source_profile": data["source_profile"],
        "item_count": len(data["items"]),
        "rules_version": RULES_VERSION,
        "result_id": result_id,
        "lead": lead,
        "reading": reading,
        "flow": flow,
        "limits": limits,
        "pulse": projects,
        "progress": progress,
        "top_risks": [finding.to_dict() for finding in top],
        "also_noted": [finding.to_dict() for finding in also],
        "set_aside": [finding.to_dict() for finding in set_aside],
        "decisions": decisions,
        "changes": changes,
        "has_previous": bool(data["previous"]),
        "questions": questions,
        "actions": actions,
        "data_quality": data["issues"],
        "rules": {
            "stale_days": data["stale_days"],
            "completion_reported_at_least": 70,
            "completion_done_ratio_at_most": 0.5,
            "top_n": data["top_n"],
            "min_severity": min_severity,
        },
        "quality": {
            "traceable": traceable,
            "findings": len(findings),
            "set_aside": len(set_aside),
            "unsupported_dropped": dropped,
            "approval": "pending",
        },
    }


def _shown(value: object) -> str:
    text = "" if value is None else str(value)
    return text if text else "(blank)"


def _fmt_iso(value: str | None) -> str:
    if not value:
        return "no date"
    parsed = _parse_date(value, "date", [])
    return _fmt_date(parsed) if parsed else value


_READING_SECTIONS = (
    ("progress", "Closed", "What reached Done."),
    ("changed", "Moved", "Field movement other than the close."),
    ("coming", "Next week", "Dates in the seven days after this week."),
    ("priorities", "Late", "Chains already late, then Highest work after that."),
    ("delay_risks", "Disagrees", "A note or a completion percent the rows contradict."),
)
_WEEK_NOTE = "Five lines from the export. A due date is the date in the file. Evidence is the cells. The field list below is every change."


def _reading_md(brief: dict) -> list[str]:
    reading = brief.get("reading") or {}
    if not reading:
        return []
    this_week = re.sub(r"\s+\d{4}$", "", _span(date.fromisoformat(reading["this_week"][0]), date.fromisoformat(reading["this_week"][1])))
    next_week = re.sub(r"\s+\d{4}$", "", _span(date.fromisoformat(reading["next_week"][0]), date.fromisoformat(reading["next_week"][1])))
    lines = ["", f"{this_week} · next {next_week}", ""]
    for key, title, _note in _READING_SECTIONS:
        rows = reading.get(key) or []
        text = " ".join(row["text"] for row in rows) if rows else "None."
        lines.append(f"**{title}.** {text}")
    lines.append("")
    return lines


def _week_labels(flow: dict) -> list[str]:
    labels = []
    for value in flow.get("week_ends") or []:
        parsed = date.fromisoformat(value)
        labels.append(f"{parsed.day} {parsed.strftime('%b')}")
    return labels


def _flow_claim(weekly: list[int]) -> str:
    """One sentence a reader can repeat. Counts only, from the portfolio row."""
    weeks = len(weekly)
    noun = "week" if weeks == 1 else "weeks"
    if weeks == 0 or not any(weekly):
        return f"Nothing closed in these {weeks} {noun}."
    quiet = 0
    while quiet < weeks and weekly[quiet] == 0:
        quiet += 1
    active = weekly[quiet:]
    if quiet >= 3 and 1 <= len(active) <= 4:
        quiet_noun = "week" if quiet == 1 else "weeks"
        if len(active) == 1:
            tail = str(active[0])
        else:
            tail = ", ".join(str(value) for value in active[:-1]) + f", and {active[-1]}"
        return f"{quiet} {quiet_noun} closed nothing. Then {tail}."
    total = sum(weekly)
    return f"{total} closed in these {weeks} weeks. The latest week closed {weekly[-1]}."


def _delta_mark(current: int, previous: int | None) -> str:
    if previous is None:
        return ""
    delta = current - previous
    if delta == 0:
        return "same"
    if delta > 0:
        return f"▲ {delta}"
    return f"▼ {abs(delta)}"


def _flow_closed_text(row: dict) -> str:
    if row["closed"] is None:
        return "—"
    text = str(row["closed"])
    if row["closed_points"] is not None:
        text += f" · {_fmt_num(row['closed_points'])} pts"
    return text


def _flow_wip_text(row: dict) -> str:
    mark = _delta_mark(row["wip"], row["wip_previous"])
    if not mark:
        return str(row["wip"])
    return f"{row['wip']} {mark}"


def _flow_p85_text(row: dict) -> str:
    if row["p85_days"] is None:
        return "—"
    return f"{row['p85_days']}d · {row['p85_n']}"


def _flow_md(brief: dict) -> list[str]:
    flow = brief.get("flow") or {}
    rows = flow.get("rows") or []
    if not rows:
        return []
    ends = _week_labels(flow)
    lines = [
        "",
        "## Flow",
        "",
        _flow_claim(rows[0]["weekly"]),
        "",
        "Stories, bugs, and tasks. An arrow is how many more or fewer items are open than in the previous export. Same means that count did not change. Weekly columns are Done items in the week of their newest update. Cycle p85 is days from created to that update on Done items, and the count beside it is how many finished items set it.",
        "",
        "| Project | Closed | WIP | Cycle p85 | Per week |",
        "| --- | --- | --- | --- | --- |",
    ]
    for row in rows:
        lines.append(
            f"| {row['name']} | {_flow_closed_text(row)} | {_flow_wip_text(row)} | {_flow_p85_text(row)} | {' '.join(str(value) for value in row['weekly'])} |"
        )
    lines.extend(["", "### Weekly counts", ""])
    lines.append("| Project | " + " | ".join(ends) + " |")
    lines.append("| --- | " + " | ".join("---" for _ in ends) + " |")
    for row in rows:
        lines.append("| " + row["name"] + " | " + " | ".join(str(value) for value in row["weekly"]) + " |")
    lines.append("")
    return lines


def _finding_md(finding: dict) -> list[str]:
    evidence = ", ".join(
        f"{item['source']}:{item['id']}.{item['field']}={_shown(item['value'])}"
        for item in finding["evidence"]
    )
    return [
        f"### {finding['title']}",
        "",
        finding["summary"],
        "",
        f"Confidence: {finding['confidence']}. Severity: {finding['severity']}.",
        "",
        f"Evidence: {evidence}",
        "",
    ]


def render_markdown(brief: dict) -> str:
    lines = [
        f"# {brief['portfolio']}",
        "",
        f"Weekly delivery brief · {brief['as_of']} · Audience: {brief['audience'] or 'not set'}",
        "",
        (
            f"Source: {brief.get('source_profile', 'canonical')} · "
            f"{brief.get('item_count', 0)} work items · rules {brief.get('rules_version', RULES_VERSION)} · "
            f"result {brief.get('result_id', '')}"
        ),
        "",
        "**Approval: pending.** A person still has to check this brief before it goes to a customer.",
        "",
        brief["lead"],
        *_reading_md(brief),
        *_flow_md(brief),
        "## Delivery pulse",
        "",
        "| Project | State |",
        "| --- | --- |",
    ]
    labels = {
        "on_track": "On track",
        "needs_attention": "Needs attention",
        "blocked": "Blocked",
        "unchecked": "Not checked",
    }
    show_progress = any(row.get("progress") for row in brief["pulse"])
    if show_progress:
        lines[-2] = "| Project | State | Progress |"
        lines[-1] = "| --- | --- | --- |"
    for row in brief["pulse"]:
        if show_progress:
            lines.append(f"| {row['name']} | {labels[row['state']]} | {row.get('progress') or ''} |")
        else:
            lines.append(f"| {row['name']} | {labels[row['state']]} |")
    children = [row for row in brief.get("progress") or [] if row["kind"] != "project"]
    if children:
        lines.append("")
        for row in children:
            lines.append(f"- {row['id']} {row['name']}: {row['text']}")
        lines.append("")
    lines.extend(["", "## Top risks", ""])
    if not brief["top_risks"]:
        lines.append("No risk cleared the evidence rules.")
        lines.append("")
    for finding in brief["top_risks"]:
        lines.extend(_finding_md(finding))
    lines.extend(["## Field changes", ""])
    if not brief["changes"]:
        lines.append("No previous export was supplied, or nothing in the compared fields changed.")
        lines.append("")
    for change in brief["changes"]:
        bits = ", ".join(
            f"{field['field']}: {field['before']} → {field['after']}" for field in change["fields"]
        )
        lines.append(f"- {change['key']} ({change['summary']}): {bits}.")
    lines.extend(["", "## Decisions needed", ""])
    if not brief["decisions"]:
        lines.append("No open decision or waiting item is in the export.")
        lines.append("")
    for decision in brief["decisions"]:
        due = _fmt_iso(decision["due"])
        successor = f" Successor: {', '.join(decision['successors'])}." if decision["successors"] else ""
        unknown = f" Unknown: {', '.join(decision['unknowns'])}." if decision["unknowns"] else ""
        overdue = " Overdue." if decision["overdue"] else ""
        lines.append(
            f"- {decision['key']} ({decision['summary']}): owner {decision['owner']}, due {due}.{overdue}{unknown}{successor}"
        )
    lines.extend(["", "## Set aside", ""])
    if not brief["set_aside"]:
        lines.append("No candidate signal was rejected.")
        lines.append("")
    for finding in brief["set_aside"]:
        lines.append(f"- {finding['summary']}")
    lines.extend(["", "## Also noted", ""])
    if not brief["also_noted"]:
        lines.append("Nothing else cleared the severity threshold.")
        lines.append("")
    for finding in brief["also_noted"]:
        lines.append(f"- {finding['title']}")
    lines.extend(["", "## Questions for the delivery lead", ""])
    for question in brief["questions"]:
        lines.append(f"- {question}")
    lines.extend(
        [
            "",
            "## Proposed actions",
            "",
            "The questions above are the proposed actions. Nothing has been sent, and nothing in a project system changes until a person approves it.",
            "",
        ]
    )
    lines.extend(["", "## How this brief was produced", ""])
    rules = brief["rules"]
    lines.extend(
        [
            f"- Stale means an In Progress, Blocked, or Waiting item with no update in {rules['stale_days']} days.",
            f"- A completion figure is treated as misleading when an epic reports at least {rules['completion_reported_at_least']}% and at most half of its child story points are Done.",
            "- An overdue predecessor is set aside when its successor is already Done.",
            "- Jira Blocker counts as Highest and Major counts as High. Three or more unassigned items of one priority are reported as a count.",
            "- An open Highest or High item with an empty story point or effort cell has no estimate. Three or more in one project and priority are one count.",
            "- Remaining above the original estimate cites both numbers. A Done item whose remaining cell is not zero is cited. Those figures are not turned into days.",
            "- A story point or remaining figure that changed since the previous export is listed with the other changes.",
            "- Progress counts story points Done on items that have a story point or effort. Epic, feature, and initiative points stay out of the project total. Those parents are counted from their direct children. Remaining and the original estimate are summed where both cells are numbers.",
            "- Stale and overdue items are raised without a notes file. A note that says the work is on track is still compared with the export.",
            "- Optimistic notes are an inference. The dates and statuses they are compared with are facts.",
            "- This week is the report date and the six days after it. Next week is the seven days after that. A due date in either window is the date in the file.",
            "- Flow counts stories, bugs, and tasks. The opening sentence is the portfolio's weekly closes. Closed is what moved to Done since the previous export. An arrow is how many more or fewer items are open than in that export. Same means that count did not change. The bars place Done items in the week of their newest update, eight weeks ending on the report date, on one scale. Cycle p85 is the 85th percentile of days from created to that update on Done items, with the count of those items. It describes finished items.",
            "- These thresholds are operating rules for the sample, not a validated predictor of delay.",
            "",
        ]
    )
    if brief.get("limits"):
        lines.extend(["", "## What this file does not support", ""])
        for item in brief["limits"]:
            lines.append(f"- {item}")
        lines.append("")
    if brief["data_quality"]:
        lines.extend(["## Data quality", ""])
        for issue in brief["data_quality"]:
            lines.append(f"- {issue}")
        lines.append("")
    lines.append("Synthetic sample." if brief["synthetic"] else "Customer export.")
    lines.append("")
    return "\n".join(lines)


def _evidence_html(finding: dict) -> str:
    rows = []
    for item in finding["evidence"]:
        rows.append(
            "<li><code>{}</code> {} = {}</li>".format(
                html.escape(item["source"]),
                html.escape(f"{item['id']}.{item['field']}"),
                html.escape(_shown(item["value"])),
            )
        )
    return "<ul class=\"evidence\">" + "".join(rows) + "</ul>"


def _profile_label(profile: str) -> str:
    return {"jira": "Jira export", "azure_devops": "Azure DevOps export", "canonical": "Canonical export"}.get(
        profile, profile
    )


def _spark_svg(values: list[int], scale: int) -> str:
    width, height, gap = 104, 32, 3
    count = len(values) or 1
    bar = (width - gap * (count - 1)) / count
    rects = []
    for index, value in enumerate(values):
        bar_height = 1.5 if scale <= 0 or value == 0 else max(3, round(value / scale * (height - 2)))
        x = index * (bar + gap)
        rects.append(
            f'<rect x="{x:.1f}" y="{height - bar_height:.1f}" width="{bar:.1f}" height="{bar_height:.1f}"></rect>'
        )
    label = "Weekly closes " + ", ".join(str(value) for value in values)
    return (
        f'<svg class="spark" viewBox="0 0 {width} {height}" role="img" aria-label="{html.escape(label)}">'
        + "".join(rects)
        + "</svg>"
    )


def _flow_cell_closed(row: dict) -> str:
    if row["closed"] is None:
        return "—"
    text = str(row["closed"])
    if row["closed_points"] is not None:
        text += f' <span class="quiet">· {html.escape(_fmt_num(row["closed_points"]))} pts</span>'
    return text


def _flow_cell_wip(row: dict) -> str:
    mark = _delta_mark(row["wip"], row["wip_previous"])
    if not mark:
        return str(row["wip"])
    return f'{row["wip"]} <span class="quiet">{html.escape(mark)}</span>'


def _flow_cell_p85(row: dict) -> str:
    if row["p85_days"] is None:
        return "—"
    return f'{row["p85_days"]}d <span class="quiet">· {row["p85_n"]}</span>'


def _flow_cast(row: dict) -> str:
    closed = "—" if row["closed"] is None else str(row["closed"])
    points = ""
    if row["closed_points"] is not None:
        points = f'<p class="quiet">{html.escape(_fmt_num(row["closed_points"]))} pts</p>'
    mark = _delta_mark(row["wip"], row["wip_previous"])
    wip_note = f'<p class="quiet">{html.escape(mark)}</p>' if mark else ""
    if row["p85_days"] is None:
        cycle = "—"
        cycle_note = '<p class="quiet">no finished items</p>'
    else:
        cycle = f'{row["p85_days"]}<span class="unit">d</span>'
        cycle_note = f'<p class="quiet">{row["p85_n"]} finished</p>'
    return (
        '<div class="cast">'
        f'<div><p class="kicker">Closed</p><p class="figure">{closed}</p>{points}</div>'
        f'<div><p class="kicker">WIP</p><p class="figure">{row["wip"]}</p>{wip_note}</div>'
        f'<div><p class="kicker">Cycle p85</p><p class="figure">{cycle}</p>{cycle_note}</div>'
        "</div>"
    )


def _flow_html(brief: dict) -> str:
    flow = brief.get("flow") or {}
    rows = flow.get("rows") or []
    if not rows:
        return ""
    ends = _week_labels(flow)
    scale = int(flow.get("scale") or 0)
    body = []
    for row in rows:
        klass = ' class="all"' if row["id"] == "all" else ""
        body.append(
            f"<tr{klass}><td>{html.escape(row['name'])}</td>"
            f'<td class="num">{_flow_cell_closed(row)}</td>'
            f'<td class="num">{_flow_cell_wip(row)}</td>'
            f'<td class="num">{_flow_cell_p85(row)}</td>'
            f'<td class="trend">{_spark_svg(row["weekly"], scale)}</td></tr>'
        )
    week_head = "".join(f"<th>{html.escape(label)}</th>" for label in ends)
    week_rows = []
    for row in rows:
        cells = "".join(f"<td>{value}</td>" for value in row["weekly"])
        week_rows.append(f"<tr><td>{html.escape(row['name'])}</td>{cells}</tr>")
    evidence = rows[0].get("evidence") or []
    fold = ""
    if evidence:
        fold = f"<details><summary>Evidence</summary>{_evidence_html({'evidence': evidence})}</details>"
    axis = ""
    if ends:
        axis = f'<span class="axis">{html.escape(ends[0])}–{html.escape(ends[-1])}</span>'
    note = (
        "Stories, bugs, and tasks. The sentence is the portfolio's weekly closes. "
        "Closed is what moved to Done since the previous export. "
        "An arrow is how many more or fewer items are open than in that export. Same means that count did not change. "
        "Each row of bars is that project's Done items, in the week of their newest update. "
        "The weeks end on the report date and share one scale. "
        "Cycle p85 is the 85th percentile of days from created to that update, on items already Done. "
        "The count beside it is how many finished items set that percentile."
    )
    claim = html.escape(_flow_claim(rows[0]["weekly"]))
    head = (
        '<div class="section-head flow-head"><div><p class="kicker">Flow</p>'
        f"<h2>{claim}</h2></div><details class=\"info\">"
        f'<summary aria-label="About Flow">i</summary><p>{html.escape(note)}</p></details></div>'
    )
    return (
        head
        + _flow_cast(rows[0])
        + '<div class="flow-wrap"><table class="flow"><thead><tr>'
        + '<th>Project</th><th class="num">Closed</th><th class="num">WIP</th>'
        + f'<th class="num">Cycle p85</th><th class="num">Per week{axis}</th>'
        + "</tr></thead><tbody>"
        + "".join(body)
        + "</tbody></table></div>"
        + '<details class="sheet"><summary>Weekly counts</summary>'
        + '<div class="flow-wrap"><table class="flow weeks"><thead><tr><th>Project</th>'
        + week_head
        + "</tr></thead><tbody>"
        + "".join(week_rows)
        + "</tbody></table></div></details>"
        + fold
    )


def _reading_html(brief: dict) -> str:
    reading = brief.get("reading") or {}
    if not reading:
        return ""
    this_week = re.sub(
        r"\s+\d{4}$",
        "",
        _span(date.fromisoformat(reading["this_week"][0]), date.fromisoformat(reading["this_week"][1])),
    )
    next_week = re.sub(
        r"\s+\d{4}$",
        "",
        _span(date.fromisoformat(reading["next_week"][0]), date.fromisoformat(reading["next_week"][1])),
    )
    rows = []
    for key, title, _note in _READING_SECTIONS:
        items = reading.get(key) or []
        text = " ".join(row["text"] for row in items) if items else "None."
        evidence = [piece for row in items for piece in row.get("evidence") or []]
        fold = ""
        if evidence:
            fold = "<details><summary>Evidence</summary>{}</details>".format(
                _evidence_html({"evidence": evidence})
            )
        rows.append(f"<div><dt>{html.escape(title)}</dt><dd>{html.escape(text)}{fold}</dd></div>")
    head = (
        '<div class="section-head"><p class="meta">{}</p><details class="info">'
        '<summary aria-label="About this week">i</summary><p>{}</p></details></div>'
    ).format(html.escape(f"{this_week} · next {next_week}"), html.escape(_WEEK_NOTE))
    return head + '<dl class="reading">' + "".join(rows) + "</dl>"


def _section(title: str, note: str) -> str:
    return (
        '<div class="section-head"><h2>{}</h2><details class="info">'
        '<summary aria-label="About {}">i</summary><p>{}</p></details></div>'
    ).format(html.escape(title), html.escape(title), html.escape(note))


def _bar_html(row: dict) -> str:
    percent = row.get("percent")
    if percent is None:
        return ""
    width = max(0, min(100, int(percent)))
    label = f"{row['name']}, {width} percent of story points Done"
    return (
        f'<div class="bar" role="progressbar" aria-valuenow="{width}" aria-valuemin="0" '
        f'aria-valuemax="100" aria-label="{html.escape(label)}">'
        f'<span style="width:{width}%"></span></div>'
    )


def render_html(brief: dict) -> str:
    labels = {
        "on_track": "On track",
        "needs_attention": "Needs attention",
        "blocked": "Blocked",
        "unchecked": "Not checked",
    }
    progress_rows = brief.get("progress") or []
    by_project = {row["id"]: row for row in progress_rows if row["kind"] == "project"}
    children_of: dict[str, list[dict]] = {}
    for row in progress_rows:
        if row["kind"] != "project":
            children_of.setdefault(row["project"], []).append(row)
    cards = []
    for row in brief["pulse"]:
        parts = [
            f'<span class="state {html.escape(row["state"])}">{labels[row["state"]]}</span>',
            f"<span>{html.escape(row['name'])}</span>",
        ]
        record = by_project.get(row["id"])
        if record:
            parts.append(_bar_html(record))
        if row.get("progress"):
            parts.append(f'<span class="progress">{html.escape(row["progress"])}</span>')
        nested = []
        for child in children_of.get(row["id"], []):
            nested.append(
                '<li><span class="name">{} {}</span>{}<span class="progress">{}</span></li>'.format(
                    html.escape(child["id"]),
                    html.escape(child["name"]),
                    _bar_html(child),
                    html.escape(child["text"]),
                )
            )
        if nested:
            parts.append(f'<ul class="children">{"".join(nested)}</ul>')
        cards.append('<li class="card">' + "".join(parts) + "</li>")
    pulse = "".join(cards)
    risks = []
    for finding in brief["top_risks"]:
        count = len(finding["evidence"])
        risks.append(
            "<article class=\"card\">"
            f"<p class=\"kicker\">{html.escape(finding['confidence'])} · severity {finding['severity']}</p>"
            f"<h3>{html.escape(finding['title'])}</h3>"
            f"<p>{html.escape(finding['summary'])}</p>"
            f"<details><summary>Evidence, {count} fields</summary>{_evidence_html(finding)}</details>"
            "</article>"
        )
    if brief["changes"]:
        changes = "".join(
            "<li><strong>{}</strong> {}.</li>".format(
                html.escape(change["key"]),
                html.escape(", ".join(f"{field['field']} {field['before']} → {field['after']}" for field in change["fields"])),
            )
            for change in brief["changes"]
        )
    elif brief.get("has_previous"):
        changes = "<li>No compared field changed.</li>"
    else:
        changes = "<li>No previous export was attached.</li>"
    decisions = []
    for decision in brief["decisions"]:
        extra = []
        if decision["overdue"]:
            extra.append("overdue")
        if decision["unknowns"]:
            extra.append("unknown " + ", ".join(decision["unknowns"]))
        if decision["successors"]:
            extra.append("before " + ", ".join(decision["successors"]))
        decisions.append(
            "<li><strong>{}</strong> {} — owner {}, due {}. {}</li>".format(
                html.escape(decision["key"]),
                html.escape(decision["summary"]),
                html.escape(decision["owner"]),
                html.escape(_fmt_iso(decision["due"])),
                html.escape("; ".join(extra)),
            )
        )
    aside_items = "".join(
        f"<li>{html.escape(finding['summary'])}</li>" for finding in brief["set_aside"]
    ) or "<li>None.</li>"
    aside_count = len(brief["set_aside"])
    if aside_count == 1:
        aside_label = brief["set_aside"][0]["title"]
    elif aside_count == 0:
        aside_label = "Nothing was set aside"
    else:
        aside_label = f"{aside_count} signals set aside"
    noted = "".join(f"<li>{html.escape(finding['title'])}</li>" for finding in brief["also_noted"]) or "<li>None.</li>"
    questions = "".join(f"<li>{html.escape(question)}</li>" for question in brief["questions"])
    stamp = "Synthetic sample · pending approval" if brief["synthetic"] else "Pending approval"
    profile = _profile_label(str(brief.get("source_profile", "canonical")))
    limit_items = "".join(f"<li>{html.escape(item)}</li>" for item in brief.get("limits") or [])
    limits_html = (
        _section(
            "What this file does not support",
            "Columns or words the rules could not use. Lateness, priority, and story points are left out when those cells are missing.",
        )
        + f"<ul>{limit_items}</ul>"
        if limit_items
        else ""
    )
    quality_rows = brief.get("data_quality") or []
    if quality_rows:
        shown = "".join(f"<li>{html.escape(issue)}</li>" for issue in quality_rows[:40])
        more = ""
        if len(quality_rows) > 40:
            more = f"<li>{len(quality_rows) - 40} more lines are in the Markdown brief.</li>"
        quality_html = (
            f"<details><summary>Data quality, {len(quality_rows)} lines</summary><ul>{shown}{more}</ul></details>"
        )
    else:
        quality_html = ""
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{html.escape(brief['portfolio'])} delivery brief</title>
  <style>
    :root {{ color-scheme: dark; }}
    body {{ margin: 0; background: #12141c; color: #e7e9f0; font: 15px/1.45 ui-sans-serif, system-ui, sans-serif; }}
    main {{ max-width: 52rem; margin: 0 auto; padding: 1.25rem 1rem 3rem; }}
    header {{ border-top: 6px solid #22d3ee; padding-top: 0.8rem; }}
    .stamp {{ margin: 0; letter-spacing: 0.08em; text-transform: uppercase; font-weight: 650; font-size: 0.72rem; color: #22d3ee; }}
    h1 {{ font-size: 1.8rem; line-height: 1.1; margin: 0.35rem 0; }}
    h2 {{ font-size: 1.05rem; margin: 0; }}
    .section-head {{ display: flex; align-items: center; justify-content: space-between; gap: 0.6rem; margin: 1.4rem 0 0.45rem; }}
    .info {{ position: relative; margin: 0; }}
    .info summary {{ list-style: none; width: 1.25rem; height: 1.25rem; border: 1px solid rgba(255,255,255,0.2); border-radius: 999px; display: grid; place-items: center; font: italic 700 0.72rem/1 ui-sans-serif, system-ui, sans-serif; color: #9aa0b0; cursor: pointer; }}
    .info summary::-webkit-details-marker {{ display: none; }}
    .info p {{ position: absolute; right: 0; z-index: 2; width: min(22rem, 70vw); margin: 0.35rem 0 0; padding: 0.55rem 0.7rem; background: #0e1016; color: #c4c8d4; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 8px 20px rgba(0, 0, 0, 0.35); font-size: 0.82rem; font-weight: 400; }}
    .bar {{ height: 0.45rem; background: rgba(255,255,255,0.08); border-radius: 999px; overflow: hidden; margin: 0.35rem 0 0.15rem; }}
    .bar > span {{ display: block; height: 100%; background: #22d3ee; }}
    .children {{ list-style: none; padding: 0.35rem 0 0; margin: 0.25rem 0 0; border-top: 1px solid rgba(255,255,255,0.08); }}
    .children li {{ margin-top: 0.45rem; }}
    .children .name {{ display: block; font-size: 0.82rem; color: #c4c8d4; }}
    .children .bar {{ height: 0.3rem; }}
    h3 {{ font-size: 1rem; margin: 0 0 0.35rem; }}
    .meta {{ margin: 0; color: #9aa0b0; }}
    .lede {{ font-size: 1.02rem; }}
    .reading {{ margin: 0.35rem 0 0.2rem; }}
    .reading div {{ display: grid; grid-template-columns: 6.2rem 1fr; gap: 0.1rem 0.8rem; margin: 0.45rem 0; }}
    .reading dt {{ margin: 0; color: #9aa0b0; font-size: 0.68rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; }}
    .reading dd {{ margin: 0; }}
    .reading details {{ margin: 0.1rem 0 0; }}
    .reading summary {{ font-size: 0.75rem; color: #9aa0b0; }}
    .flow-head h2 {{ font-size: 1.28rem; line-height: 1.25; font-weight: 650; max-width: 38rem; }}
    .cast {{ display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.75rem; margin: 0.15rem 0 0.85rem; padding: 0.65rem 0; border-top: 1px solid rgba(255,255,255,0.12); border-bottom: 1px solid rgba(255,255,255,0.12); }}
    .cast .figure {{ margin: 0.12rem 0 0; font-size: 1.85rem; line-height: 1; font-weight: 650; font-variant-numeric: tabular-nums; letter-spacing: -0.03em; }}
    .cast .unit {{ font-size: 0.95rem; font-weight: 500; color: #9aa0b0; }}
    .cast .quiet {{ margin: 0.2rem 0 0; }}
    .flow-wrap {{ overflow-x: auto; }}
    table.flow {{ width: 100%; border-collapse: collapse; }}
    table.flow th {{ text-align: left; color: #9aa0b0; font-size: 0.68rem; letter-spacing: 0.06em; text-transform: uppercase; font-weight: 700; padding: 0.35rem 0.45rem; border-bottom: 1px solid rgba(255,255,255,0.12); }}
    table.flow td {{ padding: 0.4rem 0.45rem; border-bottom: 1px solid rgba(255,255,255,0.06); vertical-align: middle; }}
    table.flow .num {{ text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }}
    table.flow .trend {{ width: 7.2rem; }}
    table.flow .axis {{ display: block; margin-top: 0.15rem; font-weight: 500; letter-spacing: 0; text-transform: none; }}
    table.flow tr.all td {{ font-weight: 650; }}
    table.weeks td, table.weeks th {{ text-align: right; }}
    table.weeks td:first-child, table.weeks th:first-child {{ text-align: left; }}
    .spark {{ width: 6.6rem; height: 2rem; display: block; margin-left: auto; }}
    .spark rect {{ fill: #22d3ee; }}
    .quiet {{ color: #9aa0b0; font-weight: 400; }}
    .sheet {{ margin: 0.35rem 0 0.6rem; }}
    .pulse {{ list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr)); gap: 0.45rem; }}
    .card {{ background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); padding: 0.7rem 0.8rem; }}
    .pulse .card {{ display: flex; flex-direction: column; gap: 0.2rem; min-height: 3.2rem; }}
    .state {{ font-weight: 700; font-size: 0.72rem; letter-spacing: 0.04em; text-transform: uppercase; }}
    .progress {{ color: #c4c8d4; font-size: 0.85rem; }}
    .on_track {{ color: #34d399; }}
    .needs_attention {{ color: #fcd34d; }}
    .blocked {{ color: #f87171; }}
    .unchecked {{ color: #9aa0b0; }}
    .kicker {{ margin: 0; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; color: #9aa0b0; }}
    article {{ margin: 0.45rem 0; }}
    details {{ margin-top: 0.35rem; }}
    summary {{ cursor: pointer; color: #c4c8d4; }}
    .evidence {{ font: 0.78rem/1.4 ui-monospace, monospace; color: #c4c8d4; }}
    ul {{ padding-left: 1.1rem; }}
    footer {{ margin-top: 1.5rem; color: #9aa0b0; }}
    @media (max-width: 640px) {{
      h1 {{ font-size: 1.45rem; }}
      .pulse {{ grid-template-columns: 1fr; }}
      .reading div {{ grid-template-columns: 1fr; gap: 0.05rem; }}
      .flow-head h2 {{ font-size: 1.12rem; }}
      .cast .figure {{ font-size: 1.45rem; }}
    }}
  </style>
</head>
<body>
  <main>
    <header>
      <p class="stamp">{html.escape(stamp)}</p>
      <h1>{html.escape(brief['portfolio'])}</h1>
      <p class="meta">{html.escape(brief['as_of'])} · {html.escape(brief['audience'])} · {html.escape(profile)} · {brief.get('item_count', 0)} work items · rules {html.escape(str(brief.get('rules_version', '')))} · result {html.escape(str(brief.get('result_id', '')))}</p>
    </header>
    <p class="lede">{html.escape(brief['lead'])}</p>
    {_reading_html(brief)}
    {_flow_html(brief)}
    {limits_html}
    {quality_html}
    {_section("Delivery pulse", "Each card is one project: On track, Needs attention, Blocked, or Not checked. The bar is story points marked Done, among items that have a story point or effort. An epic, feature, or initiative is listed on that card and counted from its direct children. Remaining and the original estimate are sums of rows where both cells are numbers.")}
    <ul class="pulse">{pulse}</ul>
    {_section("Field changes", "Every compared cell: status, assignee, priority, due date, blocker, percent complete, story points, and remaining. The week reading is the conclusion. This list is the audit.")}
    <ul>{changes}</ul>
    {_section("Decisions needed", "Open items whose type is Decision, or whose status is Waiting. The owner and the due date come from those cells.")}
    <ul>{''.join(decisions) or '<li>None.</li>'}</ul>
    {_section("Ask in the review", "Questions drawn from the top risks and from open decisions. Nothing is sent until a person approves the brief.")}
    <ul>{questions or '<li>None.</li>'}</ul>
    {_section("Top risks", "The highest-severity findings that cite a row in the export. Evidence stays folded under each one.")}
    {''.join(risks) or '<p>No risk cleared the evidence rules.</p>'}
    {_section("Checked and set aside", "A signal the rules looked at and did not promote. An overdue predecessor is set aside when its successor is already Done.")}
    <details>
      <summary>{html.escape(aside_label)}</summary>
      <ul>{aside_items}</ul>
    </details>
    {_section("Also noted", "Findings that cleared the severity threshold and did not fit at the top of the brief.")}
    <ul>{noted}</ul>
    <footer>
      <p>Send this file. The recipient does not need an account or the original export. Evidence is under each risk. Nothing on this page has been sent to a project tool.</p>
      <p>A person approves the brief before a customer sees it. The result id changes when the findings change, so two copies can be compared.</p>
      <p>{html.escape(brief['description'])}</p>
    </footer>
  </main>
</body>
</html>
"""


def share_filename(brief: dict) -> str:
    slug = re.sub(r"[^A-Za-z0-9]+", "-", brief["portfolio"]).strip("-") or "delivery-brief"
    profile = str(brief.get("source_profile") or "canonical")
    profile_bit = "" if profile == "canonical" else f"-{profile}"
    return f"{slug}{profile_bit}-{brief['as_of']}.html"


def write_brief(brief: dict, output: Path) -> None:
    output.mkdir(parents=True, exist_ok=True)
    page = render_html(brief)
    (output / "brief.json").write_text(json.dumps(brief, indent=2) + "\n", encoding="utf-8")
    (output / "brief.md").write_text(render_markdown(brief), encoding="utf-8")
    (output / "brief.html").write_text(page, encoding="utf-8")
    (output / share_filename(brief)).write_text(page, encoding="utf-8")


def build(directory: Path) -> dict:
    return analyse(load_portfolio(directory))


def brief_from_csv(
    source: Path,
    name: str,
    as_of: str,
    previous: Path | None = None,
    profile: str | None = None,
    columns: Path | None = None,
) -> dict:
    staging = _stage_csv(source, name, as_of, previous, profile, columns)
    try:
        return build(staging)
    finally:
        shutil.rmtree(staging, ignore_errors=True)


def _stage_csv(source: Path, name: str, as_of: str, previous: Path | None, profile: str | None, columns: Path | None) -> Path:
    staging = Path(tempfile.mkdtemp(prefix="delivery-signal-"))
    meta = {
        "portfolio": name,
        "as_of": as_of,
        "audience": "Delivery director",
        "description": "Brief built from a single export file.",
        "synthetic": False,
    }
    if profile:
        meta["profile"] = profile
    (staging / "meta.json").write_text(json.dumps(meta, indent=2) + "\n", encoding="utf-8")
    shutil.copy(source, staging / "work_items.csv")
    if previous is not None:
        shutil.copy(previous, staging / "previous_work_items.csv")
    if columns is not None:
        shutil.copy(columns, staging / "columns.json")
    return staging


def main(argv: list[str] | None = None) -> int:
    argv_list = list(sys.argv[1:] if argv is None else argv)
    if not argv_list or (argv_list[0] in {"connect", "import", "report", "help"} and not Path(argv_list[0]).exists()):
        import link

        return link.main(argv_list)
    parser = argparse.ArgumentParser(description="Build an evidence-linked delivery brief.")
    parser.add_argument("portfolio", type=Path, help="Portfolio directory, or one CSV export")
    parser.add_argument("--out", type=Path, help="Output directory (default: <portfolio>/out)")
    parser.add_argument("--name", help="Portfolio name when the input is a single CSV")
    parser.add_argument("--as-of", help="Report date YYYY-MM-DD when the input is a single CSV")
    parser.add_argument("--previous", type=Path, help="Previous CSV, used only for the change list")
    parser.add_argument("--profile", choices=extract.PROFILES, help="Force canonical, jira, or azure_devops")
    parser.add_argument("--columns", type=Path, help="columns.json header overrides")
    args = parser.parse_args(argv_list)
    staging: Path | None = None
    try:
        if args.portfolio.is_file():
            name = args.name or (args.portfolio.stem.strip() or "Portfolio")
            as_of = args.as_of or date.today().isoformat()
            staging = _stage_csv(args.portfolio, name, as_of, args.previous, args.profile, args.columns)
            brief = build(staging)
            output = args.out or (args.portfolio.parent / "out")
        else:
            brief = build(args.portfolio)
            output = args.out or (args.portfolio / "out")
    except (InputError, json.JSONDecodeError, OSError) as exc:
        print(str(exc), file=sys.stderr)
        return 1
    finally:
        if staging is not None:
            shutil.rmtree(staging, ignore_errors=True)
    if not brief["quality"]["traceable"]:
        print("Brief has a finding without evidence.", file=sys.stderr)
        return 1
    write_brief(brief, output)
    print(
        f"{brief['portfolio']}: {brief['source_profile']}, {len(brief['top_risks'])} top risks, "
        f"{len(brief['set_aside'])} set aside, result {brief['result_id']}, approval {brief['approval']}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
