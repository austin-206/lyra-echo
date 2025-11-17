# System Setup and Environment Preparation

## Purpose
Describe how to prepare, maintain, and safely extend the Lyra Echo environment across its core nodes.  
This is not a traditional code repository setup guide — it defines how the system’s infrastructure, orchestration, and supporting services are configured for local development, testing, and updates.

---

## System Context
Lyra Echo runs as a distributed local ecosystem:

| Node | Role | Description |
|:--|:--|:--|
| **Lyra** | Orchestration and Inference | Hosts the LLMs, vector database (Qdrant), API service, and GPU workloads. |
| **Vega** | Integration and Automation Hub | Runs Home Assistant, Node-RED, MQTT broker, and monitoring stack (Prometheus/Grafana). |
| **Mirror Nodes** | Edge Interfaces | Raspberry Pi devices handling microphones, speakers, displays, and sensors. |

---

## Environment Objectives
- Ensure consistent configuration across Lyra, Vega, and mirror nodes.  
- Maintain isolated Python environments where needed (e.g., local tools).  
- Preserve security by using `.env` secrets and local network segmentation.  
- Enable reliable, restart-safe services via containers or systemd units.

---

## Core Dependencies

| Component | Purpose | Installed On |
|:--|:--|:--|
| Docker + Compose | Container management for MQTT, Node-RED, Prometheus, Grafana, Home Assistant | Vega, Lyra |
| Python 3.11+ (`venv`, `pip`) | For local utilities or docs preview (optional) | Vega, Lyra |
| Git | Version control for documentation and config snapshots | Vega |
| NVIDIA drivers + DCGM exporter | GPU management and telemetry | Lyra |

---

## Setup Steps (Vega)

### 1) System update and base packages
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose git
sudo systemctl enable docker --now
```

### 2) Install container services (MQTT, Node‑RED, Prometheus, Grafana, Home Assistant)
Create a working directory and a compose file:
```bash
mkdir -p ~/vega-stack/{mosquitto,data,node-red,prometheus,grafana,homeassistant}
cd ~/vega-stack
nano docker-compose.yml
```

Paste this minimal stack (adjust volumes/paths as needed):
```yaml
version: "3.8"
services:
  mosquitto:
    image: eclipse-mosquitto:2
    container_name: mqtt-broker
    restart: unless-stopped
    ports:
      - "1883:1883"
    volumes:
      - ./mosquitto:/mosquitto

  nodered:
    image: nodered/node-red:latest
    container_name: nodered
    restart: unless-stopped
    ports:
      - "1880:1880"
    volumes:
      - ./node-red:/data
    depends_on:
      - mosquitto

  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    restart: unless-stopped
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus:/etc/prometheus
      - ./data/prometheus:/prometheus

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - ./grafana:/var/lib/grafana
    depends_on:
      - prometheus

  homeassistant:
    image: ghcr.io/home-assistant/home-assistant:stable
    container_name: home-assistant
    privileged: true
    restart: unless-stopped
    volumes:
      - ./homeassistant:/config
    ports:
      - "8123:8123"
```
Bring the stack up:
```bash
docker-compose up -d
docker ps
```

**Notes**
- Initialize Mosquitto by placing `mosquitto.conf` under `./mosquitto/` (allow local listener, auth as needed).  
- Add `prometheus.yml` under `./prometheus/` with scrape jobs for local exporters (node_exporter, dcgm, etc.).  
- Grafana will persist dashboards in `./grafana/`.  
- Home Assistant runs containerized (non‑supervised).

---

## Setup Steps (Lyra)

### 1) Docker and NVIDIA runtime
```bash
sudo apt update && sudo apt install -y docker.io docker-compose nvidia-driver nvidia-container-toolkit
sudo systemctl enable docker --now
nvidia-smi
```

### 2) Deploy Qdrant (vector DB) and DCGM exporter (GPU metrics)
```bash
mkdir -p ~/lyra-stack/qdrant
cd ~/lyra-stack
cat > docker-compose.yml <<'YAML'
version: "3.8"
services:
  qdrant:
    image: qdrant/qdrant:latest
    container_name: qdrant
    restart: unless-stopped
    ports: ["6333:6333"]
    volumes:
      - ./qdrant:/qdrant/storage

  dcgm-exporter:
    image: nvidia/dcgm-exporter:latest
    container_name: dcgm-exporter
    restart: unless-stopped
    runtime: nvidia
    ports: ["9400:9400"]
YAML

docker-compose up -d
curl -s http://localhost:6333/healthz
```

(Optionally add your orchestration API service to this compose file.)

---

## Environment Configuration
Store credentials and service URLs in `.env` files per node. Example snippets:

`/opt/lyra/.env`
```
VECTOR_DB_URL=http://localhost:6333
ECHO_API_KEY=
```

`/opt/vega/.env`
```
MQTT_BROKER_URL=localhost:1883
GRAFANA_URL=http://localhost:3000
HOME_ASSISTANT_URL=http://localhost:8123
```

Never commit real credentials — keep a sanitized `.env.example` for reference.

---

## Documentation (optional)
If you want local docs preview during edits:
```bash
python3 -m venv .venv && source .venv/bin/activate
pip install mkdocs mkdocs-material pymdown-extensions
mkdocs serve -a 0.0.0.0:8000
```

---

## Notes
- Lyra = inference and reasoning layer (GPU host).  
- Vega = automation, monitoring, and integration hub (containerized services).  
- Mirror nodes = human-facing interfaces (speech, display, presence).  

Each layer runs independently but communicates via MQTT and REST APIs on the local network.

---

_Last updated: 2025-11-10_
