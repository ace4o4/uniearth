import requests
import json

# New Delhi Bbox (approx)
bbox = [77.10, 28.50, 77.30, 28.70] 

payload = {
    "source_id": "sentinel-2",
    "bbox": bbox,
    "start_date": "2024-01-01",
    "end_date": "2024-01-30"
}

try:
    print("Testing Search API...")
    res = requests.post("http://localhost:8000/search", json=payload)
    print(f"Status: {res.status_code}")
    if res.status_code == 200:
        data = res.json()
        print(f"Count: {data.get('count')}")
        if data.get('results'):
             print("First Result:", json.dumps(data['results'][0], indent=2))
        else:
             print("Results is empty or None")
    else:
        print("Error:", res.text)
except Exception as e:
    print("Exception:", str(e))
