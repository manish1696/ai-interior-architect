from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    app_name: str = "AI Interior Architect"
    mode: str = "demo"
    device: str = "cuda"
    output_dir: Path = Path("outputs")
    flux_model_id: str = "black-forest-labs/FLUX.1-schnell"
    max_upload_mb: int = 12

settings = Settings()
