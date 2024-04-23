from flask import Flask, g, render_template, url_for, request, redirect, jsonify
from flask_sqlalchemy import SQLAlchemy
from database import setup, db, bcrypt
import database
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
from sqlalchemy_utils import database_exists


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

            print('create', username, password)
            
            if database.UserAccount.query.filter_by(username=username).count() > 0:
                return jsonify({'success':False, 'message':'username was already taken'})

            account:database.UserAccount = database.UserAccount(username=username, password=password)
            
            player:database.Player = database.Player(user_account=account)

            print(account)
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

            print(username, password)
            
            if database.UserAccount.query.filter_by(username=username).count() > 0:
                return "username is already taken"

            account:database.UserAccount = database.UserAccount(username=username, password=password)
            
            player:database.Player = database.Player(user_account=account)

            print(account)
            database.db.session.add_all([account, player])

            database.db.session.commit()

            #token = create_access_token(identity=account.id)

            return redirect(url_for('login_page'))
        
        if request.method == "GET":
            return render_template('create.html')
        
    except Exception as e:
        print(e)
        return "Something went wrong"

@app.route('/login_page', methods=['POST', 'GET'])
def login_page():
    try:
        if request.method == "POST":

            username = request.form.get('username')
            password = request.form.get('password')

            print(username, password)

            account = database.UserAccount.get_account(username=username, password=password)

            print(account)
            if account is not None:
                token = create_access_token(identity=account.id)

                print("token:", token)
                # TODO: redirect to the game
                return "Login Successful"
            else:
                # no account is found, either the input is bad, or a new account needs to be created
                return render_template('login.html')
        
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

        print(username, password)

        account = database.UserAccount.get_account(username=username, password=password)

        print(account)
        if account is not None:
            token = create_access_token(identity=account.id)
            print("token:", token)
            
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
            print(run)
            data.append([player_account.username, level.name, run.points, run.coins, run.create_time.strftime("%m/%d/%Y %I:%M %p")])

    return render_template('scoreboard.html', data=data)
    
@app.route('/run', methods=['POST'])
@jwt_required()
def add_run():
    try:
        data:dict = request.json
        points = data.get('points', 0)
        coins = data.get('coins', 0)
        level_name = data.get('level_name', None)

        current_account_id = get_jwt_identity()
        print('current id:', current_account_id)
        player:database.Player = database.Player.query.filter_by(id=current_account_id).one_or_none()

        print(player)

        if player is None:
            raise ValueError('player not found')

        found_level:database.Level = database.Level.query.filter_by(name=level_name).one_or_none()
        if found_level is None:
            raise ValueError(f'level name ({level_name}) was invalid')
        
        new_run:database.Run = database.Run(points=points, coins=coins, level_id=found_level.id)
        player.runs.append(new_run)
        print(player.runs)
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
        print('current id:', current_account_id)
        account:database.UserAccount = database.UserAccount.query.get(current_account_id)

        if account is None:
            raise ValueError('account not found')

        player:database.Player = database.Player.query.filter_by(id=current_account_id).one_or_none()

        print(player)

        if player is None:
            raise ValueError('player not found')

        return jsonify({'success': True, 'name': account.username}), 200

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

@app.route('/')
def index():
    # ac = database.UserAccount.get_account("test2", "pass")
    # print(ac)
    if database_exists(f"sqlite:///instance/database.db"):
        print("database exists")
        return render_template("index.html")
    database.setup()
    print("yes")
    return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=True)