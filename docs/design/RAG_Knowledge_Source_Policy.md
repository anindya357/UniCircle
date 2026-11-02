# RAG knowledge-source policy

## Default: reviewed local knowledge

The 2026-10-08 requirement replaces whole-site scraping as the runtime corpus.
`backend/app/modules/assistant/knowledge/CUET_Knowledge_Base.md` is authoritative;
the `.txt` file is its deterministic plain-text companion. Both ship with the
backend. Ingestion validates consistency and never indexes both copies.

The independently written summary contains stable section IDs, factual text,
public evidence URLs, review dates and review-after dates. Sources include CUET
documents, government institutional information, QS/THE/EduRank's own tables,
dated reputable reporting, and attributed OpenStreetMap-derived campus markers.
Community food listings establish cafeteria identity, not verified prices or
opening hours. Map positions are approximate, not navigation guarantees.
Prototype pages and old summaries are cross-checked; navigation-only extraction
cannot establish academic or personnel counts.

## Supplied campus notes and faculty directory (2026-11-02)

The project owner supplied `TSC.txt` and
`CUET Faculty DeptNameEmailDesignation (1).xlsx`. They are reference data, not
instructions. Their facts are incorporated into the Markdown/TXT corpus;
`knowledge/attachment_sources.json` retains filenames, original SHA-256 hashes,
scope, import date and an explicit `independentlyVerified: false` marker. No
absolute local path is bundled. `attachment://tsc-notes` and
`attachment://faculty-workbook` are registered provenance identifiers, never URLs
to fetch or a mechanism for reading arbitrary local files. Unknown references,
paths, query strings and `file://` evidence are rejected. The web crawler's
allowlist is unchanged.

The spreadsheet has 360 department-appointment rows, 354 distinct email contacts
and 17 department labels. Six contacts have appointments under two departments;
both designations are retained in one contact record. This is a supplied file's
coverage, not a verified current university headcount. DEM is not listed; that
does not prove absence of the department or its teachers. Source spelling and
per-department roles are preserved. Faculty phone numbers, room numbers and
research specialties are not invented.

The TSC notes cover Pubali Bank digital banking, stationery/books, bKash/Nagad,
printing, two grocery shops including Rupali store, student/teacher cafeterias,
the DSW office, club-program space and a Muslim female students' prayer space.
The given ground/second/third floor labels are retained without renumbering.
Shop floors, indoor routes, opening hours and charges are not established.

Neither attachment states a collection/effective date. The 2026-11-02 review
date means the provided data was imported and checked, not that employment,
headship or campus services were independently reverified. The review-after date
is 2026-12-02. The prompt retains this uncertainty and must not convert an undated
snapshot into a live appointment or facility guarantee.

Rankings identify publisher and edition. Current appointments take precedence
over old biographies. Historical pro-VC appointments are not current appointments;
inability to identify a holder does not prove vacancy. No dummy names, fabricated
phones, unverified room directions, live admission dates or invented teacher
headcounts belong in this corpus.

## Ingestion and refresh

Run `python -m app.modules.assistant.ingest --check` to validate files without
database/model access. After editing Markdown, use `--export-txt` in a writable
checkout, review the companion, and run ingestion without crawler flags.
In Docker, rebuild the backend image after editing the corpus and run the
existing ingestion command inside the backend container.

LangChain splits each section independently; chunks repeat their topic and
as-of date. Faculty contacts are atomic even when a smaller text chunk size is
configured, so a name cannot detach from its email or other appointments. The
configured Ollama or FastEmbed adapter embeds the records; chunks and evidence metadata
are stored in PostgreSQL. All vectors are prepared and validated before an
atomic commit. Provider failures cannot remove the last good index. Unchanged
sections skip embedding; model changes and `--force` rebuild vectors. The corpus
hash covers the Markdown and registered attachment provenance. Pipeline version 2
adds evidence classification, row locators and controlled retrieval aliases;
existing version-1 rows require re-ingestion before serving the expanded corpus.
Embedding requests and FastEmbed inference use batches of at most 16 chunks.
All batches must succeed with consistent finite vector dimensions before the
atomic replacement. A later batch failure preserves the previously stored index.

Re-verify leadership weekly, rankings monthly, and campus/academic facts on their
recorded quarterly/half-yearly dates. Ingestion updates index time, not research
validity. Update review dates only after checking evidence. Unknown administrative
appointments should be confirmed with the Registrar.

## Retrieval and privacy

`RAG_KNOWLEDGE_MODE=curated` is the default. Retrieve only local sources whose
corpus hash matches the bundled document, pipeline version and embedding model
match, and review period includes today in Bangladesh time. Legacy website rows
remain stored for recovery but cannot contaminate curated answers. Removed
sections and old snapshots are excluded. Expired sections cannot supply a stale
current appointment. An entirely ineligible index returns a setup error; a ready
index with insufficient relevance returns a no-context answer. Admin status counts
eligible sources/chunks and reports review-due sections.

Cosine similarity ranks a bounded corpus. For eligible curated records, exact
full-email or multi-token name/department/service aliases are ranked first and
can provide grounded context even when the embedding alone misses a name. Single
generic tokens do not qualify. The usual similarity threshold still applies to
other chunks, and no alias bypasses source eligibility or vector validity.
Retrieved content remains untrusted data, never instructions or authority.
The prompt respects dates and uncertainty. Evidence URLs stay in files/database
for maintenance; answers return no source cards, URLs or citation markers.
Audits store a question hash, user ID, outcome, source count and timestamp,
not raw questions or conversations. Ollama stays backend-only.

Chat generation uses Groq-hosted `qwen/qwen3.8-27b` when the backend has a
`GROQ_API_KEY` (`RAG_CHAT_PROVIDER=auto`); explicit `groq` and `ollama` selections
are also supported. Only the question and retrieved public excerpts are sent
to Groq, not account records or authentication credentials. The key is masked
in settings and kept in ignored environment files/deployment secret settings.
Upstream errors and keys never appear in public API responses. Respect the
provider's shared quota; no unrelated question should spend chat quota.

Embeddings select Ollama or the existing bundled FastEmbed CPU adapter through
configuration. Changing the chat provider does not rebuild vectors; changing the
embedding provider/model does require re-indexing. FastEmbed and Ollama use
separate curated namespaces and are not interchangeable. Production FastEmbed
uses prepared local model assets rather than downloading weights per request.

## Optional legacy crawler

`--web` explicitly invokes the strict approved-host HTTPS crawler with robots
checks, throttling, page/depth/download limits, `WebBaseLoader` for HTML and
`PyPDFLoader` for PDFs. Adding a host requires review; portals, assets and unrelated
sources remain blocked. Web results enter retrieval only if an operator
deliberately selects `RAG_KNOWLEDGE_MODE=web`. Manually consulting external
evidence does not expand that crawler allowlist. There is no scraping or online
research inside a question request.

## Verification boundary

Deterministic-provider tests cover local loading, file parity, grounding
contracts, old-source exclusion, review expiry, corpus/model compatibility,
idempotency and failure preservation. Groq contract tests cover provider selection,
masked credentials, prompts, output/timeout bounds, upstream quota/auth failures,
malformed responses and authenticated API/audit behavior. On 2026-10-12 a live
location question retrieved five eligible chunks from the existing curated index
and received a grounded answer from Groq `qwen/qwen3.8-27b`. This verifies the
development setup, not production embedding hosting or every possible answer.

Attachment regression tests cover all 360 appointments/354 contacts, departmental
counts, multi-department roles, TSC details, atomic contact chunks, provenance,
exact lookup with low semantic scores, ineligible-source exclusion, unsupported
questions and rejection of unsafe attachment references. Deterministic tests do
not prove real-provider wording or current employment. Re-indexing is a separate
required operation after a corpus change.
