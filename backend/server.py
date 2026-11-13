import asyncio
import hmac
import logging
import os
import re
import uuid
from contextlib import suppress
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import List, Literal
from urllib.parse import urlsplit

import bcrypt
import jwt
from dotenv import load_dotenv
from fastapi import (
    APIRouter,
    Depends,
    FastAPI,
    File,
    Form,
    Header,
    HTTPException,
    Query,
    Request,
    UploadFile,
    status,
)
from fastapi.responses import FileResponse, JSONResponse
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
    SecretStr,
    ValidationError,
    field_validator,
)
from pymongo import ASCENDING, DESCENDING, IndexModel
from pymongo.errors import (
    ConfigurationError,
    InvalidURI,
    OperationFailure,
    PyMongoError,
    ServerSelectionTimeoutError,
)
from pymongo.uri_parser import parse_uri
from starlette.middleware.cors import CORSMiddleware


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")


def mongo_connection_error_message(exc: Exception) -> str:
    error_text = str(exc).lower()
    if "authentication failed" in error_text or (
        isinstance(exc, OperationFailure) and exc.code in {18, 8000}
    ):
        return (
            "MongoDB authentication failed. Verify the Atlas database username "
            "and password, and URL-encode special characters in the URI."
        )
    if any(term in error_text for term in ("dns", "srv", "nxdomain", "resolve")):
        return (
            "MongoDB Atlas DNS/SRV lookup failed. Verify the cluster hostname in "
            "MONGO_URL and check DNS/network access."
        )
    if isinstance(exc, ServerSelectionTimeoutError):
        return (
            "MongoDB connection timed out. Check cluster availability, the Atlas "
            "IP access list, outbound firewall rules, and "
            "MONGO_SERVER_SELECTION_TIMEOUT_MS."
        )
    if isinstance(exc, (InvalidURI, ConfigurationError)):
        return (
            "MONGO_URL is invalid. Use a mongodb:// or mongodb+srv:// URI with "
            "a valid host."
        )
    return (
        "MongoDB connection failed. Check MONGO_URL, credentials, DNS, the Atlas "
        "IP access list, and network connectivity."
    )


def validate_mongo_url(value: str) -> str:
    mongo_url = value.strip()
    if not mongo_url:
        raise RuntimeError("MONGO_URL is required in backend/.env.")

    duplicate_prefix = re.match(
        r"^(?:mongodb(?:\+srv)?://){2,}",
        mongo_url,
        flags=re.IGNORECASE,
    )
    if duplicate_prefix:
        schemes = re.findall(
            r"mongodb(?:\+srv)?://",
            duplicate_prefix.group(),
            flags=re.IGNORECASE,
        )
        mongo_url = schemes[-1] + mongo_url[duplicate_prefix.end():]
        logging.getLogger(__name__).warning(
            "Repeated MongoDB URI prefixes in MONGO_URL were normalized."
        )

    try:
        parsed_url = urlsplit(mongo_url)
        hostname = parsed_url.hostname
    except ValueError:
        raise RuntimeError(
            "MONGO_URL is malformed. Verify its scheme, host, and port."
        ) from None

    if parsed_url.scheme not in {"mongodb", "mongodb+srv"}:
        raise RuntimeError(
            "MONGO_URL must start with mongodb:// or mongodb+srv://."
        )
    if not hostname:
        raise RuntimeError(
            "MONGO_URL has no MongoDB hostname. For Atlas, include the cluster "
            "hostname after mongodb+srv://."
        )

    try:
        parse_uri(mongo_url, validate=True)
    except Exception as exc:
        raise RuntimeError(mongo_connection_error_message(exc)) from None
    return mongo_url


mongo_url = validate_mongo_url(os.getenv("MONGO_URL", ""))
db_name = os.getenv("DB_NAME", "").strip()
if not db_name:
    raise RuntimeError("DB_NAME is required in backend/.env.")

try:
    mongo_server_selection_timeout = int(
        os.getenv("MONGO_SERVER_SELECTION_TIMEOUT_MS", "8000")
    )
except ValueError:
    raise RuntimeError(
        "MONGO_SERVER_SELECTION_TIMEOUT_MS must be a positive integer."
    ) from None
if mongo_server_selection_timeout < 1:
    raise RuntimeError(
        "MONGO_SERVER_SELECTION_TIMEOUT_MS must be a positive integer."
    )

try:
    client = AsyncIOMotorClient(
        mongo_url,
        serverSelectionTimeoutMS=mongo_server_selection_timeout,
    )
except Exception as exc:
    raise RuntimeError(mongo_connection_error_message(exc)) from None
db = client[db_name]

ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "")
ADMIN_DISPLAY_NAME = os.getenv("ADMIN_DISPLAY_NAME", "Administrator")
JWT_SECRET = os.getenv("JWT_SECRET", "")
resume_directory = Path(
    os.getenv("CAREER_RESUME_DIR", "private_uploads/career_resumes")
)
if not resume_directory.is_absolute():
    resume_directory = ROOT_DIR / resume_directory
RESUME_DIRECTORY = resume_directory.resolve()
MAX_RESUME_SIZE = 5 * 1024 * 1024
ALLOWED_RESUME_SIGNATURES = {
    ".pdf": (b"%PDF-",),
    ".doc": (b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1",),
    ".docx": (b"PK\x03\x04",),
}
# One entry per collection: every field a route filters, sorts or dedupes on. Add the index in the same edit as the query.
INDEXES: dict[str, list[IndexModel]] = {
    "status_checks": [
        IndexModel([("id", ASCENDING)], name="id", unique=True),
        IndexModel([("timestamp", DESCENDING)], name="timestamp_desc"),
    ],
    "job_requirements": [
        IndexModel([("id", ASCENDING)], name="job_id", unique=True),
        IndexModel(
            [("is_active", ASCENDING), ("created_at", DESCENDING)],
            name="active_jobs_created_desc",
        ),
    ],
    "career_applications": [
        IndexModel([("id", ASCENDING)], name="application_id", unique=True),
        IndexModel([("status", ASCENDING), ("created_at", DESCENDING)], name="application_status_created_desc"),
    ],
    "contact_messages": [
        IndexModel([("status", ASCENDING), ("created_at", DESCENDING)], name="contact_status_created_desc"),
    ],
    "admin_sessions": [
        IndexModel([("expires_at", ASCENDING)], name="admin_session_expiry", expireAfterSeconds=0),
    ],
}


async def ensure_indexes() -> None:
    for collection, models in INDEXES.items():
        for model in models:  # one at a time so a bad spec skips only itself
            try:
                await db[collection].create_indexes([model])
            except Exception as exc:  # never block boot on an index; the log line names what to fix
                logging.getLogger(__name__).error(
                    "MongoDB index creation failed for %s.%s: %s",
                    collection,
                    model.document["name"],
                    mongo_connection_error_message(exc),
                )

# Create the main app without a prefix
app = FastAPI()


@app.exception_handler(PyMongoError)
async def handle_mongo_error(_: Request, exc: PyMongoError):
    message = mongo_connection_error_message(exc)
    logging.getLogger(__name__).error("MongoDB request failed: %s", message)
    return JSONResponse(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        content={"detail": message},
    )


# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class StatusCheckCreate(BaseModel):
    client_name: str


# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)

    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc["timestamp"] = doc["timestamp"].isoformat()

    _ = await db.status_checks.insert_one(doc)
    return status_obj


@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks(limit: int = Query(20, ge=1, le=100)):
    # Exclude MongoDB's _id field from the query results
    status_checks = (
        await db.status_checks.find({}, {"_id": 0})
        .sort("timestamp", -1)
        .limit(limit)
        .to_list(limit)
    )

    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check["timestamp"], str):
            check["timestamp"] = datetime.fromisoformat(check["timestamp"])

    return status_checks


class ContactMessageCreate(BaseModel):
    name: str = Field(min_length=1, max_length=160)
    email: EmailStr
    phone: str = Field(default="", max_length=40)
    company: str = Field(default="", max_length=160)
    subject: str = Field(default="", max_length=200)
    message: str = Field(default="", max_length=10000)


@api_router.post("/contact")
async def create_contact_message(input: ContactMessageCreate):
    doc = input.model_dump()
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    doc["status"] = "New"
    result = await db.contact_messages.insert_one(doc)
    return {"ok": True, "id": str(result.inserted_id)}


class AdminLoginInput(BaseModel):
    username: str = Field(min_length=1, max_length=160)
    password: SecretStr


def verify_admin_password(candidate: str, configured_password: str) -> bool:
    if configured_password.startswith("$2"):
        if not re.fullmatch(
            r"\$2[aby]\$(?:0[4-9]|[12][0-9]|3[01])\$[./A-Za-z0-9]{53}",
            configured_password,
        ):
            return False
        try:
            return bcrypt.checkpw(
                candidate.encode("utf-8"),
                configured_password.encode("ascii"),
            )
        except ValueError:
            return False
    return hmac.compare_digest(
        candidate.encode("utf-8"),
        configured_password.encode("utf-8"),
    )


class JobRequirementInput(BaseModel):
    title: str = Field(min_length=2, max_length=160)
    department: str = Field(min_length=2, max_length=120)
    location: str = Field(min_length=2, max_length=160)
    employment_type: Literal["Full-time", "Internship", "Part-time"]
    experience: str = Field(min_length=1, max_length=120)
    description: str = Field(min_length=10, max_length=10000)
    skills: list[str] = Field(min_length=1, max_length=40)
    vacancies: int = Field(ge=1, le=1000)
    is_active: bool = False


class ApplicationStatusInput(BaseModel):
    status: Literal[
        "Pending",
        "Reviewing",
        "Shortlisted",
        "Rejected",
        "Selected",
    ]


class ContactStatusInput(BaseModel):
    status: Literal["New", "Read", "Replied"]


class CareerApplicationInput(BaseModel):
    full_name: str = Field(min_length=2, max_length=160)
    email: EmailStr
    phone: str = Field(min_length=7, max_length=40)
    experience: str = Field(min_length=1, max_length=120)
    skills: str = Field(min_length=1, max_length=2000)
    additional_message: str = Field(default="", max_length=5000)

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: str) -> str:
        digit_count = len(re.sub(r"\D", "", value))
        if not 7 <= digit_count <= 15:
            raise ValueError("Phone number must contain between 7 and 15 digits.")
        return value


def require_admin_configuration() -> None:
    if not ADMIN_USERNAME or not ADMIN_PASSWORD or len(JWT_SECRET) < 32:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Admin authentication is not configured on the server.",
        )


async def require_admin(authorization: str = Header(default="")) -> dict:
    require_admin_configuration()
    scheme, separator, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not separator or not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin authentication required.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        claims = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=["HS256"],
            options={"require": ["exp", "iat", "jti", "sub"]},
        )
    except jwt.InvalidTokenError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired admin session.",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

    session = await db.admin_sessions.find_one({"_id": claims["jti"]})
    if not session or claims["sub"] != ADMIN_USERNAME:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin session is no longer active.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return claims


def mongo_object_id(value: str):
    from bson import ObjectId
    from bson.errors import InvalidId

    try:
        return ObjectId(value)
    except (InvalidId, TypeError) as exc:
        raise HTTPException(status_code=404, detail="Contact query not found.") from exc


def serialize_contact(document: dict) -> dict:
    document["id"] = str(document.pop("_id"))
    document.setdefault("subject", "")
    document.setdefault("status", "New")
    return document


def serialize_job(document: dict) -> dict:
    document.pop("_id", None)
    return document


def serialize_application(document: dict) -> dict:
    document.pop("_id", None)
    document.pop("resume_path", None)
    document["has_resume"] = bool(document.pop("resume_filename", None))
    return document


@api_router.post("/admin/login")
async def admin_login(input: AdminLoginInput):
    require_admin_configuration()
    username_matches = hmac.compare_digest(
        input.username.encode("utf-8"),
        ADMIN_USERNAME.encode("utf-8"),
    )
    password_matches = verify_admin_password(
        input.password.get_secret_value(),
        ADMIN_PASSWORD,
    )
    if not username_matches or not password_matches:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password.",
        )

    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(hours=8)
    session_id = str(uuid.uuid4())
    token = jwt.encode(
        {
            "sub": ADMIN_USERNAME,
            "iat": int(now.timestamp()),
            "exp": int(expires_at.timestamp()),
            "jti": session_id,
        },
        JWT_SECRET,
        algorithm="HS256",
    )
    await db.admin_sessions.insert_one(
        {
            "_id": session_id,
            "username": ADMIN_USERNAME,
            "expires_at": expires_at,
        }
    )
    return {"access_token": token, "token_type": "bearer"}


@api_router.get("/admin/profile")
async def admin_profile(admin: dict = Depends(require_admin)):
    return {
        "name": ADMIN_DISPLAY_NAME,
        "username": admin["sub"],
        "role": "Administrator",
    }


@api_router.post("/admin/logout")
async def admin_logout(admin: dict = Depends(require_admin)):
    await db.admin_sessions.delete_one({"_id": admin["jti"]})
    return {"ok": True}


@api_router.get("/admin/dashboard")
async def admin_dashboard(admin: dict = Depends(require_admin)):
    collections = set(await db.list_collection_names())
    user_count = (
        await db.users.count_documents({})
        if "users" in collections
        else None
    )
    total_contacts = await db.contact_messages.count_documents({})
    new_contacts = await db.contact_messages.count_documents(
        {"$or": [{"status": "New"}, {"status": {"$exists": False}}]}
    )
    total_jobs = await db.job_requirements.count_documents({})
    active_jobs = await db.job_requirements.count_documents({"is_active": True})
    total_applications = await db.career_applications.count_documents({})
    pending_applications = await db.career_applications.count_documents(
        {"status": "Pending"}
    )
    return {
        "registered_users": user_count,
        "total_contact_queries": total_contacts,
        "new_contact_queries": new_contacts,
        "total_job_requirements": total_jobs,
        "active_job_openings": active_jobs,
        "total_career_applications": total_applications,
        "pending_applications": pending_applications,
    }


@api_router.get("/careers/jobs")
async def list_public_jobs():
    try:
        jobs = (
            await db.job_requirements.find({"is_active": True}, {"_id": 0})
            .sort("created_at", -1)
            .to_list(500)
        )
    except PyMongoError as exc:
        logging.getLogger(__name__).error(
            "Career jobs query failed: %s",
            type(exc).__name__,
        )
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Career openings are temporarily unavailable. Check the backend MongoDB connection and retry.",
        ) from exc
    return [serialize_job(job) for job in jobs]


@api_router.get("/admin/jobs")
async def list_admin_jobs(admin: dict = Depends(require_admin)):
    jobs = (
        await db.job_requirements.find({}, {"_id": 0})
        .sort("created_at", -1)
        .to_list(500)
    )
    return [serialize_job(job) for job in jobs]


@api_router.post("/admin/jobs", status_code=status.HTTP_201_CREATED)
async def create_job(
    input: JobRequirementInput,
    admin: dict = Depends(require_admin),
):
    document = input.model_dump()
    document["id"] = str(uuid.uuid4())
    document["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.job_requirements.insert_one(document)
    return serialize_job(document)


@api_router.put("/admin/jobs/{job_id}")
async def update_job(
    job_id: str,
    input: JobRequirementInput,
    admin: dict = Depends(require_admin),
):
    existing = await db.job_requirements.find_one({"id": job_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Job requirement not found.")
    document = input.model_dump()
    document["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.job_requirements.update_one({"id": job_id}, {"$set": document})
    return serialize_job({**existing, **document, "id": job_id})


@api_router.delete("/admin/jobs/{job_id}")
async def delete_job(job_id: str, admin: dict = Depends(require_admin)):
    result = await db.job_requirements.delete_one({"id": job_id})
    if not result.deleted_count:
        raise HTTPException(status_code=404, detail="Job requirement not found.")
    return {"ok": True}


@api_router.post("/careers/applications", status_code=status.HTTP_201_CREATED)
async def create_career_application(
    job_id: str = Form(min_length=1),
    full_name: str = Form(min_length=2, max_length=160),
    email: str = Form(min_length=3, max_length=320),
    phone: str = Form(min_length=7, max_length=40),
    experience: str = Form(min_length=1, max_length=120),
    skills: str = Form(min_length=1, max_length=2000),
    additional_message: str = Form(default="", max_length=5000),
    resume: UploadFile = File(...),
):
    try:
        fields = CareerApplicationInput.model_validate(
            {
                "full_name": full_name.strip(),
                "email": email.strip(),
                "phone": phone.strip(),
                "experience": experience.strip(),
                "skills": skills.strip(),
                "additional_message": additional_message.strip(),
            }
        )
    except ValidationError as exc:
        raise HTTPException(status_code=422, detail="Invalid application details.") from exc

    try:
        job = await db.job_requirements.find_one(
            {"id": job_id, "is_active": True},
            {"_id": 0, "title": 1},
        )
    except PyMongoError as exc:
        logging.getLogger(__name__).error(
            "Career application job lookup failed: %s",
            type(exc).__name__,
        )
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Applications are temporarily unavailable. Check the backend MongoDB connection and retry.",
        ) from exc
    if not job:
        raise HTTPException(status_code=400, detail="This job is no longer accepting applications.")

    suffix = Path(resume.filename or "").suffix.lower()
    if suffix not in ALLOWED_RESUME_SIGNATURES:
        raise HTTPException(status_code=400, detail="Resume must be a PDF, DOC, or DOCX file.")
    contents = await resume.read(MAX_RESUME_SIZE + 1)
    if not contents:
        raise HTTPException(status_code=400, detail="Resume file is empty.")
    if len(contents) > MAX_RESUME_SIZE:
        raise HTTPException(status_code=413, detail="Resume file must be 5 MB or smaller.")
    if not any(contents.startswith(signature) for signature in ALLOWED_RESUME_SIGNATURES[suffix]):
        raise HTTPException(status_code=400, detail="Resume file content does not match its file type.")

    RESUME_DIRECTORY.mkdir(parents=True, exist_ok=True)
    resume_filename = f"{uuid.uuid4()}{suffix}"
    resume_path = (RESUME_DIRECTORY / resume_filename).resolve()
    if resume_path.parent != RESUME_DIRECTORY:
        raise HTTPException(status_code=400, detail="Invalid resume file name.")
    resume_path.write_bytes(contents)

    document = fields.model_dump()
    document.update(
        {
            "id": str(uuid.uuid4()),
            "job_id": job_id,
            "position": job["title"],
            "resume_filename": resume.filename,
            "resume_path": str(resume_path),
            "status": "Pending",
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
    )
    try:
        await db.career_applications.insert_one(document)
    except PyMongoError as exc:
        resume_path.unlink(missing_ok=True)
        logging.getLogger(__name__).error(
            "Career application save failed: %s",
            type(exc).__name__,
        )
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Applications are temporarily unavailable. Check the backend MongoDB connection and retry.",
        ) from exc
    except Exception:
        resume_path.unlink(missing_ok=True)
        raise
    return {"ok": True, "id": document["id"]}


@api_router.get("/admin/applications")
async def list_applications(
    limit: int = Query(500, ge=1, le=1000),
    admin: dict = Depends(require_admin),
):
    applications = (
        await db.career_applications.find({}, {"_id": 0})
        .sort("created_at", -1)
        .limit(limit)
        .to_list(limit)
    )
    return [serialize_application(application) for application in applications]


@api_router.get("/admin/applications/{application_id}")
async def get_application(
    application_id: str,
    admin: dict = Depends(require_admin),
):
    application = await db.career_applications.find_one(
        {"id": application_id},
        {"_id": 0},
    )
    if not application:
        raise HTTPException(status_code=404, detail="Career application not found.")
    return serialize_application(application)


@api_router.patch("/admin/applications/{application_id}/status")
async def update_application_status(
    application_id: str,
    input: ApplicationStatusInput,
    admin: dict = Depends(require_admin),
):
    result = await db.career_applications.update_one(
        {"id": application_id},
        {"$set": {"status": input.status}},
    )
    if not result.matched_count:
        raise HTTPException(status_code=404, detail="Career application not found.")
    return {"ok": True, "status": input.status}


@api_router.get("/admin/applications/{application_id}/resume")
async def download_application_resume(
    application_id: str,
    admin: dict = Depends(require_admin),
):
    application = await db.career_applications.find_one(
        {"id": application_id},
        {"_id": 0, "resume_path": 1, "resume_filename": 1},
    )
    if not application:
        raise HTTPException(status_code=404, detail="Career application not found.")
    resume_path = Path(application.get("resume_path", "")).resolve()
    if resume_path.parent != RESUME_DIRECTORY or not resume_path.is_file():
        raise HTTPException(status_code=404, detail="Resume file not found.")
    suffix = resume_path.suffix.lower()
    content_types = {
        ".pdf": "application/pdf",
        ".doc": "application/msword",
        ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    }
    return FileResponse(
        resume_path,
        media_type=content_types.get(suffix, "application/octet-stream"),
        filename=Path(application.get("resume_filename") or "resume").name,
        headers={"X-Content-Type-Options": "nosniff"},
    )


@api_router.get("/admin/contact-queries")
async def list_contact_queries(
    limit: int = Query(500, ge=1, le=1000),
    admin: dict = Depends(require_admin),
):
    queries = (
        await db.contact_messages.find({})
        .sort("created_at", -1)
        .limit(limit)
        .to_list(limit)
    )
    return [serialize_contact(query) for query in queries]


@api_router.patch("/admin/contact-queries/{query_id}/status")
async def update_contact_status(
    query_id: str,
    input: ContactStatusInput,
    admin: dict = Depends(require_admin),
):
    result = await db.contact_messages.update_one(
        {"_id": mongo_object_id(query_id)},
        {"$set": {"status": input.status}},
    )
    if not result.matched_count:
        raise HTTPException(status_code=404, detail="Contact query not found.")
    return {"ok": True, "status": input.status}


@api_router.delete("/admin/contact-queries/{query_id}")
async def delete_contact_query(
    query_id: str,
    admin: dict = Depends(require_admin),
):
    result = await db.contact_messages.delete_one({"_id": mongo_object_id(query_id)})
    if not result.deleted_count:
        raise HTTPException(status_code=404, detail="Contact query not found.")
    return {"ok": True}


# Include the router in the main app
app.include_router(api_router)

cors_origins = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000,http://localhost:3001,"
        "http://127.0.0.1:3000,http://127.0.0.1:3001",
    ).split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_credentials=False,
    allow_origins=cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def start_index_build():
    try:
        await db.command("ping")
    except Exception as exc:
        message = mongo_connection_error_message(exc)
        logger.error("MongoDB startup check failed: %s", message)
        raise RuntimeError(message) from None
    app.state.index_task = asyncio.create_task(ensure_indexes())  # background: a big index build must not block boot

@app.on_event("shutdown")
async def shutdown_db_client():
    index_task = getattr(app.state, "index_task", None)
    if index_task:
        index_task.cancel()  # stop a build still running before its client closes
        with suppress(asyncio.CancelledError):
            await index_task
    client.close()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000)