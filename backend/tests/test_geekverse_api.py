"""Backend API tests for Geekverse."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://nerd-lab.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="session")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ---- Categories ----
def test_categories_list(session):
    r = session.get(f"{API}/categories", timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) == 8
    slugs = {c["slug"] for c in data}
    assert {"dev", "network", "security", "os", "ai", "media", "hardware", "fun"} <= slugs
    for c in data:
        assert c["color"].startswith("#") and len(c["color"]) == 7
        assert "_id" not in c


# ---- Tools listing ----
def test_tools_seed_count(session):
    r = session.get(f"{API}/tools", timeout=15)
    assert r.status_code == 200
    tools = r.json()
    assert isinstance(tools, list)
    assert len(tools) >= 67
    for t in tools[:5]:
        assert "_id" not in t
        assert "id" in t and "name" in t and "category_slug" in t


def test_tools_search_git(session):
    r = session.get(f"{API}/tools", params={"search": "git"}, timeout=15)
    assert r.status_code == 200
    tools = r.json()
    assert len(tools) > 0
    # All results should contain 'git' (case-insensitive) somewhere
    for t in tools:
        haystack = (t["name"] + " " + t["description"] + " " + " ".join(t.get("alternative_uses", []))).lower()
        assert "git" in haystack


def test_tools_filter_category_dev(session):
    r = session.get(f"{API}/tools", params={"category": "dev"}, timeout=15)
    assert r.status_code == 200
    tools = r.json()
    assert len(tools) > 0
    for t in tools:
        assert t["category_slug"] == "dev"


def test_tools_sort_name(session):
    r = session.get(f"{API}/tools", params={"sort": "name"}, timeout=15)
    assert r.status_code == 200
    names = [t["name"] for t in r.json()]
    assert names == sorted(names)


def test_tools_sort_popularity(session):
    r = session.get(f"{API}/tools", params={"sort": "popularity"}, timeout=15)
    assert r.status_code == 200
    tools = r.json()
    # Sort key is click_count desc, then popularity desc
    keys = [(t["click_count"], t["popularity"]) for t in tools]
    assert keys == sorted(keys, key=lambda x: (-x[0], -x[1]))


def test_tools_invalid_sort_rejected(session):
    r = session.get(f"{API}/tools", params={"sort": "garbage"}, timeout=15)
    assert r.status_code in (400, 422)


# ---- Single tool ----
def test_get_tool_by_id_and_404(session):
    listing = session.get(f"{API}/tools").json()
    sample = listing[0]
    r = session.get(f"{API}/tools/{sample['id']}", timeout=15)
    assert r.status_code == 200
    assert r.json()["id"] == sample["id"]

    r404 = session.get(f"{API}/tools/does-not-exist", timeout=15)
    assert r404.status_code == 404


# ---- Stats ----
def test_stats(session):
    r = session.get(f"{API}/stats", timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert data["categories"] == 8
    assert data["tools"] >= 67
    assert isinstance(data["total_clicks"], int)


# ---- Github repos ----
def test_github_repos(session):
    r = session.get(f"{API}/github/repos", timeout=15)
    assert r.status_code == 200
    repos = r.json()
    assert isinstance(repos, list)
    assert len(repos) >= 5
    for repo in repos:
        assert "name" in repo and "url" in repo and "stars" in repo


# ---- CRUD: create / click / update / delete ----
class TestToolCRUD:
    created_id = None

    def test_create_invalid_category(self, session):
        payload = {
            "name": "TEST_invalid_cat",
            "category_slug": "nonexistent",
            "description": "bad cat",
            "download_url": "https://example.com",
        }
        r = session.post(f"{API}/tools", json=payload, timeout=15)
        assert r.status_code == 400

    def test_create_tool(self, session):
        payload = {
            "name": "TEST_NewTool",
            "category_slug": "dev",
            "description": "TEST description",
            "alternative_uses": ["TEST use 1", "TEST use 2"],
            "download_url": "https://example.com/dl",
            "homepage_url": "https://example.com",
            "icon": "Wrench",
            "popularity": 42,
            "is_open_source": True,
            "platforms": ["Linux"],
        }
        r = session.post(f"{API}/tools", json=payload, timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert data["name"] == "TEST_NewTool"
        assert data["category_slug"] == "dev"
        assert data["popularity"] == 42
        assert data["click_count"] == 0
        TestToolCRUD.created_id = data["id"]

        # Verify persisted via GET
        g = session.get(f"{API}/tools/{data['id']}", timeout=15)
        assert g.status_code == 200
        assert g.json()["name"] == "TEST_NewTool"

    def test_click_increments(self, session):
        tid = TestToolCRUD.created_id
        assert tid
        r1 = session.post(f"{API}/tools/{tid}/click", timeout=15)
        assert r1.status_code == 200
        assert r1.json()["click_count"] == 1
        r2 = session.post(f"{API}/tools/{tid}/click", timeout=15)
        assert r2.json()["click_count"] == 2

    def test_update_tool(self, session):
        tid = TestToolCRUD.created_id
        r = session.put(f"{API}/tools/{tid}", json={"popularity": 88, "name": "TEST_Updated"}, timeout=15)
        assert r.status_code == 200
        assert r.json()["popularity"] == 88
        assert r.json()["name"] == "TEST_Updated"

        g = session.get(f"{API}/tools/{tid}", timeout=15)
        assert g.json()["popularity"] == 88

    def test_update_empty_body_400(self, session):
        tid = TestToolCRUD.created_id
        r = session.put(f"{API}/tools/{tid}", json={}, timeout=15)
        assert r.status_code == 400

    def test_delete_tool(self, session):
        tid = TestToolCRUD.created_id
        r = session.delete(f"{API}/tools/{tid}", timeout=15)
        assert r.status_code == 200
        assert r.json()["deleted"] is True

        g = session.get(f"{API}/tools/{tid}", timeout=15)
        assert g.status_code == 404

    def test_click_nonexistent(self, session):
        r = session.post(f"{API}/tools/no-such/click", timeout=15)
        assert r.status_code == 404
