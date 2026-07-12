import os
import sys
from pathlib import Path


def _get_app_dir() -> Path:
    """Application resource directory (read-only, contains shipped files)."""
    if getattr(sys, 'frozen', False):
        # PyInstaller bundle — sys._MEIPASS is the temp extraction dir
        return Path(sys._MEIPASS)
    # Source tree — app/config.py → app/ → backend/
    return Path(__file__).resolve().parent.parent


def _get_data_dir() -> Path:
    """Writable data directory for database and runtime files."""
    if os.name == 'nt':
        base = Path(os.environ.get('APPDATA', '.')) / 'Nook'
    else:
        base = Path.home() / '.local' / 'share' / 'nook'
    base.mkdir(parents=True, exist_ok=True)
    return base


class Settings:
    def __init__(self):
        self.ollama_default_model: str = os.environ.get(
            "NOOK_MODEL", "qwen2.5:1.5b"
        )
        self.ollama_host: str = os.environ.get(
            "NOOK_OLLAMA_HOST", "http://localhost:11434"
        )
        self.listen_host: str = os.environ.get(
            "NOOK_HOST", "0.0.0.0"
        )
        self.listen_port: int = int(os.environ.get(
            "NOOK_PORT", "11451"
        ))
        self.sensitive_words_file: str = str(
            _get_app_dir() / "app" / "data" / "sensitive.txt"
        )
        self.data_dir: str = str(_get_data_dir())


setting = Settings()
