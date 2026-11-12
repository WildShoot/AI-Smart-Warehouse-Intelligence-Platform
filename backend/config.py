import os
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ENV_PATH = os.path.join(BASE_DIR, ".env")

load_dotenv(dotenv_path=ENV_PATH)

MONGO_URI = (os.getenv("MONGO_URI") or "").strip()
DATABASE_NAME = (os.getenv("DATABASE_NAME") or "smart_warehouse").strip()
JWT_SECRET_KEY = (os.getenv("JWT_SECRET_KEY") or "smart_warehouse_super_secret_key_2026").strip()
