from flask import g
import sqlite3
import sqlalchemy

database = "database.db"

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(database)
    return db

def setup():
    db = get_db()
    sqlalchemy.Column()
