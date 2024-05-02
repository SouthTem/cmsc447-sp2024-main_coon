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

equipped_outfit = Table("equipped_outfit", db.Model.metadata,
                      Column("player_id", ForeignKey("player.id"), primary_key=True),
                      Column("outfit_id", ForeignKey("outfit.id"), primary_key=True),
                      )

unlocked_level = Table("unlocked_level", db.Model.metadata,
                      Column("player_id", ForeignKey("player.id"), primary_key=True),
                      Column("level_id", ForeignKey("level.id"), primary_key=True),
                      )

player_last_level = Table("player_last_level", db.Model.metadata,
                      Column("player_id", ForeignKey("player.id"), primary_key=True),
                      Column("level_id", ForeignKey("level.id")),
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
    def get_account(username:str, password:str) -> 'UserAccount':
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
    equipped_outfits: Mapped[list['Outfit']] = relationship(secondary=equipped_outfit)

    levels: Mapped[list['Level']] = relationship(secondary=unlocked_level)
    last_level: Mapped['Level'] = relationship(secondary=player_last_level)

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
    name: Mapped[str] = mapped_column(nullable=False, unique=True)
    texture: Mapped[str] = mapped_column(nullable=False, unique=True)
    difficulty: Mapped[int] = mapped_column(nullable=False, default=0)

    def __str__(self) -> str:
        return f"Level: id={self.id}, name={self.name}, texture={self.texture} difficulty={self.difficulty}"

class Run(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    create_time: Mapped[datetime.datetime] = mapped_column(nullable=False, default=datetime.datetime.now)
    points: Mapped[int] = mapped_column(nullable=False, default=0)
    coins: Mapped[int] = mapped_column(nullable=False, default=0)

    level_id: Mapped[int] = mapped_column(ForeignKey("level.id"))

    def __str__(self) -> str:
        return f"Run: id={self.id}, create_time={self.create_time}, points={self.points}, coins={self.coins}"


def setup():
    db.drop_all()
    db.create_all()

    account = UserAccount(username="user", password="user")

    player:Player = Player(user_account=account)
    
    db.session.add_all([account, player])

    db.session.commit()

    print(player.outfits)