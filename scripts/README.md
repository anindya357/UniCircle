# Scripts

This directory is reserved for repeatable project setup, quality, migration, and
maintenance scripts. Phase 9 commands are documented in
[`docs/testing/PHASE_9_TESTING.md`](../docs/testing/PHASE_9_TESTING.md); the
backend also exposes the short `backend\test` command.

`verify_postgres_docker.ps1` checks the local Docker PostgreSQL configuration,
data persistence, authentication, and delayed backend startup using an isolated
temporary project. See [the Docker guide](../docs/docker/README.md).
