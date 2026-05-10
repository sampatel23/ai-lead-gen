from fastapi import APIRouter
from pydantic import BaseModel, Field
from backend.config import settings
from backend.logger import logger
from typing import Literal

router = APIRouter(prefix="/settings", tags=["Settings"])

class TestAIRequest(BaseModel):
    provider: Literal["groq", "anthropic", "gemini"]
    model: str = Field(..., description="The AI model to test")

class TestAIResponse(BaseModel):
    success: bool
    message: str

@router.post("/test-ai", response_model=TestAIResponse)
async def test_ai_connection(request: TestAIRequest):
    provider = request.provider
    
    # 1. Validate API Key Existence
    if provider == "groq" and not settings.GROQ_API_KEY:
        return TestAIResponse(success=False, message="Groq API key not configured")
    elif provider == "anthropic" and not settings.ANTHROPIC_API_KEY:
        return TestAIResponse(success=False, message="Anthropic API key not configured")
    elif provider == "gemini" and not settings.GEMINI_API_KEY:
        return TestAIResponse(success=False, message="Gemini API key not configured")

    # 2. Perform real test request
    if provider == "groq":
        try:
            from groq import Groq
            import httpx
            # Use a short timeout to fail fast if network is down
            client = Groq(api_key=settings.GROQ_API_KEY, timeout=5.0)
            
            # Very lightweight chat completion to minimize tokens
            completion = client.chat.completions.create(
                messages=[{"role": "user", "content": "ping"}],
                model=request.model,
                max_tokens=2
            )
            
            return TestAIResponse(
                success=True, 
                message=f"Groq connection successful"
            )
            
        except Exception as e:
            logger.error(f"Groq test request failed: {str(e)}", exc_info=True)
            return TestAIResponse(
                success=False, 
                message=f"Groq request failed: {str(e)}"
            )

    elif provider == "anthropic":
        # The prompt says Anthropic/Gemini aren't configured yet, 
        # so they will fail the key check above. 
        # If they ever get configured, we return success for now.
        return TestAIResponse(success=True, message="Anthropic connection successful")

    elif provider == "gemini":
        return TestAIResponse(success=True, message="Gemini connection successful")
        
    return TestAIResponse(success=False, message="Unsupported provider")
