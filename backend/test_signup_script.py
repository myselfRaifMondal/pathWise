import requests

API_URL = "http://127.0.0.1:5001/api/signup"

def signup(email, password):
    payload = {"email": email, "password": password}
    try:
        response = requests.post(API_URL, json=payload, timeout=10)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    # Change these values to test different users
    signup("testuser@example.com", "testpassword123")
