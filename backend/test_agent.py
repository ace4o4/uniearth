import requests
import json

def test_agent(query: str):
    print(f"\n🧠 Prompting Agent: '{query}'")
    url = "http://localhost:8000/agent/reason"
    payload = {"query": query}
    
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        
        result = response.json()
        print("💡 Agent Thoughts:")
        for thought in result['thoughts']:
             print(f"  - {thought}")
        
        print("\n⚡ Actions Taken:")
        if not result['actions']:
            print("  - (No external tools called)")
        for action in result['actions']:
            print(f"  - {action}")
            
        print(f"\n🗣️ Final Answer: {result['answer']}")
        
    except Exception as e:
        print(f"❌ Agent Request Failed: {e}")

if __name__ == "__main__":
    # Test 1: Standard
    test_agent("Show me crop health in Punjab")
    
    # Test 2: Spatial Completeness (Should trigger Optical Fusion)
    test_agent("I need to see precise field boundaries for my farm in Haryana")
    
    # Test 3: All-Weather/Cloudy (Should trigger SAR Fusion)
    test_agent("Assess flood damage in Assam, it is very cloudy and raining")
