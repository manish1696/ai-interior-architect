import io
import uuid
from PIL import Image, ImageEnhance, ImageFilter
from .config import settings
from .models import Analysis, DesignRequest

class InteriorPipeline:
    """Model facade. Swap implementations here without changing the API."""
    def __init__(self) -> None:
        settings.output_dir.mkdir(parents=True, exist_ok=True)

    def analyze(self, request: DesignRequest) -> Analysis:
        return Analysis(room_type=request.room_type,
            structural_elements=["walls", "floor", "window/door openings"],
            detected_objects=["seating", "storage", "lighting"],
            recommendations=[f"Apply a {request.style.lower()} material palette",
                "Preserve openings and primary circulation",
                f"Keep selections within the {request.budget} working budget"])

    def generate(self, raw: bytes, request: DesignRequest) -> tuple[str, Analysis]:
        filename = self._generate_full(raw, request) if settings.mode == "full" else self._generate_demo(raw)
        return filename, self.analyze(request)

    def _generate_demo(self, raw: bytes) -> str:
        image = Image.open(io.BytesIO(raw)).convert("RGB")
        image.thumbnail((1536, 1536))
        image = ImageEnhance.Color(image).enhance(.82)
        image = ImageEnhance.Contrast(image).enhance(1.06)
        image = ImageEnhance.Brightness(image).enhance(1.05)
        image = Image.blend(image, Image.new("RGB", image.size, "#c7b493"), .10)
        image = image.filter(ImageFilter.UnsharpMask(radius=1.2, percent=60))
        filename = f"{uuid.uuid4().hex}.webp"
        image.save(settings.output_dir / filename, "WEBP", quality=90)
        return filename

    def _generate_full(self, raw: bytes, request: DesignRequest) -> str:
        import torch
        from diffusers import FluxImg2ImgPipeline
        pipe = FluxImg2ImgPipeline.from_pretrained(settings.flux_model_id, torch_dtype=torch.bfloat16)
        pipe.enable_model_cpu_offload()
        source = Image.open(io.BytesIO(raw)).convert("RGB").resize((1024, 1024))
        prompt = (f"Photorealistic {request.style} {request.room_type}, professional interior photography. "
                  f"{request.instructions} Preserve windows, doors, walls, floor boundaries, perspective and camera position.")
        image = pipe(image=source, prompt=prompt, strength=.72, guidance_scale=3.5,
            num_inference_steps=28, generator=torch.Generator().manual_seed(request.seed)).images[0]
        filename = f"{uuid.uuid4().hex}.webp"
        image.save(settings.output_dir / filename, "WEBP", quality=92)
        return filename
