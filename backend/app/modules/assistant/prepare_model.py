"""Build-time model download only: no credentials, database access or indexing."""

from app.modules.assistant.embeddings import load_fastembed


def main() -> None:
    model_name = "BAAI/bge-small-en-v1.5"
    client = load_fastembed(model_name, False)
    vector = next(client.query_embed("Where is CUET?"))
    if len(vector) != 384:
        raise RuntimeError("Unexpected embedding model dimension")
    # Prove the deployed model can load without an internet download.
    offline = load_fastembed(model_name, True)
    if len(next(offline.query_embed("CUET campus"))) != 384:
        raise RuntimeError("Offline embedding model verification failed")
    print("CPU embedding model ready; offline loading verified (384 dimensions)")


if __name__ == "__main__":
    main()
