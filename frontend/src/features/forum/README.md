# Community forum feature

Feature 8 provides the `/forum` community discussion experience.

- The server route reads typed posts and authors through `ForumService`.
- The client feed mocks text-only post and comment creation with validation and submit
  states.
- Posts expose a confirmation step before they are reported to an App Admin.
- A reported post cannot be accidentally submitted again in the current mock session.
- No reaction controls or image/video upload controls are included by design.

Mock mutations reset when the page reloads. A future backend integration can replace the
mock service while retaining the feature types and component boundaries.
