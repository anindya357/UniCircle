# Home feature

The public `/` route presents CUET overview content before and after login. Its
typed, static source is `content/home-overview.ts`; no Home API or database table
is required. The feature includes basic university information, institutional
history, achievements, facilities, a CUET media gallery, and a locally served
introduction video with a direct fallback link.

The content is intentionally static and was prepared from CUET's official website
and institutional bulletin. To update it, review the source and change the content
file in a normal code review. There is deliberately no Admin Home editor.

The project-provided photos and video live in `public/media/home` and are served
from the same frontend deployment at `/media/home/...`; no runtime file-storage
service or third-party embed is needed. Every referenced asset must ship with the
deployment. The video uses metadata-only preload, a poster image, controls, and a
direct-link fallback; gallery images show a fallback if loading fails. The bundled
video is about 30 MB, so a CDN/transcoded version should be considered before a
high-traffic rollout, while preserving the same asset URLs or updating this content
file. Only these public media files belong in `public`; no private uploads do.
