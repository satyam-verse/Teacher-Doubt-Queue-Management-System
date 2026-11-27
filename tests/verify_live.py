import requests
import json

BASE_URL = "http://127.0.0.1:5000"

def test_live_server():
    print(f"--- 1. Testing GET {BASE_URL}/ ---")
    r = requests.get(f"{BASE_URL}/")
    print("Status:", r.status_code, "Response:", r.text)
    assert r.status_code == 200
    assert r.text == "Doubt Queue System Running!"

    print(f"\n--- 2. Testing Legacy GET {BASE_URL}/add ---")
    r = requests.get(f"{BASE_URL}/add?name=LiveStudent&doubt=Testing+Live+Legacy+Add")
    print("Status:", r.status_code, "Response:", r.text)
    assert r.status_code == 200
    assert r.text == "Doubt Added Successfully!"

    print(f"\n--- 3. Testing Socket.IO Handshake ---")
    r = requests.get(f"{BASE_URL}/socket.io/?EIO=4&transport=polling")
    print("Status:", r.status_code, "Response preview:", r.text[:60])
    assert r.status_code == 200
    assert "0{" in r.text  # Socket.IO open packet starts with 0{"sid":...}

    print(f"\n--- 4. Testing Teacher Login (Default Seeded Account) ---")
    r = requests.post(f"{BASE_URL}/api/v1/auth/login", json={
        "email": "teacher@doubtx.ai",
        "password": "Teacher123!"
    })
    print("Status:", r.status_code, "User:", r.json().get('user'))
    assert r.status_code == 200
    teacher_token = r.json().get('token')
    assert teacher_token is not None

    print(f"\n--- 5. Testing Student Login (Default Seeded Account) ---")
    r = requests.post(f"{BASE_URL}/api/v1/auth/login", json={
        "email": "student@doubtx.ai",
        "password": "Student123!"
    })
    print("Status:", r.status_code, "User:", r.json().get('user'))
    assert r.status_code == 200
    student_token = r.json().get('token')
    assert student_token is not None

    print(f"\n--- 6. Testing Registration of New Student Account ---")
    import random
    rand_id = random.randint(1000, 9999)
    new_email = f"student_{rand_id}@university.edu"
    r = requests.post(f"{BASE_URL}/api/v1/auth/register", json={
        "email": new_email,
        "password": "Password123!",
        "full_name": f"Student Test {rand_id}",
        "role": "student"
    })
    print("Status:", r.status_code, "New User:", r.json().get('user'))
    assert r.status_code == 201

    print(f"\n--- 7. Testing Doubts List API ---")
    r = requests.get(f"{BASE_URL}/api/v1/doubts")
    data = r.json()
    print("Status:", r.status_code, "Total doubts:", len(data.get('doubts', [])), "Stats:", data.get('stats'))
    assert r.status_code == 200
    assert len(data.get('doubts', [])) >= 3

    print(f"\n--- 8. Testing AI Doubt Solver Conversation Lifecycle ---")
    headers = {"Authorization": f"Bearer {student_token}"}
    r = requests.post(f"{BASE_URL}/api/v1/ai/conversations", headers=headers, json={
        "title": "Python Dictionary vs List",
        "level": "intermediate"
    })
    print("Create Conv Status:", r.status_code)
    assert r.status_code == 201
    conv_id = r.json()['conversation']['id']

    r = requests.post(f"{BASE_URL}/api/v1/ai/conversations/{conv_id}/messages", headers=headers, json={
        "content": "Explain time complexity of dictionary lookup in Python.",
        "level": "intermediate"
    })
    print("Send Message Status:", r.status_code)
    assert r.status_code == 201
    assert "assistant_message" in r.json()
    print("AI Response Preview:", r.json()['assistant_message']['content'][:80], "...")

    r = requests.delete(f"{BASE_URL}/api/v1/ai/conversations/{conv_id}", headers=headers)
    print("Delete Conv Status:", r.status_code)
    assert r.status_code == 200

    print("\n ALL LIVE SYSTEM VERIFICATIONS PASSED SUCCESSFULLY!")

if __name__ == '__main__':
    test_live_server()
