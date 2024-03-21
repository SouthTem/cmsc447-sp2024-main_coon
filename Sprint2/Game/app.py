from flask import Flask, g, render_template, url_for, request, redirect
from flask_sqlalchemy import SQLAlchemy
from database import setup, db

default_error_message = "Something has gone wrong. Is the URL incorrect?"

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"
db.init_app(app)


@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

@app.route('/')
def index():
    setup()

    return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=True)