# Resource sharing feature

Feature 6 provides a connected mock resource-sharing workflow:

- `/resources` includes people discovery, resource-category filters, request
  composition, and sent/received request management.
- Pending incoming requests can be accepted or rejected in local mock state.
- Accepted requests create a coordination conversation shared with `/chat` through
  the resource-sharing route layout.

Data enters the route through `ResourceSharingService`, allowing the mock snapshot to
be replaced by backend-managed users, requests, and conversations later.
