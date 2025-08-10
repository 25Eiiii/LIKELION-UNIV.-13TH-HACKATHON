# Eiiii/top3/helpers.py
from sqlalchemy import create_engine
import os
from dotenv import load_dotenv
from pathlib import Path
from datetime import date, datetime as dt
import re

env_path = Path(__file__).resolve().parent.parent / "Eiiii" / ".env"
load_dotenv(dotenv_path=env_path)

def get_db_engine():
    return create_engine(
        f"postgresql+psycopg2://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}"
        f"@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
    )

def to_date(x):
    if isinstance(x, date):
        return x
    if isinstance(x, str):
        for fmt in ("%Y-%m-%d", "%Y.%m.%d", "%Y/%m/%d"):
            try:
                return dt.strptime(x, fmt).date()
            except:
                pass
    return None

def parse_date_string(s: str):
    """ 'YYYY.MM.DD ~ YYYY.MM.DD', 'YYYY-MM-DD~YYYY-MM-DD', 단일 날짜도 지원 """
    if not s:
        return None, None
    s = s.strip()

    # 범위
    m = re.match(r'(\d{4}[\.\-\/]\d{1,2}[\.\-\/]\d{1,2})\s*[\~\-]\s*(\d{4}[\.\-\/]\d{1,2}[\.\-\/]\d{1,2})', s)
    if m:
        a, b = m.groups()
        return to_date(a), to_date(b)

    # 단일
    m = re.match(r'(\d{4}[\.\-\/]\d{1,2}[\.\-\/]\d{1,2})$', s)
    if m:
        d = to_date(m.group(1))
        return d, d
    return None, None

def overlaps_month(start: date|None, end: date|None, y: int, m: int) -> bool:
    if start is None and end is None:
        return False
    start = start or end
    end = end or start
    month_first = date(y, m, 1)
    next_month_first = date(y + (m // 12), (m % 12) + 1, 1)
    return not (end < month_first or start >= next_month_first)
