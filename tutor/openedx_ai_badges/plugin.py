import os
from glob import glob
from pathlib import Path

import importlib_resources
from tutor import hooks
from tutormfe.hooks import PLUGIN_SLOTS


########################
# Plugin path management
########################

PLUGIN_DIR = Path(__file__).parent

# Locate backend and frontend directories
# They should be siblings to the openedx_ai_badges package
PACKAGE_ROOT = PLUGIN_DIR.parent
FRONTEND_CANDIDATES = [
    PACKAGE_ROOT / "openedx-ai-badges-frontend",
    PACKAGE_ROOT.parent / "frontend",
]
FRONTEND_PATH = next((p for p in FRONTEND_CANDIDATES if p.exists()), None)
BACKEND_CANDIDATES = [
    PACKAGE_ROOT / "openedx-ai-badges-backend",
    PACKAGE_ROOT.parent / "backend",
]
BACKEND_PATH = next((p for p in BACKEND_CANDIDATES if p.exists()), None)

# Makes the UI Slots code available for local install during the build process
hooks.Filters.DOCKER_BUILD_COMMAND.add_items([
    "--build-context", f"ai-badges-frontend={str(FRONTEND_PATH)}",
    "--build-context", f"ai-badges-backend={str(BACKEND_PATH)}",
])

@hooks.Filters.IMAGES_BUILD_MOUNTS.add()
def _mount_plugin(mounts, path):
    """Mount the sample plugin source code for development."""
    mounts += [("openedx-ai-badges-backend", "/openedx/openedx-ai-badges/backend")]
    return mounts

# Actually connects the patch files as tutor env patches
for path in glob(str(importlib_resources.files("openedx_ai_badges") / "patches" / "*")):
    with open(path, encoding="utf-8") as patch_file:
        hooks.Filters.ENV_PATCHES.add_item((os.path.basename(path), patch_file.read()))


########################
# MIT SLM sidecar service
# Set RUN_MIT_SLM=true to deploy a local Small Language Model (Ollama-backed)
# instead of (or alongside) external AI providers like OpenAI/Anthropic.
########################

hooks.Filters.CONFIG_DEFAULTS.add_items(
    [
        ("LAISER_API_BASE_URL", ""),
        ("LAISER_API_KEY", ""),
        ("RUN_MIT_SLM", False),
        ("MIT_SLM_DOCKER_IMAGE", "felipemontoya/dcc-mit-badge-api:latest"),
        ("MIT_SLM_OLLAMA_URL", "https://felipemontoya-mit-dcc-ollama.hf.space/api/generate"),
        ("MIT_SLM_OLLAMA_TOKEN", ""),
        ("MIT_SLM_MODEL_NAME", "phi4-chat"),
        ("MIT_SLM_OLLAMA_PRELOAD", "false"),
        ("MIT_DCC_BADGE_API_HEALTH_URL", "http://mit-slm:8000/health"),
    ]
)

hooks.Filters.ENV_PATCHES.add_items(
    [
        (
            "local-docker-compose-services",
            """{% if RUN_MIT_SLM %}
mit-slm:
  image: {{ MIT_SLM_DOCKER_IMAGE }}
  restart: unless-stopped
  ports:
    - "8599:8000"
  environment:
    OLLAMA_API_URL: "{{ MIT_SLM_OLLAMA_URL }}"
    MODEL_NAME: "{{ MIT_SLM_MODEL_NAME }}"
    OLLAMA_AUTH_TOKEN: "{{ MIT_SLM_OLLAMA_TOKEN }}"
    OLLAMA_PRELOAD: "{{ MIT_SLM_OLLAMA_PRELOAD }}"
{%- if RUN_MIT_SLM_IMAGE %}
    BADGE_IMAGE_SERVICE_URL: "{{ MIT_DCC_BADGE_IMAGE_API_URL }}"
{%- endif %}
{% endif %}""",
        ),
        (
            "k8s-deployments",
            """{% if RUN_MIT_SLM %}
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mit-slm
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: mit-slm
  template:
    metadata:
      labels:
        app.kubernetes.io/name: mit-slm
    spec:
      containers:
        - name: mit-slm
          image: {{ MIT_SLM_DOCKER_IMAGE }}
          env:
            - name: OLLAMA_API_URL
              value: "{{ MIT_SLM_OLLAMA_URL }}"
            - name: MODEL_NAME
              value: "{{ MIT_SLM_MODEL_NAME }}"
            - name: OLLAMA_AUTH_TOKEN
              value: "{{ MIT_SLM_OLLAMA_TOKEN }}"
            - name: OLLAMA_PRELOAD
              value: "{{ MIT_SLM_OLLAMA_PRELOAD }}"
{%- if RUN_MIT_SLM_IMAGE %}
            - name: BADGE_IMAGE_SERVICE_URL
              value: "{{ MIT_DCC_BADGE_IMAGE_API_URL }}"
{%- endif %}
          ports:
            - containerPort: 8000
{% endif %}""",
        ),
        (
            "k8s-services",
            """{% if RUN_MIT_SLM %}
---
apiVersion: v1
kind: Service
metadata:
  name: mit-slm
spec:
  type: ClusterIP
  selector:
    app.kubernetes.io/name: mit-slm
  ports:
    - port: 8000
      targetPort: 8000
{% endif %}""",
        ),
    ]
)

########################
# MIT SLM Image Generation sidecar service
# Set RUN_MIT_SLM_IMAGE=true to deploy the badge image generation service
# alongside Open edX. It renders badge images from structured JSON configurations.
########################

hooks.Filters.CONFIG_DEFAULTS.add_items(
    [
        ("RUN_MIT_SLM_IMAGE", False),
        ("MIT_SLM_IMAGE_DOCKER_IMAGE", "felipemontoya/dcc-mit-badge-image-gen-api:latest"),
        ("MIT_DCC_BADGE_IMAGE_API_URL", "http://mit-slm-image:3001"),
        ("MIT_DCC_BADGE_IMAGE_API_HEALTH_URL", "http://mit-slm-image:3001/badge-image/health"),
    ]
)

hooks.Filters.ENV_PATCHES.add_items(
    [
        (
            "local-docker-compose-services",
            """{% if RUN_MIT_SLM_IMAGE %}
mit-slm-image:
  image: {{ MIT_SLM_IMAGE_DOCKER_IMAGE }}
  restart: unless-stopped
  ports:
    - "8598:3001"
{% endif %}""",
        ),
        (
            "k8s-deployments",
            """{% if RUN_MIT_SLM_IMAGE %}
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mit-slm-image
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: mit-slm-image
  template:
    metadata:
      labels:
        app.kubernetes.io/name: mit-slm-image
    spec:
      containers:
        - name: mit-slm-image
          image: {{ MIT_SLM_IMAGE_DOCKER_IMAGE }}
          ports:
            - containerPort: 3001
{% endif %}""",
        ),
        (
            "k8s-services",
            """{% if RUN_MIT_SLM_IMAGE %}
---
apiVersion: v1
kind: Service
metadata:
  name: mit-slm-image
spec:
  type: ClusterIP
  selector:
    app.kubernetes.io/name: mit-slm-image
  ports:
    - port: 3001
      targetPort: 3001
{% endif %}""",
        ),
    ]
)

########################
# UI Slot configurations
########################

PLUGIN_SLOTS.add_items(
    [
    ]
)
