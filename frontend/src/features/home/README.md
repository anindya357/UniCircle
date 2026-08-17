# Home feature

The authenticated `/` route presents CUET overview content through the existing
typed `HomeService` contract and mock service. The feature includes basic university
information, institutional history, achievements, facilities, a CUET media gallery,
and a locally served introduction video with a direct fallback link.

The current content is intentionally static mock data prepared from CUET's official
website and institutional bulletin. The Home photos and video are project-provided
assets served from `public/media/home`; gallery images display an explicit fallback
if an asset becomes unavailable. A later backend phase must first decide whether
Home content remains static or becomes database-managed; this frontend does not
assume or introduce a CMS.
