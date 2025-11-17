# LLM Setup on Lyra 

## 0) System prep 
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose jq
nvidia-smi
```

## 1) Directory layout (persistent volumes)
```bash
mkdir -p ~/lyra-llm/{ollama,openwebui,vllm}
sudo mkdir -p /mnt/data1/ollama
sudo chown -R $USER:$USER /mnt/data1/ollama
```

## 2) Docker Compose: Ollama + Open WebUI
Create `~/lyra-llm/docker-compose.yml`:
```yaml
version: "3.8"
services:
  ollama:
    image: ollama/ollama:latest
    container_name: ollama
    restart: unless-stopped
    ports:
      - "11434:11434"
    environment:
      - OLLAMA_KEEP_ALIVE=30m
    volumes:
      - /mnt/data1/ollama:/root/.ollama
    deploy:
      resources:
        reservations:
          devices:
            - capabilities: [gpu]

  openwebui:
    image: ghcr.io/open-webui/open-webui:main
    container_name: openwebui
    restart: unless-stopped
    ports:
      - "3001:8080"
    environment:
      - OLLAMA_BASE_URL=http://ollama:11434
    depends_on:
      - ollama
```
Bring it up:
```bash
cd ~/lyra-llm
docker-compose up -d
docker ps
```
Access the UI: `http://localhost:3001`

## 3) Pull models
```bash
docker exec -it ollama ollama pull mixtral:8x7b-instruct
docker exec -it ollama ollama pull llama3:8b-instruct
docker exec -it ollama ollama pull deepseek-coder:6.7b
docker exec -it ollama ollama pull qwen2:7b-instruct
```
Quick sanity test:
```bash
curl -s http://localhost:11434/api/generate -d '{
  "model": "mixtral:8x7b-instruct",
  "prompt": "Say hello in one sentence."
}' | jq -r '.response'
```

## 4) Rate/latency sanity checks
```bash
/usr/bin/time -f "secs:%E  mem:%MKB"   bash -lc 'curl -s http://localhost:11434/api/generate -d "{"model":"llama3:8b-instruct","prompt":"Summarize: Lyra Echo is a local AI system."}" > /dev/null'
```

## 5) Embeddings (for Qdrant)
```bash
python3 -m venv ~/.venvs/emb && source ~/.venvs/emb/bin/activate
pip install --upgrade pip
pip install sentence-transformers torch --extra-index-url https://download.pytorch.org/whl/cu121

python - <<'PY'
from sentence_transformers import SentenceTransformer
m = SentenceTransformer("all-MiniLM-L6-v2")
print("OK:", m.get_sentence_embedding_dimension())
PY
```

## Optional: vLLM (max throughput)
Create `~/lyra-llm/vllm/docker-compose.yml`:
```yaml
version: "3.8"
services:
  vllm:
    image: vllm/vllm-openai:latest
    container_name: vllm
    restart: unless-stopped
    ports:
      - "8001:8000"
    environment:
      - VLLM_WORKER_CONCURRENCY=1
      - VLLM_LOGGING_LEVEL=INFO
    command: >
      --model Qwen/Qwen2-7B-Instruct
      --max-model-len 8192
      --gpu-memory-utilization 0.90
    deploy:
      resources:
        reservations:
          devices:
            - capabilities: [gpu]
    volumes:
      - /mnt/data1/hf-cache:/root/.cache/huggingface
```
Bring it up:
```bash
cd ~/lyra-llm/vllm
docker-compose up -d
```
OpenAI-compatible endpoint: `http://localhost:8001/v1`

```bash
curl -s http://localhost:8001/v1/models | jq .
curl -s http://localhost:8001/v1/chat/completions   -H "Content-Type: application/json"   -d '{
    "model":"Qwen/Qwen2-7B-Instruct",
    "messages":[{"role":"user","content":"One sentence on Lyra Echo."}]
  }' | jq -r '.choices[0].message.content'
```

## Service management
```bash
cd ~/lyra-llm && docker-compose up -d
cd ~/lyra-llm && docker-compose down
docker pull ollama/ollama:latest
docker pull ghcr.io/open-webui/open-webui:main
docker pull vllm/vllm-openai:latest
```

## Observability
- GPU health: `nvidia-smi`  
- Ollama logs: `docker logs -f ollama`  
- vLLM logs: `docker logs -f vllm`  
- Add to Prometheus scrape jobs for metrics.

---
_Last updated: 2025-11-10_
