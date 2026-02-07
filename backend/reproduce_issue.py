
import os
import sys
from dotenv import load_dotenv

# Force load dotenv
load_dotenv()

print(f"CWD: {os.getcwd()}")
print(f"GOOGLE_API_KEY: {os.getenv('GOOGLE_API_KEY')}")

try:
    from agent.core import SatFusionAgent
    print("Imported SatFusionAgent successfully")
    agent = SatFusionAgent()
    print(f"Agent Initialized. Client: {agent.client}")
except Exception as e:
    print(f"Error initializing agent: {e}")
    import traceback
    traceback.print_exc()

try:
    from main import app
    print("Imported main app successfully")
except Exception as e:
    print(f"Error importing main: {e}")
    import traceback
    traceback.print_exc()
