from fastapi import FastAPI, APIRouter, HTTPException, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone

from seed_data import SEED_CATEGORIES, SEED_TOOLS, CURATED_REPOS


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="Geekverse API")
api_router = APIRouter(prefix="/api")


# ---------- Models ----------
class Category(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    slug: str
    name: str
    color: str
    description: str


class Tool(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    category_slug: str
    description: str
    alternative_uses: List[str] = Field(default_factory=list)
    download_url: str
    homepage_url: Optional[str] = None
    icon: Optional[str] = None  # lucide icon name
    popularity: int = 0  # manual relevance 0-100
    click_count: int = 0
    is_open_source: bool = False
    platforms: List[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ToolCreate(BaseModel):
    name: str
    category_slug: str
    description: str
    alternative_uses: List[str] = []
    download_url: str
    homepage_url: Optional[str] = None
    icon: Optional[str] = None
    popularity: int = 50
    is_open_source: bool = False
    platforms: List[str] = []


class ToolUpdate(BaseModel):
    name: Optional[str] = None
    category_slug: Optional[str] = None
    description: Optional[str] = None
    alternative_uses: Optional[List[str]] = None
    download_url: Optional[str] = None
    homepage_url: Optional[str] = None
    icon: Optional[str] = None
    popularity: Optional[int] = None
    is_open_source: Optional[bool] = None
    platforms: Optional[List[str]] = None


class GithubRepo(BaseModel):
    name: str
    full_name: str
    description: str
    url: str
    stars: str
    language: str
    tags: List[str] = []


# ---------- Helpers ----------
def _clean(doc):
    if not doc:
        return doc
    doc.pop("_id", None)
    return doc


# ---------- Seeding ----------
async def seed_db():
    # Upsert categories (by slug) — preserves existing, adds new
    for c in SEED_CATEGORIES:
        await db.categories.update_one(
            {"slug": c["slug"]},
            {"$set": {
                "name": c["name"],
                "color": c["color"],
                "description": c["description"],
            }, "$setOnInsert": {"id": c["id"], "slug": c["slug"]}},
            upsert=True,
        )

    # Upsert tools (by name) — preserves click_count, adds new
    existing_names = {t["name"] for t in await db.tools.find({}, {"name": 1, "_id": 0}).to_list(5000)}
    new_docs = []
    for t in SEED_TOOLS:
        if t["name"] in existing_names:
            continue
        new_docs.append({
            "id": str(uuid.uuid4()),
            "name": t["name"],
            "category_slug": t["category_slug"],
            "description": t["description"],
            "alternative_uses": t.get("alternative_uses", []),
            "download_url": t["download_url"],
            "homepage_url": t.get("homepage_url"),
            "icon": t.get("icon", "Wrench"),
            "popularity": t.get("popularity", 50),
            "click_count": 0,
            "is_open_source": t.get("is_open_source", False),
            "platforms": t.get("platforms", []),
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
    if new_docs:
        await db.tools.insert_many(new_docs)
        logging.info(f"Seeded {len(new_docs)} new tools (total in seed: {len(SEED_TOOLS)})")


# ---------- Routes ----------
@api_router.get("/")
async def root():
    return {"message": "Geekverse API online", "version": "1.0.0"}


@api_router.get("/categories", response_model=List[Category])
async def list_categories():
    cats = await db.categories.find({}, {"_id": 0}).to_list(100)
    return cats


@api_router.get("/tools")
async def list_tools(
    search: Optional[str] = None,
    category: Optional[str] = None,
    sort: str = Query("relevance", pattern="^(relevance|popularity|name|newest)$"),
):
    query = {}
    if category and category != "all":
        query["category_slug"] = category
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"alternative_uses": {"$regex": search, "$options": "i"}},
        ]

    sort_map = {
        "relevance": [("popularity", -1), ("click_count", -1)],
        "popularity": [("click_count", -1), ("popularity", -1)],
        "name": [("name", 1)],
        "newest": [("created_at", -1)],
    }
    cursor = db.tools.find(query, {"_id": 0}).sort(sort_map[sort])
    tools = await cursor.to_list(1000)
    return tools


@api_router.get("/tools/{tool_id}")
async def get_tool(tool_id: str):
    tool = await db.tools.find_one({"id": tool_id}, {"_id": 0})
    if not tool:
        raise HTTPException(404, "Tool not found")
    return tool


@api_router.post("/tools", response_model=Tool)
async def create_tool(payload: ToolCreate):
    cat = await db.categories.find_one({"slug": payload.category_slug})
    if not cat:
        raise HTTPException(400, f"Unknown category: {payload.category_slug}")
    tool = Tool(**payload.model_dump())
    doc = tool.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.tools.insert_one(doc)
    return tool


@api_router.put("/tools/{tool_id}")
async def update_tool(tool_id: str, payload: ToolUpdate):
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(400, "No fields to update")
    result = await db.tools.update_one({"id": tool_id}, {"$set": updates})
    if result.matched_count == 0:
        raise HTTPException(404, "Tool not found")
    tool = await db.tools.find_one({"id": tool_id}, {"_id": 0})
    return tool


@api_router.delete("/tools/{tool_id}")
async def delete_tool(tool_id: str):
    result = await db.tools.delete_one({"id": tool_id})
    if result.deleted_count == 0:
        raise HTTPException(404, "Tool not found")
    return {"deleted": True}


@api_router.post("/tools/{tool_id}/click")
async def track_click(tool_id: str):
    result = await db.tools.update_one(
        {"id": tool_id}, {"$inc": {"click_count": 1}}
    )
    if result.matched_count == 0:
        raise HTTPException(404, "Tool not found")
    tool = await db.tools.find_one({"id": tool_id}, {"_id": 0})
    return {"click_count": tool["click_count"]}


@api_router.get("/stats")
async def stats():
    total_tools = await db.tools.count_documents({})
    total_categories = await db.categories.count_documents({})
    total_clicks_agg = await db.tools.aggregate([
        {"$group": {"_id": None, "total": {"$sum": "$click_count"}}}
    ]).to_list(1)
    total_clicks = total_clicks_agg[0]["total"] if total_clicks_agg else 0
    return {
        "tools": total_tools,
        "categories": total_categories,
        "total_clicks": total_clicks,
    }


@api_router.get("/github/repos", response_model=List[GithubRepo])
async def github_repos():
    return CURATED_REPOS


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger(__name__)


@app.on_event("startup")
async def on_startup():
    await seed_db()


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
