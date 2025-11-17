# Model Management Guide

## Purpose
Document how Lyra handles local model selection, loading, and embedding generation for orchestration and memory functions.

---

## Model Types

| Category | Engine | Description |
|:--|:--|:--|
| Conversational LLM | Ollama / vLLM | Generates responses for orchestration |
| Embedding Model | sentence-transformers | Encodes text for Qdrant vector storage |
| TTS | Piper or XTTS | Synthesizes speech for mirror output |
| STT | Faster-Whisper | Transcribes microphone input |

---

## Model Storage
All models stored locally on Lyra under `/mnt/data1/ollama/models/`.

Example:
```
/mnt/data1/ollama/models/
 ├── mixtral-8x7b.Q4_K_M.gguf
 ├── qwen-32b.Q4_K_M.gguf
 ├── deepseek-coder.Q4_K_M.gguf
 └── embeddings/
      └── all-MiniLM-L6-v2/
```

---

## Loading and Switching
To switch models in Ollama:
```bash
ollama run mixtral:latest
```

To verify loaded model:
```bash
curl http://localhost:11434/api/tags
```

For embeddings:
```python
from sentence_transformers import SentenceTransformer
model = SentenceTransformer("all-MiniLM-L6-v2")
emb = model.encode("example text")
```

---

## Memory Integration
Embeddings inserted into Qdrant collection `mem_turns`:
```python
import requests, json

data = {
    "points": [{
        "id": "uuid",
        "vector": emb.tolist(),
        "payload": {"text": "example", "tags": ["test"]}
    }]
}
requests.post("http://localhost:6333/collections/mem_turns/points", json=data)
```

---

## Performance Considerations
- Prefer quantized models for latency-sensitive interactions.
- Keep context length under 8K tokens for real-time use.
- Use GPU for embeddings when available (`torch.cuda.is_available()` returns True).

---

## Model Updates
- Track versions under `/docs/release/changelog.md`.
- Validate model outputs using standardized prompts before production use.

_Last updated: 2025-11-10_
