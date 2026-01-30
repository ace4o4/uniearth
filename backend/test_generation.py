import os
import time
from google import genai
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")
client = genai.Client(api_key=api_key)

print(f"Testing generation with API Key: {api_key[:10]}...")

models_to_test = [
    "gemini-2.0-flash",
    "gemini-2.0-flash-001",
    "gemini-2.0-flash-exp",
    "gemini-2.5-flash",
]

for model in models_to_test:
    print(f"\nTesting {model}...")
    try:
        response = client.models.generate_content(
            model=model,
            contents="Say 'Hello'",
            config={'temperature': 0.1}
        )
        print(f"✅ SUCCESS: {response.text}")
    except Exception as e:
        print(f"❌ FAILED: {e}")
        # Wait a bit to avoid hitting rate limits immediately for the next one
    time.sleep(2)
