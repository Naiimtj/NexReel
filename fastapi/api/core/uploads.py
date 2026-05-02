from __future__ import annotations

from fastapi import UploadFile

from api.config.env import settings

try:
    import cloudinary
    import cloudinary.uploader
except ImportError:  # pragma: no cover
    cloudinary = None


if cloudinary is not None:
    cloudinary.config(
        cloud_name="dznwlaen6",
        api_key=getattr(settings, "CLOUDINARY_KEY", ""),
        api_secret=getattr(settings, "CLOUDINARY_SECRET", ""),
    )


async def upload_image(file: UploadFile | None) -> str | None:
    if file is None or cloudinary is None:
        return None
    if not settings.CLOUDINARY_KEY or not settings.CLOUDINARY_SECRET:
        return None

    content = await file.read()
    if not content:
        return None

    result = cloudinary.uploader.upload(content, folder="nexreel", resource_type="image")
    return result.get("secure_url") or result.get("url")
