# backend/utils/s3_storage.py
"""Utility helpers for S3 presigned upload and download URLs.

Security considerations (per mandatory corrections):
- Bucket is assumed to have Block Public Access enabled.
- No ACL is set in the POST fields – the object will inherit the bucket's default ACL (private).
- Object keys are generated server‑side as UUIDs under the prefix "career_resumes/".
- An upload intent token is not implemented separately; the presigned POST URL itself
  is short‑lived (5 minutes) and includes a cryptographically‑generated signature.
- Validation of allowed extensions, MIME types, file signatures and size is performed
  both client‑side (in the React code) and server‑side (in the POST endpoint) before
  persisting the application record.
"""

import os
import uuid
from datetime import datetime, timedelta
from typing import Dict
import boto3

# Environment variables – must be defined in Vercel UI.
S3_BUCKET = os.getenv("S3_BUCKET")
S3_REGION = os.getenv("S3_REGION")
S3_ACCESS_KEY_ID = os.getenv("S3_ACCESS_KEY_ID")
S3_SECRET_ACCESS_KEY = os.getenv("S3_SECRET_ACCESS_KEY")

# Minimal IAM policy required for this bucket/prefix:
# {
#   "Version": "2012-10-17",
#   "Statement": [
#     {
#       "Effect": "Allow",
#       "Action": ["s3:PutObject", "s3:PutObjectAcl"],
#       "Resource": "arn:aws:s3:::${S3_BUCKET}/career_resumes/*"
#     },
#     {
#       "Effect": "Allow",
#       "Action": "s3:GetObject",
#       "Resource": "arn:aws:s3:::${S3_BUCKET}/career_resumes/*"
#     }
#   ]
# }

_s3_client = boto3.client(
    "s3",
    region_name=S3_REGION,
    aws_access_key_id=S3_ACCESS_KEY_ID,
    aws_secret_access_key=S3_SECRET_ACCESS_KEY,
)

_ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx"}

def _generate_object_key(filename: str) -> str:
    """Return a server‑side unique object key.
    The key is placed under the ``career_resumes/`` prefix.
    """
    suffix = os.path.splitext(filename)[1].lower()
    return f"career_resumes/{uuid.uuid4()}{suffix}"

def generate_presigned_post(filename: str, max_size: int = 5 * 1024 * 1024) -> Dict[str, str]:
    """Create a presigned POST URL for direct upload.

    The returned dict contains:
    - ``url``   – the S3 endpoint to POST to.
    - ``fields`` – the required form fields (policy, signature, key, etc.).
    - ``key``    – the object key that should be stored in the DB.
    """
    if not S3_BUCKET:
        raise RuntimeError("S3_BUCKET environment variable not set.")
    suffix = os.path.splitext(filename)[1].lower()
    if suffix not in _ALLOWED_EXTENSIONS:
        raise ValueError("Unsupported file extension.")
    object_key = _generate_object_key(filename)
    # Conditions: size limit, key prefix, and mandatory private ACL is omitted (bucket policy enforces privacy).
    conditions = [
        {"key": object_key},
        ["content-length-range", 1, max_size],
    ]
    fields = {"key": object_key}
    resp = _s3_client.generate_presigned_post(
        Bucket=S3_BUCKET,
        Key=object_key,
        Fields=fields,
        Conditions=conditions,
        ExpiresIn=300,  # 5 minutes
    )
    # ``resp`` already contains the URL and fields; we just add the key for our own tracking.
    resp["key"] = object_key
    return resp

def generate_presigned_get(key: str, expires_in: int = 300) -> str:
    """Return a presigned GET URL for downloading a resume.
    The caller must ensure ``key`` belongs to the allowed prefix.
    """
    if not key.startswith("career_resumes/"):
        raise ValueError("Invalid object key prefix.")
    return _s3_client.generate_presigned_url(
        ClientMethod="get_object",
        Params={"Bucket": S3_BUCKET, "Key": key},
        ExpiresIn=expires_in,
        HttpMethod="GET",
    )

def get_object_range(key: str, byte_range: str) -> bytes:
    """Retrieve a byte range from an S3 object.
    ``byte_range`` should be in the form ``bytes=0-15``.
    Returns the raw bytes of the requested range.
    """
    resp = _s3_client.get_object(Bucket=S3_BUCKET, Key=key, Range=byte_range)
    return resp['Body'].read()

