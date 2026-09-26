# Campus AI assistant feature

The responsive conversation uses the typed `CampusAssistantService` and the
same-origin `/api/assistant/ask` proxy. That proxy forwards the HttpOnly session
token to FastAPI; OpenAI credentials and provider calls remain backend-only.

Answers include official CUET source links returned by the RAG endpoint. The UI
supports grounded answers, no-context responses, loading, retry, and API errors.
