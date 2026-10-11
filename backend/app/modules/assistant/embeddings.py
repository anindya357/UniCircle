"""CPU-only cloud embeddings; runtime never downloads model weights."""

from functools import lru_cache
from pathlib import Path

from app.core.config import Settings

MODEL_CACHE = Path(__file__).with_name("embedding_models")


@lru_cache(maxsize=2)
def load_fastembed(model_name: str, offline: bool):
    from fastembed import TextEmbedding

    return TextEmbedding(
        model_name=model_name,
        cache_dir=str(MODEL_CACHE),
        threads=1,
        providers=["CPUExecutionProvider"],
        local_files_only=offline,
    )


class FastEmbedProvider:
    def __init__(self, settings: Settings) -> None:
        self._client = load_fastembed(
            settings.fastembed_model, settings.app_env == "production"
        )

    def embed_query(self, text: str) -> list[float]:
        return next(self._client.query_embed(text)).tolist()

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        return [vector.tolist() for vector in self._client.passage_embed(texts)]


def create_embedding_provider(settings: Settings):
    if settings.rag_embedding_provider == "fastembed":
        return FastEmbedProvider(settings)
    from langchain_ollama import OllamaEmbeddings

    return OllamaEmbeddings(
        base_url=settings.ollama_base_url, model=settings.ollama_embedding_model
    )
