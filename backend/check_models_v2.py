import os
from google import genai
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")

if not api_key:
    print("ERROR: GOOGLE_API_KEY not found in .env")
    exit(1)

print(f"Checking models with key: {api_key[:5]}...")

try:
    client = genai.Client(api_key=api_key)
    print("Successfully created client.")
    
    print("\n--- Available Models ---")
    # Paging through models if necessary, or just listing
    # The new SDK might return an iterator
    pager = client.models.list() 
    for model in pager:
        # Check if it supports generation
        if "generateContent" in (model.supported_generation_methods or []):
            print(f"Name: {model.name}")
            print(f"  Display Name: {model.display_name}")
            print(f"  Resource Name: {model.name}") # Usually models/something
            print("-" * 20)
            
except Exception as e:
    print(f"\nCRITICAL ERROR: {e}")
