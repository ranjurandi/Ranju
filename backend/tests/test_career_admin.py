import os
import sys
import uuid
from copy import deepcopy
from pathlib import Path
from types import SimpleNamespace

import bcrypt
import pytest
from bson import ObjectId
from fastapi.testclient import TestClient
from pymongo.errors import (
    ConfigurationError,
    OperationFailure,
    ServerSelectionTimeoutError,
)


BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))
os.environ.setdefault("MONGO_URL", "mongodb://127.0.0.1:27017")
os.environ.setdefault("DB_NAME", "godavari_waves_test")
os.environ.setdefault("ADMIN_USERNAME", "test-admin")
os.environ.setdefault("ADMIN_PASSWORD", "test-only-password")
os.environ.setdefault("ADMIN_DISPLAY_NAME", "Test Administrator")
os.environ.setdefault("JWT_SECRET", "test-only-secret-that-is-at-least-32-characters")

import server


def matches(document, query):
    for key, expected in query.items():
        if key == "$or":
            if not any(matches(document, option) for option in expected):
                return False
        elif isinstance(expected, dict) and "$exists" in expected:
            if (key in document) != expected["$exists"]:
                return False
        elif document.get(key) != expected:
            return False
    return True


class FakeCursor:
    def __init__(self, documents):
        self.documents = documents

    def sort(self, key, direction):
        self.documents.sort(key=lambda document: document.get(key, ""), reverse=direction < 0)
        return self

    def limit(self, value):
        self.documents = self.documents[:value]
        return self

    async def to_list(self, length):
        return self.documents[:length]


class UnavailableCursor(FakeCursor):
    async def to_list(self, length):
        raise ServerSelectionTimeoutError("Database is unavailable.")


class FakeCollection:
    def __init__(self):
        self.documents = []

    async def create_indexes(self, indexes):
        return []

    async def insert_one(self, document):
        stored = deepcopy(document)
        stored.setdefault("_id", ObjectId())
        self.documents.append(stored)
        return SimpleNamespace(inserted_id=stored["_id"])

    async def find_one(self, query, projection=None):
        document = next((item for item in self.documents if matches(item, query)), None)
        if document is None:
            return None
        return self.project(document, projection)

    def find(self, query, projection=None):
        documents = [
            self.project(item, projection)
            for item in self.documents
            if matches(item, query)
        ]
        return FakeCursor(documents)

    async def update_one(self, query, update):
        document = next((item for item in self.documents if matches(item, query)), None)
        if document is None:
            return SimpleNamespace(matched_count=0, modified_count=0)
        document.update(deepcopy(update.get("$set", {})))
        return SimpleNamespace(matched_count=1, modified_count=1)

    async def delete_one(self, query):
        for index, document in enumerate(self.documents):
            if matches(document, query):
                del self.documents[index]
                return SimpleNamespace(deleted_count=1)
        return SimpleNamespace(deleted_count=0)

    async def count_documents(self, query):
        return sum(matches(document, query) for document in self.documents)

    @staticmethod
    def project(document, projection):
        result = deepcopy(document)
        if not projection:
            return result
        included = {key for key, value in projection.items() if value}
        if included:
            return {key: result[key] for key in included if key in result}
        return {key: value for key, value in result.items() if projection.get(key, 1)}


class FakeDatabase:
    def __init__(self):
        self.collections = {}

    async def command(self, command):
        return {"ok": 1}

    def __getitem__(self, name):
        if name not in self.collections:
            self.collections[name] = FakeCollection()
        return self.collections[name]

    def __getattr__(self, name):
        if name.startswith("_"):
            raise AttributeError(name)
        return self[name]

    async def list_collection_names(self):
        return list(self.collections)


class UnavailableJobCollection(FakeCollection):
    def find(self, query, projection=None):
        return UnavailableCursor([])


def test_mongo_uri_normalizes_duplicate_scheme():
    assert server.validate_mongo_url(
        "mongodb://mongodb://127.0.0.1:27017/godavari_waves"
    ) == "mongodb://127.0.0.1:27017/godavari_waves"


@pytest.mark.parametrize(
    ("uri", "message"),
    [
        ("https://localhost:27017", "must start with"),
        ("mongodb+srv://", "no MongoDB hostname"),
    ],
)
def test_mongo_uri_rejects_invalid_scheme_or_missing_host(uri, message):
    with pytest.raises(RuntimeError, match=message):
        server.validate_mongo_url(uri)


def test_mongo_connection_errors_are_actionable_and_redacted():
    auth_error = OperationFailure(
        "Authentication failed for mongodb://test-user:test-password@cluster",
        18,
    )
    auth_message = server.mongo_connection_error_message(auth_error)
    assert "authentication failed" in auth_message.lower()
    assert "test-password" not in auth_message

    timeout_message = server.mongo_connection_error_message(
        ServerSelectionTimeoutError("Server selection timed out.")
    )
    assert "Atlas IP access list" in timeout_message

    dns_error = ConfigurationError(
        "DNS SRV lookup failed for mongodb+srv://test-user:test-password@cluster"
    )
    dns_message = server.mongo_connection_error_message(dns_error)
    assert "DNS/SRV" in dns_message
    assert "test-password" not in dns_message


@pytest.fixture
def api(monkeypatch, tmp_path):
    database = FakeDatabase()
    monkeypatch.setattr(server, "db", database)
    monkeypatch.setattr(server, "ADMIN_USERNAME", "test-admin")
    monkeypatch.setattr(server, "ADMIN_PASSWORD", "test-only-password")
    monkeypatch.setattr(
        server,
        "JWT_SECRET",
        "test-only-secret-that-is-at-least-32-characters",
    )
    monkeypatch.setattr(server, "RESUME_DIRECTORY", tmp_path / "private-resumes")
    with TestClient(server.app) as client:
        yield client, database


def sign_in(client):
    response = client.post(
        "/api/admin/login",
        json={"username": "test-admin", "password": "test-only-password"},
    )
    assert response.status_code == 200
    return response.json()["access_token"]


def test_admin_authentication_and_logout_revoke_session(api):
    client, _ = api
    assert client.get("/api/admin/profile").status_code == 401
    assert client.post(
        "/api/admin/login",
        json={"username": "test-admin", "password": "wrong"},
    ).status_code == 401

    token = sign_in(client)
    headers = {"Authorization": f"Bearer {token}"}
    profile = client.get("/api/admin/profile", headers=headers)
    assert profile.status_code == 200
    assert profile.json() == {
        "name": "Test Administrator",
        "username": "test-admin",
        "role": "Administrator",
    }

    assert client.post("/api/admin/logout", headers=headers).status_code == 200
    assert client.get("/api/admin/profile", headers=headers).status_code == 401


def test_admin_login_verifies_bcrypt_password_hash(api, monkeypatch):
    client, _ = api
    password = b"test-only-password"
    password_hash = bcrypt.hashpw(password, bcrypt.gensalt(rounds=4)).decode("ascii")
    monkeypatch.setattr(server, "ADMIN_PASSWORD", password_hash)

    response = client.post(
        "/api/admin/login",
        json={"username": "test-admin", "password": password.decode("ascii")},
    )

    assert response.status_code == 200
    assert response.json()["token_type"] == "bearer"


def test_job_publish_application_and_private_resume_flow(api):
    client, database = api
    headers = {"Authorization": f"Bearer {sign_in(client)}"}
    job = {
        "title": "Frontend Engineer",
        "department": "Engineering",
        "location": "Hyderabad",
        "employment_type": "Full-time",
        "experience": "2+ years",
        "description": "Build and maintain accessible web experiences.",
        "skills": ["React", "JavaScript"],
        "vacancies": 2,
        "is_active": False,
    }

    created = client.post("/api/admin/jobs", headers=headers, json=job)
    assert created.status_code == 201
    job_id = created.json()["id"]
    assert client.get("/api/careers/jobs").json() == []

    job["is_active"] = True
    assert client.put(f"/api/admin/jobs/{job_id}", headers=headers, json=job).status_code == 200
    public_jobs = client.get("/api/careers/jobs").json()
    assert len(public_jobs) == 1
    assert public_jobs[0]["title"] == "Frontend Engineer"

    application_fields = {
        "job_id": job_id,
        "full_name": "Asha Applicant",
        "email": "asha@example.com",
        "phone": "+91 98765 43210",
        "experience": "3 years",
        "skills": "React, accessibility",
        "additional_message": "Available next month.",
    }
    invalid_resume = client.post(
        "/api/careers/applications",
        data=application_fields,
        files={"resume": ("resume.txt", b"not a resume", "text/plain")},
    )
    assert invalid_resume.status_code == 400
    invalid_phone = client.post(
        "/api/careers/applications",
        data={**application_fields, "phone": "not-a-number"},
        files={"resume": ("resume.pdf", b"%PDF-1.4 test resume", "application/pdf")},
    )
    assert invalid_phone.status_code == 422
    oversized_resume = client.post(
        "/api/careers/applications",
        data=application_fields,
        files={
            "resume": (
                "resume.pdf",
                b"%PDF-1.4" + b"x" * server.MAX_RESUME_SIZE,
                "application/pdf",
            )
        },
    )
    assert oversized_resume.status_code == 413

    submitted = client.post(
        "/api/careers/applications",
        data=application_fields,
        files={"resume": ("resume.pdf", b"%PDF-1.4 test resume", "application/pdf")},
    )
    assert submitted.status_code == 201
    application_id = submitted.json()["id"]
    stored = database.career_applications.documents[0]
    assert Path(stored["resume_path"]).is_file()
    assert "resume_path" not in client.get(
        f"/api/admin/applications/{application_id}",
        headers=headers,
    ).json()

    resume_response = client.get(
        f"/api/admin/applications/{application_id}/resume",
        headers=headers,
    )
    assert resume_response.status_code == 200
    assert resume_response.content.startswith(b"%PDF-")

    updated = client.patch(
        f"/api/admin/applications/{application_id}/status",
        headers=headers,
        json={"status": "Reviewing"},
    )
    assert updated.status_code == 200
    assert client.get("/api/admin/applications", headers=headers).json()[0]["status"] == "Reviewing"
    dashboard = client.get("/api/admin/dashboard", headers=headers).json()
    assert dashboard["total_job_requirements"] == 1
    assert dashboard["active_job_openings"] == 1
    assert dashboard["total_career_applications"] == 1
    assert dashboard["pending_applications"] == 0

    admin_jobs = client.get("/api/admin/jobs", headers=headers)
    assert admin_jobs.status_code == 200
    assert [item["id"] for item in admin_jobs.json()] == [job_id]

    deleted = client.delete(f"/api/admin/jobs/{job_id}", headers=headers)
    assert deleted.status_code == 200
    assert client.get("/api/admin/jobs", headers=headers).json() == []
    assert client.get("/api/careers/jobs").json() == []
    assert client.get("/api/admin/applications", headers=headers).json()[0]["id"] == application_id


def test_contact_queries_are_saved_and_status_is_admin_managed(api):
    client, _ = api
    headers = {"Authorization": f"Bearer {sign_in(client)}"}
    submitted = client.post(
        "/api/contact",
        json={
            "name": "Contact Person",
            "email": "contact@example.com",
            "phone": "9876543210",
            "company": "Example Co",
            "subject": "Project inquiry",
            "message": "Please contact me about a project.",
        },
    )
    assert submitted.status_code == 200

    queries = client.get("/api/admin/contact-queries", headers=headers).json()
    assert len(queries) == 1
    assert queries[0]["subject"] == "Project inquiry"
    assert queries[0]["status"] == "New"
    dashboard = client.get("/api/admin/dashboard", headers=headers).json()
    assert dashboard["registered_users"] is None
    assert dashboard["total_contact_queries"] == 1
    assert dashboard["new_contact_queries"] == 1

    updated = client.patch(
        f"/api/admin/contact-queries/{queries[0]['id']}/status",
        headers=headers,
        json={"status": "Read"},
    )
    assert updated.status_code == 200
    assert client.get("/api/admin/contact-queries", headers=headers).json()[0]["status"] == "Read"
    assert client.get("/api/admin/dashboard", headers=headers).json()["new_contact_queries"] == 0


def test_unavailable_jobs_database_returns_retryable_cors_response(api):
    client, database = api
    database.collections["job_requirements"] = UnavailableJobCollection()

    response = client.get(
        "/api/careers/jobs",
        headers={"Origin": "http://localhost:3000"},
    )

    assert response.status_code == 503
    assert "MongoDB connection" in response.json()["detail"]
    assert response.headers["access-control-allow-origin"] == "http://localhost:3000"
