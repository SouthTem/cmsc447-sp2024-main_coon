from flask import Flask, g, render_template, url_for, request, redirect, jsonify
from flask_sqlalchemy import SQLAlchemy
from database import setup, db, bcrypt
import database
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
from sqlalchemy_utils import database_exists
import requests
import json


default_error_message = "Something has gone wrong. Is the URL incorrect?"

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"

# this is supposed to be a secret, but since we are just locally hosting it should be fine
app.config['JWT_SECRET_KEY'] = 'main_coon'

jwt = JWTManager(app)

db.init_app(app)
bcrypt.init_app(app)

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

@app.route('/create', methods=['POST'])
def create():
    try:
        if request.method == "POST":

            username = None
            password = None
            if request.is_json:
                username = request.json.get('username')
                password = request.json.get('password')
            else:
                username = request.form.get('username')
                password = request.form.get('password')
            
            if database.UserAccount.query.filter_by(username=username).count() > 0:
                return jsonify({'success':False, 'message':'username was already taken'})

            account:database.UserAccount = database.UserAccount(username=username, password=password)
            
            player:database.Player = database.Player(user_account=account)

            database.db.session.add_all([account, player])

            database.db.session.commit()

            #token = create_access_token(identity=account.id)

            return jsonify({'success':True, 'message':'User was created'})
        
    except Exception as e:
        print(e)
        return jsonify({'success':False, 'message':'User failed to create'})
    
    
@app.route('/create_page', methods=['GET'])
def create_page():
    try:
        if request.method == "POST":

            username = request.form.get('username')
            password = request.form.get('password')
            
            if database.UserAccount.query.filter_by(username=username).count() > 0:
                return "username is already taken"

            account:database.UserAccount = database.UserAccount(username=username, password=password)
            
            player:database.Player = database.Player(user_account=account)

            database.db.session.add_all([account, player])

            database.db.session.commit()

            #token = create_access_token(identity=account.id)

            return redirect(url_for('login_page'))
        
        if request.method == "GET":
            return render_template('create.html')
        
    except Exception as e:
        print(e)
        return "Something went wrong"

@app.route('/login_page', methods=['GET'])
def login_page():
    try:        
        if request.method == "GET":
            return render_template('login.html')
    except Exception as e:
        print(e)
        return "Something went wrong"

@app.route('/login', methods=['POST'])
def login():

    try:
        username = None
        password = None
        if request.is_json:
            username = request.json.get('username')
            password = request.json.get('password')
        else:
            username = request.form.get('username')
            password = request.form.get('password')

        account = database.UserAccount.get_account(username=username, password=password)

        if account is not None:
            token = create_access_token(identity=account.id, expires_delta=False)
            
            return jsonify({'success':True, 'access_token': token})
    except Exception as e:
        print(e)
        return jsonify({'success': False, 'message': str(e)}), 400
    
    return jsonify({'success': False, 'message': 'bad'})

# TODO: sort the data by score, only display the best scores, all filtering/sorting
@app.route('/leaderboard', methods=['GET'])
def leaderboard():
    data = []
    player:database.Player = None
    for player in database.Player.query.all():
        player_account:database.UserAccount = database.UserAccount.query.get(ident=player.account_id)
        
        run:database.Run = None
        level:database.Level = None
        for run in player.runs:
            level = database.Level.query.get(run.level_id)
            data.append([player_account.username, level.name, run.points, run.coins, run.create_time.strftime("%m/%d/%Y %I:%M %p")])

    data.sort(key=lambda x: (x[0], x[1])) # sort by name and level

    return render_template('scoreboard.html', data=data)

@app.route('/top5', methods=['GET'])
def top5():
    try:
        players_points = []
        player:database.Player = None
        for player in database.Player.query.all():
            player_account:database.UserAccount = database.UserAccount.query.get(ident=player.account_id)
            total_points = 0
            level:database.Level = None
            for level in database.Level.query.all():
                runs_per_level = list(filter(lambda x: x.level_id == level.id, player.runs))
                if runs_per_level is not None and len(runs_per_level) > 0:
                    total_points += max(runs_per_level, key=lambda x: x.points).points

            players_points.append([player_account.username, total_points, player.coins])

        players_points.sort(key=lambda x: x[1], reverse=True)

        return render_template('top5.html', data=players_points)
    except Exception as e:
        print(e)
        return render_template('top5.html', data=[])

@app.route('/top_leaderboard', methods=['GET'])
def top_leaderboard():
    try:
        players_points = []
        player:database.Player = None
        for player in database.Player.query.all():
            player_account:database.UserAccount = database.UserAccount.query.get(ident=player.account_id)
            total_points = 0
            level:database.Level = None
            for level in database.Level.query.all():
                runs_per_level = list(filter(lambda x: x.level_id == level.id, player.runs))
                if runs_per_level is not None and len(runs_per_level) > 0:
                    total_points += max(runs_per_level, key=lambda x: x.points).points

            players_points.append([player_account.username, total_points])

        players_points.sort(key=lambda x: x[1], reverse=True)

        data = {
            "Group": "main coon",
            "Title": "Top 5 Scores",
        }

        for i in range(0, 5):
            if i >= len(players_points):
                break

            data[f"{players_points[i][0]}"] = f"{players_points[i][1]}"

        json_data = json.dumps({"data": [data]})

        uri = 'https://eope3o6d7z7e2cc.m.pipedream.net'

        res = requests.post(uri, data=json_data)

        return jsonify({'success':True, 'data':json_data})
    except Exception as e:
        print(e)
        return jsonify({'success':False})
    
@app.route('/run', methods=['POST'])
@jwt_required()
def add_run():
    try:
        data:dict = request.json
        points = data.get('points', 0)
        coins = data.get('coins', 0)
        level_name = data.get('level_name', None)
        new_level = data.get('new_level', False)

        current_account_id = get_jwt_identity()
        player:database.Player = database.Player.query.filter_by(id=current_account_id).one_or_none()

        if player is None:
            raise ValueError('player not found')

        found_level:database.Level = database.Level.query.filter_by(name=level_name).one_or_none()
        if found_level is None:
            raise ValueError(f'level name ({level_name}) was invalid')
        
        new_run:database.Run = database.Run(points=points, coins=coins, level_id=found_level.id)
        player.runs.append(new_run)

        if new_level:
            player.last_level = found_level
            
        database.db.session.commit()
        return jsonify({'success': True}), 200

    except Exception as e:
        print(e)
        return jsonify({'success': False, 'message': str(e)}), 400
    
@app.route('/account', methods=['GET'])
@jwt_required()
def get_user():
    try:

        current_account_id = get_jwt_identity()
        account:database.UserAccount = database.UserAccount.query.get(current_account_id)

        if account is None:
            raise ValueError('account not found')

        player:database.Player = database.Player.query.filter_by(id=current_account_id).one_or_none()

        if player is None:
            raise ValueError('player not found')
        
        unlocked_outfits = []
        if player.outfits is not None and len(player.outfits) > 0:
            unlocked_outfits = list(map(lambda x: x.name, player.outfits))

        equipped_outfits = []
        if equipped_outfits is not None and len(player.equipped_outfits) > 0:
            equipped_outfits = list(map(lambda x: x.name, player.equipped_outfits))

        lastLevel = ''
        if player.last_level is not None:
            lastLevel = player.last_level.name

        return jsonify({'success': True, 
                        'name': account.username, 
                        'coins':player.coins,
                        'lastLevel':lastLevel,
                        'equippedOutfits': equipped_outfits,
                        'unlockedOutfits': unlocked_outfits}), 200

    except Exception as e:
        print(e)
        return jsonify({'success': False, 'message': str(e)}), 400
    
@app.route('/update_coins', methods=['POST'])
@jwt_required()
def update_coins():
    try:
        data:dict = request.json
        coins = data.get('coins', 0)

        current_account_id = get_jwt_identity()

        player:database.Player = database.Player.query.filter_by(id=current_account_id).one_or_none()

        if player is not None:
            new_coins = player.coins + coins
            if new_coins < 0:
                raise ValueError('coin count cannot be negative')
            
            player.coins += coins
            database.db.session.commit()
            return jsonify({'success': True})
    except Exception as e:
        print(e)
        return jsonify({'success': False, 'message':str(e)}), 400
    
@app.route('/outfit', methods=['POST'])
@jwt_required()
def update_outfit():
    try:
        data:dict = request.json

        current_account_id = get_jwt_identity()

        player:database.Player = database.Player.query.filter_by(id=current_account_id).one_or_none()

        for entry in data:
            found:database.Outfit = next(filter(lambda x: x.name == entry['name'], player.equipped_outfits), None)

            if not entry['equipped'] and found is not None:
                player.equipped_outfits.remove(found)

            if entry['equipped'] and found is None:
                player.equipped_outfits.append(database.Outfit.query.filter_by(name=entry['name']).first())

            found:database.Outfit = next(filter(lambda x: x.name == entry['name'], player.outfits), None)

            if not entry['obtained'] and found is not None:
                player.outfits.remove(found)

            if entry['obtained'] and found is None:
                player.outfits.append(database.Outfit.query.filter_by(name=entry['name']).first())
            
        database.db.session.commit()
        return jsonify({'success': True})
    except Exception as e:
        print(e)
        return jsonify({'success': False, 'message':str(e)}), 400

    
# this is a debug endpoint we should remove this in production
# this is just for initializing the database from Phaser
@app.route('/populate', methods=['POST'])
def populate_database():
    try:
        database.db.create_all()
        if request.method == "POST":

            levels = request.json.get('levels', None)
            outfits = request.json.get('outfits', None)

            if levels is not None and len(levels) > 0:
                level_table = database.db.metadata.tables.get('level', None)
                if level_table is not None:
                    database.db.metadata.drop_all(database.db.engine, tables=[level_table])
                    database.db.create_all()

                for level_data in levels:
                    name = level_data['name']
                    texture = level_data['key']
                    difficulty = level_data['difficulty']
                    lev:database.Level = database.Level(name=name, texture=texture, difficulty=difficulty)
                    database.db.session.add(lev)
            
            if outfits is not None:
                outfit_table = database.db.metadata.tables.get('outfit', None)
                database.db.metadata.drop_all(database.db.engine, tables=[outfit_table])
                database.db.create_all()

                for outfit_data in outfits:
                    name = outfit_data['name']
                    texture = outfit_data['sprite']
                    cost = outfit_data['cost']
                    obtained = outfit_data['obtained']
                    equipped = outfit_data['equipped']
                    outfit:database.Outfit = database.Outfit(name=name, texture=texture, cost=cost)

                    database.db.session.add(outfit)

                    

            database.db.session.commit()

            return jsonify({'success':True, 'message':'Populated Database'})
        
    except Exception as e:
        print(e)
        return jsonify({'success':False, 'message':'Database Failed to populate'})


@app.route('/')
def index():
    if database_exists(f"sqlite:///instance/database.db"):
        return render_template("index.html")
    database.setup()
    return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=True)