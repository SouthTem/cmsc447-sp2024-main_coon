from flask import Flask, g, render_template, url_for, request, redirect
from flask_sqlalchemy import SQLAlchemy
import sqlalchemy
from sqlalchemy import Column, Integer, String, ForeignKey, Table, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship, DeclarativeBase
from typing import List
import datetime

default_error_message = "Something has gone wrong. Is the URL incorrect?"

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"
db = SQLAlchemy(app)

unlocked_outfit = Table("unlocked_outfit", db.Model.metadata,
                      Column("player_id", ForeignKey("player.id"), primary_key=True),
                      Column("outfit_id", ForeignKey("outfit.id"), primary_key=True),
                      )

unlocked_level = Table("unlocked_level", db.Model.metadata,
                      Column("player_id", ForeignKey("player.id"), primary_key=True),
                      Column("level_id", ForeignKey("level.id"), primary_key=True),
                      )

class UserAccount(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(unique=True, nullable=False)
    password: Mapped[str] = mapped_column(nullable=False)
    player: Mapped['Player'] = relationship(backref="user_account")

class Player(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    coins: Mapped[int] = mapped_column(nullable=False, default=0)

    account_id: Mapped[int] = mapped_column(ForeignKey("user_account.id"), unique=True)
    outfits: Mapped[list['Outfit']] = relationship(secondary=unlocked_outfit)
    levels: Mapped[list['Level']] = relationship(secondary=unlocked_level)
    runs: Mapped[list['Run']] = relationship(backref="player")

class Outfit(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(nullable=False)
    cost: Mapped[int] = mapped_column(nullable=False, default=0)
    texture: Mapped[str] = mapped_column(nullable=False)

class Level(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(nullable=False)
    difficulty: Mapped[int] = mapped_column(nullable=False, default=0)

class Run(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    create_time: Mapped[datetime.datetime] = mapped_column(nullable=False, default=datetime.datetime.now)
    points: Mapped[int] = mapped_column(nullable=False, default=0)
    coins: Mapped[int] = mapped_column(nullable=False, default=0)

    level_id: Mapped[int] = mapped_column(ForeignKey("level.id"))
    player_id : Mapped[int] = mapped_column(ForeignKey("player.id"))



@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

@app.route('/')
def index():
    db.create_all()

    out1 = Outfit(name="cool outfit", cost=120, texture='test.png')
    out2 = Outfit(name="cooler outfit", cost=140, texture='test2.png')
    out3 = Outfit(name="coolest outfit", cost=200, texture='test3.png')

    lev1 = Level(name="cool level", difficulty=0)
    lev2 = Level(name="cooler level", difficulty=1)
    lev3 = Level(name="coolest level", difficulty=2)

    db.session.add_all([lev1, lev2, lev3])

    db.session.add_all([out1, out2, out3])

    account = UserAccount(username="test", password="pass")

    player:Player = Player(user_account=account)
    player.outfits.append(out1)
    player.outfits.append(out2)

    player.levels.append(lev1)
    player.levels.append(lev2)

    print(player.outfits)

    account2 = UserAccount(username="test2", password="pass")

    player2:Player = Player(user_account=account2)
    player2.levels.append(lev1)
    
    db.session.add_all([account, player, account2, player2])

    

    a1:UserAccount = UserAccount.query.filter_by(username="test").first()
    print(a1)

    print(a1.player)

    run1 = Run(points=12, coins=20, level_id=lev1.id, player_id=player.id)
    run2 = Run(points=120, coins=120, level_id=lev1.id, player_id=player2.id)
    run3 = Run(points=192, coins=920, level_id=lev3.id, player_id=player.id)

    db.session.add_all([run1, run2, run3])

    db.session.commit()
    return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=True)