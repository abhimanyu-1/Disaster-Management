import os
from dotenv import load_dotenv

load_dotenv()

# The Gemini model to use across all AI agents
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.6-flash")
