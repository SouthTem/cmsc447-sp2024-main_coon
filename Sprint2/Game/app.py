from flask import Flask, g, render_template, url_for, request, redirect
from flask_sqlalchemy import SQLAlchemy
import sqlalchemy
from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

default_error_message = "Something has gone wrong. Is the URL incorrect?"

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"
db = SQLAlchemy(app)

class UserAccount(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(unique=True, nullable=False)
    password: Mapped[str] = mapped_column(nullable=False)
    player: Mapped['Player'] = relationship(backref="user_account")

class Player(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    coins: Mapped[int] = mapped_column(nullable=False, default=0)

    account_id: Mapped[int] = mapped_column(ForeignKey("user_account.id"), unique=True)

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

@app.route('/')
def index():
    db.create_all()
    account = UserAccount(username="test", password="pass")

    player = Player(user_account=account)

    account2 = UserAccount(username="test2", password="pass")

    player2 = Player(user_account=account2)
    db.session.add_all([account, player, account2, player2])

    a1:UserAccount = UserAccount.query.filter_by(username="test").first()
    print(a1)

    print(a1.player)

    db.session.commit()
    return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=True)