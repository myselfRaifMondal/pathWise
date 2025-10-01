import requests

API_URL = "http://127.0.0.1:5000/api/signup"

def signup(email, password):
    payload = {"email": email, "password": password}
    response = requests.post(API_URL, json=payload)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")

if __name__ == "__main__":
    # Change these values to test different users
    signup("testuser@example.com", "testpassword123")
