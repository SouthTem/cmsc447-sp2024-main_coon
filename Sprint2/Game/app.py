from flask import Flask, g, render_template, url_for, request, redirect, jsonify
from flask_sqlalchemy import SQLAlchemy
from database import setup, db, bcrypt
import database
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity

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

@app.route('/create', methods=['GET', 'POST'])
def create():
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

            token = create_access_token(identity=account.id)

            return 'Account Created'
        
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
        username = request.json.get('username')
        password = request.json.get('password')

        print(username, password)

        account = database.UserAccount.get_account(username=username, password=password)

        print(account)
        if account is not None:
            token = create_access_token(identity=account.id)
            print("token:", token)
            
            return jsonify({'access_token': token})
    except Exception as e:
        print(e)
        return jsonify({'success': False, 'message': str(e)}), 400

# TODO: sort the data by score, only display the best scores, all filtering/sorting
@app.route('/leaderboard', methods=['GET'])
def leaderboard():
    data = []
    player:database.Player = None
    for player in database.Player.query.all():
        entry = []
        player_account:database.UserAccount = database.UserAccount.query.get(ident=player.account_id)
        entry.append(player_account.username)
        
        run:database.Run = None
        for run in player.runs:
            print(run)
            entry.append(run.points)
            entry.append(run.coins)

            if run is not None:
                data.append(entry)

    return render_template('scoreboard.html', data=data)
    
@app.route('/run', methods=['POST'])
@jwt_required()
def add_run():
    try:
        data:dict = request.json
        points = data.get('points', 0)
        coins = data.get('coins', 0)
        level_id = data.get('level_id', 1)

        current_account_id = get_jwt_identity()
        player:database.Player = database.Player.query.filter_by(id=current_account_id).one_or_none()

        print(player)

        if player is not None:
            valid_level = database.Level.query.filter_by(id=level_id).count() == 1
            if not valid_level:
                raise ValueError('level id was invalid')
            
            new_run:database.Run = database.Run(points=points, coins=coins, level_id=level_id)
            player.runs.append(new_run)
            print(player.runs)
            database.db.session.commit()
            return jsonify({'success': True}), 200
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
    #setup()
    #ac = database.UserAccount.get_account("test2", "pass")
    #print(ac)

    return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=True)