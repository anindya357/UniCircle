# RAG knowledge-source policy

## Approved scope

The initial UniCircle knowledge base accepts public HTTPS pages and public PDF
documents on exactly `cuet.ac.bd`. Related CUET subdomains are not trusted by
suffix matching and must be reviewed and explicitly added to
`RAG_ALLOWED_HOSTS` before ingestion. The initial seed is
`https://cuet.ac.bd/`.

An acceptable source is public, CUET-controlled, campus-related, readable
without authentication, and useful for students. Login/admin/student portals,
API routes, social sites, unrelated external links, media/static assets,
archives, office documents, and query-string variants are excluded. A redirect
outside the allowlist is rejected.

## Crawl and refresh controls

The ingestion CLI uses a same-host breadth-first crawl with configured page and
depth limits, a descriptive user agent, `robots.txt` checks, request throttling,
timeouts, a 15 MB document limit, URL canonicalization, and content hashing.
HTML is extracted with LangChain `WebBaseLoader`; PDF text uses `PyPDFLoader`.
The recursive splitter removes blank/repeated lines and creates overlapping
chunks.

Re-running the command is the refresh strategy. Unchanged hashes are not
re-embedded. A temporary refresh failure keeps previously indexed content
available and records the error. Run a reviewed refresh weekly or after major
CUET publishing changes; do not run it inside an API request.

## Storage, retrieval, and safety

`text-embedding-3-small` vectors are stored with chunks in PostgreSQL JSON and
ranked by cosine similarity in the bounded query service. This keeps the first
deployment self-contained. If the corpus grows beyond the current 10,000-chunk
retrieval ceiling, migrate the same model to pgvector or a separately approved
vector engine before increasing that ceiling.

Every answer returns the source URL, title, and excerpt. Retrieved web text is
untrusted reference data and cannot grant permissions or override the system
prompt. Raw questions and conversations are not retained; only a SHA-256
question digest, outcome, source count, user ID, and timestamp are stored for
rate/cost safeguards.
