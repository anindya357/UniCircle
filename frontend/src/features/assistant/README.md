# Campus AI assistant feature

The assistant UI is implemented as a responsive client-side conversation using a
typed `CampusAssistantService`. The current service is a keyword-based mock with
deliberate loading, no-answer, source, and failure paths.

When the backend phase is ready, replace `MockCampusAssistantService` in the
service composition root with a FastAPI implementation. The browser must call the
FastAPI RAG endpoint only; model-provider credentials and calls remain on the
backend.
