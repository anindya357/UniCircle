"""CUET profile mapping must be safe, optional, and privacy-preserving."""

from app.modules.directory.cuet_profile import (
    plain_text,
    public_profile_fields,
    safe_avatar,
    safe_link,
    slug_from_profile_url,
)


def test_cuet_profile_html_is_rendered_as_plain_text() -> None:
    assert plain_text("<p>Computer <strong>Vision</strong> &amp; AI</p>") == (
        "Computer Vision & AI"
    )
    assert plain_text("<p>Hello</p><script>alert('x')</script><p>World</p>") == (
        "Hello\nWorld"
    )


def test_cuet_profile_links_are_restricted() -> None:
    assert (
        slug_from_profile_url(
            "https://cuet.ac.bd/profile/faculty-member/md-refaj-hossan"
        )
        == "md-refaj-hossan"
    )
    assert slug_from_profile_url("https://evil.test/profile/faculty-member/a") is None
    assert (
        slug_from_profile_url(
            "https://cuet.ac.bd/profile/faculty-member/Farzana_Rahman_Zuthi"
        )
        == "Farzana_Rahman_Zuthi"
    )
    assert (
        slug_from_profile_url("https://cuet.ac.bd/profile/faculty-member/../../private")
        is None
    )
    assert safe_link("javascript:alert(1)") is None
    assert safe_link("https://scholar.google.com/example") is not None
    assert safe_avatar("https://app.cuet.ac.bd/storage/Admins/photo.png") is not None
    assert safe_avatar("https://evil.test/storage/Admins/photo.png") is None


def test_profile_mapping_excludes_sensitive_fields_and_empty_sections() -> None:
    fields = public_profile_fields(
        {
            "nid": "private-id",
            "date_of_birth": "private-date",
            "father_name": "private-name",
            "religion": "private-religion",
            "profile": {
                "intro": "<p>Researcher in <b>AI</b>.</p>",
                "research_interests": "<p>Computer vision</p>",
                "personal_website": "https://example.edu/profile",
            },
            "personal_info": {
                "avatar_logical_url": "https://app.cuet.ac.bd/storage/Admins/a.png"
            },
            "educations": [
                {
                    "app_admin_education_type_title": "B.Sc(Engineering)",
                    "subject": "CSE",
                    "institute": "CUET",
                    "from": "2020",
                    "to": "2025",
                }
            ],
            "social_acoounts": [
                {"title": "Scholar", "url": "https://scholar.google.com/example"},
                {"title": "Unsafe", "url": "javascript:alert(1)"},
            ],
        }
    )
    assert fields["biography"] == "Researcher in AI."
    assert fields["research_interests"] == "Computer vision"
    assert fields["education"][0]["subtitle"] == "CSE, CUET"
    assert len(fields["social_links"]) == 1
    assert not any("private" in str(value) for value in fields.values())
