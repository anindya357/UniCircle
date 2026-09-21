"""Read a public CUET faculty profile without exposing private API fields."""

import json
import re
from html.parser import HTMLParser
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse
from urllib.request import HTTPRedirectHandler, Request, build_opener

PROFILE_PREFIX = "https://cuet.ac.bd/profile/faculty-member/"
API_PREFIX = "https://api.cuet.ac.bd/api/v1/app-admins/"
MAX_RESPONSE_BYTES = 1_000_000


class _NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, request, fp, code, msg, headers, newurl):
        return None


class _PlainText(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.parts: list[str] = []
        self.ignored = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag in {"script", "style"}:
            self.ignored += 1
        elif tag in {"p", "br", "li", "div"}:
            self.parts.append("\n")

    def handle_endtag(self, tag: str) -> None:
        if tag in {"script", "style"}:
            self.ignored = max(0, self.ignored - 1)
        elif tag in {"p", "li", "div"}:
            self.parts.append("\n")

    def handle_data(self, data: str) -> None:
        if not self.ignored:
            self.parts.append(data)


def plain_text(value: object, limit: int = 6_000) -> str | None:
    if not isinstance(value, str) or not value.strip():
        return None
    parser = _PlainText()
    parser.feed(value)
    lines = [" ".join(line.split()) for line in "".join(parser.parts).splitlines()]
    result = "\n".join(line for line in lines if line).strip()
    return result[:limit] or None


def safe_link(value: object) -> str | None:
    if not isinstance(value, str):
        return None
    try:
        parsed = urlparse(value.strip())
        valid = (
            parsed.scheme == "https" and bool(parsed.hostname) and not parsed.username
        )
    except ValueError:
        return None
    if not valid:
        return None
    return value.strip()[:500]


def safe_avatar(value: object) -> str | None:
    link = safe_link(value)
    if not link:
        return None
    parsed = urlparse(link)
    if parsed.hostname != "app.cuet.ac.bd" or not parsed.path.startswith(
        ("/storage/", "/assets/images/avatar/")
    ):
        return None
    return link


def slug_from_profile_url(profile_url: str | None) -> str | None:
    if not profile_url or not profile_url.startswith(PROFILE_PREFIX):
        return None
    slug = profile_url[len(PROFILE_PREFIX) :]
    return slug if re.fullmatch(r"[A-Za-z0-9_-]{1,150}", slug) else None


def fetch_cuet_profile(slug: str) -> dict | None:
    """The URL is built from a validated, database-owned CUET profile slug."""
    if not re.fullmatch(r"[A-Za-z0-9_-]{1,150}", slug):
        return None
    request = Request(
        API_PREFIX + slug,
        headers={
            "Accept": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "User-Agent": "Mozilla/5.0",
        },
    )
    try:
        with build_opener(_NoRedirect()).open(request, timeout=7) as response:
            raw = response.read(MAX_RESPONSE_BYTES + 1)
        if len(raw) > MAX_RESPONSE_BYTES:
            return None
        payload = json.loads(raw)
    except (HTTPError, URLError, TimeoutError, OSError, ValueError):
        return None
    if not isinstance(payload, dict) or not payload.get("result"):
        return None
    data = payload.get("data")
    return data if isinstance(data, dict) else None


def _list(value: object) -> list[dict]:
    return (
        [item for item in value[:30] if isinstance(item, dict)]
        if isinstance(value, list)
        else []
    )


def _entry(
    title: object,
    subtitle: object = None,
    period: object = None,
    description: object = None,
    url: object = None,
) -> dict | None:
    normalized_title = plain_text(title, 300)
    if not normalized_title:
        return None
    return {
        "title": normalized_title,
        "subtitle": plain_text(subtitle, 350),
        "period": plain_text(period, 120),
        "description": plain_text(description, 2_000),
        "url": safe_link(url),
    }


def _entries(items: list[dict], kind: str) -> list[dict]:
    result = []
    for item in items:
        if kind == "education":
            title = item.get("app_admin_education_type_title") or item.get("title")
            subtitle = ", ".join(
                filter(
                    None,
                    (
                        plain_text(item.get("subject"), 120),
                        plain_text(item.get("institute"), 200),
                    ),
                )
            )
        elif kind == "experience":
            title = item.get("designation") or item.get("title")
            subtitle = ", ".join(
                filter(
                    None,
                    (
                        plain_text(item.get("department"), 120),
                        plain_text(item.get("institue") or item.get("institute"), 200),
                    ),
                )
            )
        else:
            title = item.get("title") or item.get("name") or item.get("student_name")
            subtitle = item.get("journal") or item.get("institution")
        period = " - ".join(
            filter(
                None,
                (
                    plain_text(item.get("from"), 60),
                    plain_text(item.get("to"), 60),
                ),
            )
        )
        entry = _entry(
            title, subtitle, period, item.get("description"), item.get("url")
        )
        if entry:
            result.append(entry)
    return result


def public_profile_fields(data: dict) -> dict:
    """Explicit allowlist: never return NID, birth date, family, or religion."""
    profile = data.get("profile") if isinstance(data.get("profile"), dict) else {}
    personal = (
        data.get("personal_info") if isinstance(data.get("personal_info"), dict) else {}
    )
    courses = []
    for item in _list(data.get("courses")):
        course = _entry(item.get("title"), url=item.get("url") or item.get("file"))
        if course:
            courses.append(course)
    social_links = []
    for item in _list(data.get("social_acoounts")):
        link = _entry(item.get("title"), url=item.get("url"))
        if link and link["url"]:
            social_links.append(link)
    research = []
    for group in _list(data.get("researches")):
        for item in _list(group.get("app_admin_researches")):
            entry = _entry(
                item.get("title") or item.get("name"),
                group.get("title"),
                description=item.get("description"),
                url=item.get("url"),
            )
            if entry:
                research.append(entry)
    return {
        "avatar_url": safe_avatar(personal.get("avatar_logical_url")),
        "biography": plain_text(profile.get("intro")),
        "research_interests": plain_text(profile.get("research_interests"), 3_000),
        "education_overview": plain_text(profile.get("education_intro"), 3_000),
        "additional_information": plain_text(profile.get("other_descriptions"), 3_000),
        "personal_website": safe_link(profile.get("personal_website")),
        "education": _entries(_list(data.get("educations")), "education"),
        "experience": _entries(_list(data.get("experiences")), "experience"),
        "supervisions": _entries(_list(data.get("supervisions")), "supervision"),
        "publications": _entries(_list(data.get("publications")), "publication"),
        "research": research[:30],
        "courses": courses,
        "awards": _entries(_list(data.get("achievements_awards")), "award"),
        "social_links": social_links,
    }
