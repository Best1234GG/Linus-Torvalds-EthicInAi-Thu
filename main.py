import sys
from pathlib import Path

import uvicorn

# app.py imports `models.predictss`, so src/backend must be importable as a root.
sys.path.insert(0, str(Path(__file__).resolve().parent / "src" / "backend"))

from app import app  # noqa: E402


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
