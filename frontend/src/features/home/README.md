# Home feature

The authenticated `/` route presents CUET overview content through the existing
typed `HomeService` contract and mock service. The feature includes basic university
information, institutional history, achievements, facilities, an official-media
gallery, and a privacy-enhanced video embed with an external fallback link.

The current content is intentionally static mock data prepared from CUET's official
website and institutional bulletin. Gallery assets remain on CUET-owned hosts and
display an explicit fallback if a source becomes unavailable. A later backend phase
must first decide whether Home content remains static or becomes database-managed;
this frontend does not assume or introduce a CMS.
