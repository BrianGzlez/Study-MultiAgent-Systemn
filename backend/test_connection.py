from sqlalchemy import create_engine, text
from urllib.parse import quote_plus

password = quote_plus("Laura2141212121!")
url = f"postgresql://postgres.qrtrlgjcpjqzfphovakd:{password}@aws-0-eu-west-1.pooler.supabase.com:6543/postgres"

with open("test_result.txt", "w") as f:
    f.write("Connecting...\n")
    f.flush()
    try:
        engine = create_engine(url, connect_args={"connect_timeout": 10})
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version()"))
            row = result.fetchone()
            f.write(f"CONNECTED: {row[0][:60]}\n")
    except Exception as e:
        f.write(f"ERROR: {e}\n")
