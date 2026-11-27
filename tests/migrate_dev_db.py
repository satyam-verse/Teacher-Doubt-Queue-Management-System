import sqlite3
import os

paths = ['doubtx_dev.db', 'instance/doubtx_dev.db']
for db_path in paths:
    if os.path.exists(db_path):
        print(f"Migrating {db_path}...")
        con = sqlite3.connect(db_path)
        cur = con.cursor()

        def add_col_if_missing(table, col, col_def):
            cur.execute(f"PRAGMA table_info({table})")
            cols = [r[1] for r in cur.fetchall()]
            if col not in cols:
                print(f"  Adding {col} to {table}")
                cur.execute(f"ALTER TABLE {table} ADD COLUMN {col} {col_def}")
                con.commit()
            else:
                print(f"  {col} already in {table}")

        add_col_if_missing('users', 'subscription_tier', "VARCHAR(20) DEFAULT 'free'")
        add_col_if_missing('users', 'daily_ai_query_count', "INTEGER DEFAULT 0")
        add_col_if_missing('users', 'last_query_reset_at', "DATETIME")
        add_col_if_missing('users', 'subscription_status', "VARCHAR(20) DEFAULT 'active'")
        add_col_if_missing('conversations', 'is_pinned', "BOOLEAN DEFAULT 0")

        con.close()
        print(f"Migration complete for {db_path}!")
