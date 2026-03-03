# test_pipeline.py
import asyncio
import json
import httpx

API_URL = "http://127.0.0.1:8000/api/projects/create"

# Sample SRS text
SAMPLE_SRS = """
E-Commerce Platform Requirements:
The system shall be a modern e-commerce platform where users can browse products, add them to a cart, and checkout.
It must include user authentication (login/signup), a product catalog with search and filtering, and an admin dashboard to manage inventory.
The frontend should be built with React and Tailwind CSS.
The backend should be an Express.js or FastAPI application with a PostgreSQL database.
"""

async def test_create_project():
    print("Starting e2e integration test...")
    try:
        async with httpx.AsyncClient(timeout=300.0) as client:
            print(f"Sending request to {API_URL}...")
            
            # Using multipart/form-data as per the routes.py definition
            data = {
                "project_name": "TestECommerce",
                "srs_text": SAMPLE_SRS,
                "llm_provider": "gemini" # using gemini as it's configured
            }
            
            response = await client.post(API_URL, data=data)
            
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print("✅ Project creation successful!")
                print("Project ID:", result.get("project_id"))
                print("Phases Generated:")
                for phase, m in result.get("metadata", {}).get("phases", {}).items():
                    print(f"  - {phase}: ✓")
            else:
                print("❌ Project creation failed!")
                print("Error Details:", response.text)
                
    except Exception as e:
        print(f"❌ Exception occurred: {e}")

if __name__ == "__main__":
    asyncio.run(test_create_project())
