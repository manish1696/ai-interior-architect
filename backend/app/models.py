from pydantic import BaseModel, Field

class DesignRequest(BaseModel):
    room_type: str = "Living room"
    style: str = "Japandi"
    budget: str = "₹2–4 lakh"
    instructions: str = Field(min_length=3, max_length=1500)
    seed: int = 42

class Analysis(BaseModel):
    room_type: str
    structural_elements: list[str]
    detected_objects: list[str]
    recommendations: list[str]

class DesignResponse(BaseModel):
    job_id: str
    status: str
    output_url: str
    analysis: Analysis
    mode: str
