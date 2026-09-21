# Directory feature

The /directory route provides the Phase 4 department and faculty-directory
experience.

- All twelve departments (including MME and WRE) are selectable from a responsive tab list.
- Department descriptions, address, and office contact come from CUET's public directory where available.
- Faculty cards show current names, roles, and available contact details with official profile links. Missing contact fields are not fabricated.
- Faculty records can be filtered by name or designation.
- Loading, service error, empty directory, empty faculty, and no-search-result states
  are represented.
- Data is delivered through the typed directory service via the authenticated Next.js BFF and FastAPI directory API.

The checked-in CUET data snapshot was retrieved on 21 September 2026. Refresh and
review it periodically; it is not a live sync with CUET. Areas of expertise are
omitted because they are not in the official current-faculty listing response.
