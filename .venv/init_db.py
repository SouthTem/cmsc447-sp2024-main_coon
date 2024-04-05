import sqlite3

connection = sqlite3.connect('database.db') #Change database name to change database

with open('schema.sql') as f: #change Schema name to add sql file
    connection.executescript(f.read())

curs = connection.cursor()

curs.execute("INSERT INTO scoreTab (username, score) VALUES (?, ?)",
('Steve Smith', 80))

connection.commit()
connection.close()
