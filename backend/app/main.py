import json
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .config import settings
from .models import DesignRequest, DesignResponse
from .pipeline import InteriorPipeline

app = FastAPI(title=settings.app_name, version="0.1.0")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_methods=["*"], allow_headers=["*"])
pipeline = InteriorPipeline()
app.mount("/outputs", StaticFiles(directory=settings.output_dir), name="outputs")

@app.get("/health")
def health(): return {"status": "ok", "mode": settings.mode, "device": settings.device}

@app.post("/api/v1/design", response_model=DesignResponse)
async def design(image: UploadFile = File(...), payload: str = Form(...)):
    if image.content_type not in {"image/jpeg", "image/png", "image/webp"}:
        raise HTTPException(415, "Only JPG, PNG, and WEBP room images are supported")
    raw = await image.read(settings.max_upload_mb * 1024 * 1024 + 1)
    if len(raw) > settings.max_upload_mb * 1024 * 1024: raise HTTPException(413, "Image is too large")
    try: request = DesignRequest.model_validate(json.loads(payload))
    except Exception as exc: raise HTTPException(422, f"Invalid design request: {exc}") from exc
    try: filename, analysis = pipeline.generate(raw, request)
    except Exception as exc: raise HTTPException(500, f"Generation failed: {exc}") from exc
    return DesignResponse(job_id=filename.split(".")[0], status="complete",
        output_url=f"/outputs/{filename}", analysis=analysis, mode=settings.mode)
