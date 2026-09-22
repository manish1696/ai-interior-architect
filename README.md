# AI Interior Architect

A local-first, structure-aware generative interior design portfolio project. It accepts a room image, design direction, constraints, and budget; then returns a concept image with an explainable design plan.

## Quick start

On macOS or Linux, install Node.js 22+ and Python 3.11+, then run:

```bash
chmod +x run-local.sh
./run-local.sh
```

This starts the frontend and FastAPI backend together. The frontend uses `NEXT_PUBLIC_API_URL` and automatically displays the image returned by the local service.

## Included

- Responsive design-studio frontend
- Image validation, drag-and-drop, progress states, and before/after comparison
- FastAPI inference service with a versioned endpoint
- `demo` mode that runs on an ordinary laptop without model downloads
- `full` adapter for FLUX image-to-image inference on CUDA
- Clean model boundary for later SAM 2, Depth Anything, ControlNet, or AWS adapters

## Frontend

```bash
npm install
npm run dev
```

## Local inference service

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp ../.env.example .env
uvicorn app.main:app --reload --port 8000
```

Open `http://localhost:8000/docs` to exercise the API. Demo mode produces a deterministic styled concept without downloading AI weights.

## Enable FLUX locally

Use a CUDA GPU with substantial VRAM, or CPU offload with enough system RAM:

```bash
pip install -r requirements-full.txt
```

Set `MODE=full` in `.env`. Weights download on the first request. The next production milestone adds SAM 2 and depth control maps before diffusion, followed by geometry validation.

## API

`POST /api/v1/design` as multipart form data:

- `image`: JPG, PNG, or WEBP, up to 12 MB
- `payload`: JSON with `room_type`, `style`, `budget`, `instructions`, and optional `seed`

The interface explicitly identifies its built-in visual treatment as concept mode. It does not claim generated pixels came from a model until the local inference service is connected.
