from flask_sqlalchemy import SQLAlchemy
import sqlalchemy
from sqlalchemy import Column, Integer, String, ForeignKey, Table, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship, DeclarativeBase
from sqlalchemy.orm.exc import MultipleResultsFound
from typing import List, Iterator, Callable 
import datetime
from flask_bcrypt import Bcrypt

# These get linked with the app in app.py
db = SQLAlchemy()
bcrypt = Bcrypt()

unlocked_outfit = Table("unlocked_outfit", db.Model.metadata,
                      Column("player_id", ForeignKey("player.id"), primary_key=True),
                      Column("outfit_id", ForeignKey("outfit.id"), primary_key=True),
                      )

unlocked_level = Table("unlocked_level", db.Model.metadata,
                      Column("player_id", ForeignKey("player.id"), primary_key=True),
                      Column("level_id", ForeignKey("level.id"), primary_key=True),
                      )

player_run = Table("player_run", db.Model.metadata,
                      Column("run_id", ForeignKey("run.id"), primary_key=True),
                      Column("player_id", ForeignKey("player.id"), primary_key=True),
                      )

class UserAccount(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(unique=True, nullable=False)
    password: Mapped[str] = mapped_column(nullable=False)
    player: Mapped['Player'] = relationship(backref="user_account")

    def __init__(self, username:str, password:str):
        super().__init__()
        self.username = username
        self.create_password(password)

    def create_password(self, raw_password:str):
        self.password = bcrypt.generate_password_hash(raw_password).decode('utf-8')

    def check_password(self, raw_password:str):
        return bcrypt.check_password_hash(pw_hash=self.password, password=raw_password)

    @staticmethod
    def get_account(username:str, password:str):
        matching_username = UserAccount.query.filter_by(username=username)

        matching_password = []
        curr:UserAccount = None
        for curr in matching_username:
            if curr.check_password(password):
                matching_password.append(curr)

        if len(matching_password) > 1:
            raise MultipleResultsFound()
        elif len(matching_password) == 0:
            return None
        else:
            return matching_password[0]
        
    def __str__(self) -> str:
        return f"UserAccount: id={self.id}, username={self.username}"
        

class Player(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    coins: Mapped[int] = mapped_column(nullable=False, default=0)

    account_id: Mapped[int] = mapped_column(ForeignKey("user_account.id"), unique=True)
    outfits: Mapped[list['Outfit']] = relationship(secondary=unlocked_outfit)
    levels: Mapped[list['Level']] = relationship(secondary=unlocked_level)
    runs: Mapped[list['Run']] = relationship(secondary=player_run)

    def __str__(self) -> str:
        return f"Player: id={self.id}, coins={self.coins}"

class Outfit(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(nullable=False)
    cost: Mapped[int] = mapped_column(nullable=False, default=0)
    texture: Mapped[str] = mapped_column(nullable=False)

    def __str__(self) -> str:
        return f"Outfit: id={self.id}, name={self.name}, cost={self.cost}, texture={self.texture}"

class Level(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(nullable=False)
    difficulty: Mapped[int] = mapped_column(nullable=False, default=0)

    def __str__(self) -> str:
        return f"Level: id={self.id}, name={self.difficulty}, difficulty={self.difficulty}"

class Run(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    create_time: Mapped[datetime.datetime] = mapped_column(nullable=False, default=datetime.datetime.now)
    points: Mapped[int] = mapped_column(nullable=False, default=0)
    coins: Mapped[int] = mapped_column(nullable=False, default=0)

    level_id: Mapped[int] = mapped_column(ForeignKey("level.id"))

    def __str__(self) -> str:
        return f"Run: id={self.id}, create_time={self.create_time}, points={self.points}, coins={self.coins}"


def setup():
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

    run1 = Run(points=12, coins=20, level_id=lev1.id)
    run2 = Run(points=120, coins=120, level_id=lev1.id)
    run3 = Run(points=192, coins=920, level_id=lev3.id)

    db.session.add_all([run1, run2, run3])

    player.runs.append(run1)
    player2.runs.append(run2)
    player2.runs.append(run3)

    print(player.runs)

    db.session.commit()

    print(player.outfits)
    
    best:Run = None
    r:Run = None

    for r in Run.query.all():
        if r is not None and (best is None or r.points > best.points):
            best = r

    print(best)


