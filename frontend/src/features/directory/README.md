# Directory feature

The /directory route provides the Phase 4 department and faculty-directory
experience.

- All twelve departments (including MME and WRE) are selectable from a responsive tab list.
- Department descriptions, address, and office contact come from CUET's public directory where available.
- Faculty cards show current names, roles, and available contact details. Their profile links stay inside UniCircle at `/directory/faculty/{entryId}`.
- Faculty records can be filtered by name or designation.
- Loading, service error, empty directory, empty faculty, and no-search-result states
  are represented.
- Data is delivered through the typed directory service via the authenticated Next.js BFF and FastAPI directory API.

The checked-in CUET directory snapshot was retrieved on 21 September 2026.
Individual profile details are fetched from CUET when opened and presented with
UniCircle's own responsive UI. If CUET is unavailable, the saved directory name,
role, and contact details remain visible. Missing profile sections are omitted,
and private fields in CUET's response are never forwarded. Refresh and review
the list snapshot periodically; it is not a live sync. Areas of expertise are
omitted from the list because they are not in the current-faculty listing response.
