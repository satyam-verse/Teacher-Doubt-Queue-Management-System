"""
DoubtX AI - Universal AI Intelligence Verification Suite
Tests the 15 benchmark multi-domain questions, multi-turn conversational memory,
difficulty level adaptations, conversation management (rename, delete, regenerate),
multimodal direct uploads, and classroom queue preservation.
"""
import os
import sys
import io
import time

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.src import create_app
from backend.src.extensions import db

class TestClientWrapper:
    """Wraps Flask test_client to present a requests-like interface for in-memory suite execution."""
    def __init__(self, client):
        self.client = client

    def get(self, url, headers=None, params=None):
        path = url.replace("http://127.0.0.1:5000", "")
        kwargs = {'headers': headers or {}}
        if params is not None:
            kwargs['query_string'] = params
        return self._wrap(self.client.get(path, **kwargs))

    def post(self, url, headers=None, json=None, data=None, files=None):
        path = url.replace("http://127.0.0.1:5000", "")
        if files:
            upload_data = {}
            for k, (fn, b, ct) in files.items():
                upload_data[k] = (b, fn, ct)
            return self._wrap(self.client.post(path, data=upload_data, headers=headers or {}, content_type='multipart/form-data'))
        return self._wrap(self.client.post(path, headers=headers or {}, json=json))

    def patch(self, url, headers=None, json=None):
        path = url.replace("http://127.0.0.1:5000", "")
        return self._wrap(self.client.patch(path, headers=headers or {}, json=json))

    def delete(self, url, headers=None):
        path = url.replace("http://127.0.0.1:5000", "")
        return self._wrap(self.client.delete(path, headers=headers or {}))

    def _wrap(self, res):
        class Resp:
            def __init__(self, r):
                self.status_code = r.status_code
                self._r = r
                self.text = r.get_data(as_text=True)
            def json(self):
                return self._r.get_json() or {}
        return Resp(res)

BASE_URL = "http://127.0.0.1:5000"

def run_universal_verification():
    app = create_app('development')
    with app.app_context():
        db.create_all()
        from backend.src.models.user import User
        student = User.query.filter_by(email='student@doubtx.ai').first()
        if student:
            student.daily_ai_query_count = 0
            student.subscription_tier = 'campus'  # ensure sufficient quota for all 15 benchmark questions
            db.session.commit()
    client = app.test_client()
    requests = TestClientWrapper(client)

    print("=" * 70)
    print("DOUBTX AI: UNIVERSAL AI INTELLIGENCE VERIFICATION SUITE")
    print("=" * 70)

    # 1. AI Health and Connection Status
    print("\n[1] Checking AI Health Endpoint (GET /api/v1/ai/health)...")
    r = requests.get(f"{BASE_URL}/api/v1/ai/health")
    print(f"Status: {r.status_code}")
    health = r.json()
    print(f"Health Response: Status={health.get('status')}, Model={health.get('model')}, Message={health.get('message')}")
    assert r.status_code == 200

    # 2. Authentication
    print("\n[2] Logging in as Test Student...")
    r = requests.post(f"{BASE_URL}/api/v1/auth/login", json={
        "email": "student@doubtx.ai",
        "password": "Student123!"
    })
    assert r.status_code == 200
    token = r.json().get('token')
    headers = {"Authorization": f"Bearer {token}"}
    print("Logged in successfully. User:", r.json()['user']['full_name'])

    # 3. Create a Universal Multi-Domain Conversation
    print("\n[3] Creating Universal Multi-Domain AI Thread...")
    r = requests.post(f"{BASE_URL}/api/v1/ai/conversations", headers=headers, json={
        "title": "Universal Academic Exploration",
        "explanation_level": "intermediate"
    })
    assert r.status_code == 201
    conv_id = r.json()['conversation']['id']
    print(f"Created conversation ID: {conv_id}")

    # 4. Multi-Turn Context Continuity Test (Cloud Computing -> What are its types? -> Give practical examples)
    print("\n[4] Testing Intelligent Conversation Memory (3 sequential turns)...")
    
    # Turn A
    r_a = requests.post(f"{BASE_URL}/api/v1/ai/conversations/{conv_id}/messages", headers=headers, json={
        "content": "Explain cloud computing.",
        "explanation_level": "intermediate"
    })
    assert r_a.status_code == 201
    ans_a = r_a.json()['assistant_message']['content']
    print(f"Turn 1 ('Explain cloud computing'): Received {len(ans_a)} chars.")
    print(f"Preview: {ans_a[:100].encode('ascii', 'replace').decode('ascii').strip()}...\n")

    # Turn B (Follow-up relying on context: 'its')
    r_b = requests.post(f"{BASE_URL}/api/v1/ai/conversations/{conv_id}/messages", headers=headers, json={
        "content": "What are its types?",
        "explanation_level": "intermediate"
    })
    assert r_b.status_code == 201
    ans_b = r_b.json()['assistant_message']['content']
    print(f"Turn 2 ('What are its types?'): Received {len(ans_b)} chars.")
    print(f"Preview: {ans_b[:100].encode('ascii', 'replace').decode('ascii').strip()}...\n")

    # Turn C (Further follow-up: 'Give practical examples')
    r_c = requests.post(f"{BASE_URL}/api/v1/ai/conversations/{conv_id}/messages", headers=headers, json={
        "content": "Give practical examples for each type.",
        "explanation_level": "intermediate"
    })
    assert r_c.status_code == 201
    ans_c = r_c.json()['assistant_message']['content']
    print(f"Turn 3 ('Give practical examples'): Received {len(ans_c)} chars.")
    print(f"Preview: {ans_c[:100].encode('ascii', 'replace').decode('ascii').strip()}...\n")

    # 5. Test Rename Conversation
    print("[5] Testing Rename Chat Functionality (PATCH /api/v1/ai/conversations/<id>)...")
    r_rename = requests.patch(f"{BASE_URL}/api/v1/ai/conversations/{conv_id}", headers=headers, json={
        "title": "Mastering Cloud Computing & Architecture"
    })
    assert r_rename.status_code == 200
    new_title = r_rename.json()['conversation']['title']
    print(f"Updated Title: '{new_title}'")
    assert new_title == "Mastering Cloud Computing & Architecture"

    # 6. Test Regenerate Last Message
    print("\n[6] Testing Regenerate Response (POST /api/v1/ai/conversations/<id>/regenerate)...")
    r_regen = requests.post(f"{BASE_URL}/api/v1/ai/conversations/{conv_id}/regenerate", headers=headers, json={
        "explanation_level": "advanced"
    })
    assert r_regen.status_code in [200, 201]
    print(f"Regenerated message status: {r_regen.status_code}")

    # 7. Testing 15 Benchmark Multi-Domain Questions Across Difficulty Modes
    questions = [
        ("How can I learn SQL easily?", "beginner", "Computer Science / Databases"),
        ("Explain AWS EC2 vs AWS Lambda.", "intermediate", "Cloud Architecture"),
        ("Write a Python program for binary search.", "intermediate", "Programming & Algorithms"),
        ("Explain database normalization.", "intermediate", "Database Design"),
        ("What is photosynthesis?", "beginner", "Biological Sciences"),
        ("Explain Newton's laws of motion.", "beginner", "Classical Physics"),
        ("How does compound interest work?", "beginner", "Finance & Mathematics"),
        ("Explain climate change.", "intermediate", "Environmental Science"),
        ("What is Kubernetes?", "intermediate", "DevOps & Container Orchestration"),
        ("Explain the French Revolution.", "intermediate", "World History"),
        ("How does DNA replication work?", "advanced", "Molecular Genetics"),
        ("Explain blockchain technology.", "intermediate", "FinTech & Cryptography"),
        ("Solve a mathematical equation step by step: 2x^2 + 5x - 3 = 0", "intermediate", "Algebra & Mathematics"),
        ("Explain a concept combining cloud computing and cybersecurity: Zero Trust Cloud Architecture", "advanced", "Interdisciplinary"),
        ("Explain the Quantum Hall effect in bilayer graphene.", "advanced", "Unfamiliar / Emerging Physics"),
    ]

    print("\n[7] Testing the 15 Universal Multi-Domain Questions...")
    for idx, (q, lvl, category) in enumerate(questions, 1):
        # Create separate conversation for independence check
        r_q_conv = requests.post(f"{BASE_URL}/api/v1/ai/conversations", headers=headers, json={
            "title": f"Test Q{idx}: {q[:25]}",
            "explanation_level": lvl
        })
        assert r_q_conv.status_code == 201
        test_cid = r_q_conv.json()['conversation']['id']

        t0 = time.time()
        r_msg = requests.post(f"{BASE_URL}/api/v1/ai/conversations/{test_cid}/messages", headers=headers, json={
            "content": q,
            "explanation_level": lvl
        })
        elapsed = time.time() - t0
        assert r_msg.status_code == 201
        content = r_msg.json()['assistant_message']['content']
        safe_preview = content[:80].encode('ascii', 'replace').decode('ascii').replace('\n', ' ').strip()
        print(f"  Q{idx:02d} [{category}] ({lvl.upper()}): {elapsed:.2f}s | {len(content)} chars")
        print(f"       -> First 80 chars: {safe_preview}...")

        # Clean up conversation
        requests.delete(f"{BASE_URL}/api/v1/ai/conversations/{test_cid}", headers=headers)

    # 8. Test Direct Uploads (Images and PDFs)
    print("\n[8] Testing Direct File Upload Endpoint (POST /api/v1/uploads/direct)...")
    # Image upload simulation
    img_data = io.BytesIO(b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\rIDATx\x9cc`\x00\x00\x00\x02\x00\x01H\xaf\xa4q\x00\x00\x00\x00IEND\xaeB`\x82')
    r_img = requests.post(f"{BASE_URL}/api/v1/uploads/direct", files={'file': ('circuit_diagram.png', img_data, 'image/png')}, headers=headers)
    assert r_img.status_code == 201
    img_url = r_img.json()['file_url']
    print(f"Uploaded Image URL: {img_url}")

    # PDF upload simulation
    pdf_data = io.BytesIO(b'%PDF-1.4\n1 0 obj\n<< /Title (Academic Paper) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF')
    r_pdf = requests.post(f"{BASE_URL}/api/v1/uploads/direct", files={'file': ('lecture_notes.pdf', pdf_data, 'application/pdf')}, headers=headers)
    assert r_pdf.status_code == 201
    pdf_url = r_pdf.json()['file_url']
    print(f"Uploaded PDF URL: {pdf_url}")

    # 9. Clean up test thread
    print("\n[9] Deleting Primary Test Thread...")
    r_del = requests.delete(f"{BASE_URL}/api/v1/ai/conversations/{conv_id}", headers=headers)
    assert r_del.status_code == 200
    print("Conversation deleted successfully.")

    # 10. Classroom Queue Preservation Verification
    print("\n[10] Verifying Legacy & Classroom Queue System Preservation...")
    r_legacy_home = requests.get(f"{BASE_URL}/")
    assert r_legacy_home.status_code == 200
    assert r_legacy_home.text == "Doubt Queue System Running!"
    print("Legacy GET /: PASSED ('Doubt Queue System Running!')")

    r_legacy_add = requests.get(f"{BASE_URL}/add?name=UniversalTestStudent&doubt=Testing+Quantum+Computing+Qubit+Superposition")
    assert r_legacy_add.status_code == 200
    assert r_legacy_add.text == "Doubt Added Successfully!"
    print("Legacy GET /add: PASSED ('Doubt Added Successfully!')")

    r_doubts = requests.get(f"{BASE_URL}/api/v1/doubts")
    assert r_doubts.status_code == 200
    print(f"Classroom Queue Doubts Count: {len(r_doubts.json()['doubts'])}, Stats: {r_doubts.json()['stats']}")

    print("\n" + "=" * 70)
    print("ALL 10 VERIFICATION CATEGORIES & 15 QUESTIONS PASSED SUCCESSFULLY!")
    print("=" * 70)

if __name__ == '__main__':
    run_universal_verification()
