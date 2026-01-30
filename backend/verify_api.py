import requests
import json
from datetime import datetime

BASE_URL = "http://127.0.0.1:8000"

def test_root():
    print(f"Testing GET {BASE_URL}/ ...")
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        if response.status_code == 200:
            print("✅ Root Endpoint Working")
        else:
            print("❌ Root Endpoint Failed")
    except Exception as e:
        print(f"❌ Connection Failed: {e}")

def test_health():
    print(f"\nTesting GET {BASE_URL}/health ...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        if response.status_code == 200 and response.json().get("status") == "ok":
            print("✅ Health Check Working")
        else:
            print("❌ Health Check Failed")
    except Exception as e:
        print(f"❌ Connection Failed: {e}")

def test_search():
    print(f"\nTesting POST {BASE_URL}/search ...")
    payload = {
        "source_id": "sentinel-2",
        "bbox": [77.1, 28.5, 77.3, 28.7],
        "start_date": "2024-01-01T00:00:00Z",
        "end_date": "2024-01-10T00:00:00Z"
    }
    try:
        response = requests.post(f"{BASE_URL}/search", json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        if response.status_code == 200:
            print("✅ Search Endpoint Working")
        else:
            print(f"❌ Search Endpoint Failed: {response.text}")
    except Exception as e:
        print(f"❌ Connection Failed: {e}")

def test_fuse_pan_sharpen():
    print(f"\nTesting POST {BASE_URL}/fuse (Pan-Sharpen) ...")
    payload = {
        "method": "pan-sharpen",
        "optical_source_id": "sentinel-2",
        "secondary_source_id": "liss-4"  # Arbitrary for now as it's mocked
    }
    try:
        response = requests.post(f"{BASE_URL}/fuse", json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        if response.status_code == 200 and response.json().get("status") == "success":
            print("✅ Fuse (Pan-Sharpen) Working")
        else:
            print(f"❌ Fuse (Pan-Sharpen) Failed: {response.text}")
    except Exception as e:
        print(f"❌ Connection Failed: {e}")

def test_fuse_sar_optical():
    print(f"\nTesting POST {BASE_URL}/fuse (SAR-Optical) ...")
    payload = {
        "method": "sar-optical",
        "optical_source_id": "sentinel-2",
        "secondary_source_id": "sentinel-1"
    }
    try:
        response = requests.post(f"{BASE_URL}/fuse", json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        if response.status_code == 200 and response.json().get("status") == "success":
            print("✅ Fuse (SAR-Optical) Working")
        else:
            print(f"❌ Fuse (SAR-Optical) Failed: {response.text}")
    except Exception as e:
        print(f"❌ Connection Failed: {e}")

if __name__ == "__main__":
    print("Starting Backend API Verification...")
    test_root()
    test_health()
    test_search()
    test_fuse_pan_sharpen()
    test_fuse_sar_optical()
    print("\nVerification Complete.")
