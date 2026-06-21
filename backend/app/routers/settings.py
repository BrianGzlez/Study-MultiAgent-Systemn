import json
import os
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/api/settings", tags=["settings"])

SETTINGS_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "user_settings.json")

DEFAULT_SETTINGS = {
    "name": "Student",
    "language": "English",
    "subjects": ["Statistics", "Embedded Systems", "Economics", "Mathematics"],
    "strictness": "normal",
    "dark_mode": False,
}


class SettingsUpdate(BaseModel):
    name: str | None = None
    language: str | None = None
    subjects: list[str] | None = None
    strictness: str | None = None
    dark_mode: bool | None = None


def load_settings() -> dict:
    if os.path.exists(SETTINGS_FILE):
        with open(SETTINGS_FILE, "r") as f:
            return json.load(f)
    return DEFAULT_SETTINGS.copy()


def save_settings(settings: dict):
    with open(SETTINGS_FILE, "w") as f:
        json.dump(settings, f, indent=2)


@router.get("")
def get_settings():
    return load_settings()


@router.put("")
def update_settings(body: SettingsUpdate):
    settings = load_settings()
    if body.name is not None:
        settings["name"] = body.name
    if body.language is not None:
        settings["language"] = body.language
    if body.subjects is not None:
        settings["subjects"] = body.subjects
    if body.strictness is not None:
        settings["strictness"] = body.strictness
    if body.dark_mode is not None:
        settings["dark_mode"] = body.dark_mode
    save_settings(settings)
    return settings
