"""
db/supabase.py — Supabase client singleton.
"""

import os
from supabase import create_client, Client

from dotenv import load_dotenv
load_dotenv() 

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_KEY = os.environ["SUPABASE_SERVICE_KEY"]  # use service key (bypasses RLS)

_client: Client | None = None


def get_supabase() -> Client:
    global _client
    if _client is None:
        _client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    return _client