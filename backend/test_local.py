import asyncio
from api.routes import create_project

async def test_local():
    # Pass necessary mock objects
    try:
        res = await create_project(
            project_name="TestException",
            srs_text="This is a test SRS string for the SDLC backend.",
            srs_file=None,
            llm_provider="gemini",
            ollama_url=None
        )
        print("Success:", res)
    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_local())
