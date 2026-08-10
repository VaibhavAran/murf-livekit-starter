import sqlite3
from pathlib import Path

db = Path("data/users.db")
conn = sqlite3.connect(db)
conn.execute("DELETE FROM users")
conn.commit()
remaining = conn.execute("SELECT count(*) FROM users").fetchone()[0]
print(f"Cleared all records. Rows remaining: {remaining}")
conn.close()
