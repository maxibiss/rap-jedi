import sqlite3
import json
import os

db_path = 'dev.db'
if not os.path.exists(db_path):
    print(f"Error: {db_path} not found")
    exit(1)

def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

try:
    conn = sqlite3.connect(db_path)
    conn.row_factory = dict_factory
    cursor = conn.cursor()

    # Get tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    table_names = [t['name'] for t in tables]
    print(f"Tables found: {table_names}")

    # Dump Quote table
    if 'Quote' in table_names:
        cursor.execute("SELECT * FROM Quote")
        quotes = cursor.fetchall()
        with open('quotes_dump.json', 'w', encoding='utf-8') as f:
            json.dump(quotes, f, indent=2)
        print(f"Dumped {len(quotes)} quotes to quotes_dump.json")
    
    # Dump Virtue table if exists (user mentioned virtues)
    if 'Virtue' in table_names:
        cursor.execute("SELECT * FROM Virtue")
        virtues = cursor.fetchall()
        with open('virtues_dump.json', 'w', encoding='utf-8') as f:
            json.dump(virtues, f, indent=2)
        print(f"Dumped {len(virtues)} virtues to virtues_dump.json")

    conn.close()
except Exception as e:
    print(f"Error: {e}")
