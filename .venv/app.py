import sqlite3
from flask import Flask, render_template, request, url_for, flash, redirect, abort

app = Flask(__name__)
# Randomly Generated not so secret secret key
app.config['SECRET_KEY'] = '&0$%b#7ylw_fk3pq#kc-2*mq9dak6up0nv46tut4fqk55_f%-a'

# Connect to database
def get_db_connection():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    return conn

# Get the data at the index in database
def get_data(data_id):
    conn = get_db_connection()
    data = conn.execute('SELECT * FROM scoreTab WHERE id_1 = ?',
                        (data_id,)).fetchone()
    conn.close()
    if data is None:
        abort(404)
    return data

# Home page
@app.route('/')
def index():
    return render_template('index.html')

# Scoreboard Page
@app.route('/score/')
def score():
    conn = get_db_connection()
    scoreTab = conn.execute('SELECT * FROM scoreTab').fetchall()
    conn.close()
    return render_template('score.html', scoreTab=scoreTab)

# Create User and Update database
@app.route('/create/', methods=('GET', 'POST'))
def create():

    # Post information back to database
    if request.method == 'POST':
        username = request.form['username']
        score = request.form['score']

        # Makes sure all categories are filled
        if not username:
            flash('Userame required!')
        elif not score:
            flash('Score required')
        else:

            # Connect to db and update
            conn = get_db_connection()
            conn.execute('INSERT INTO scoreTab (username, score) VALUES (?, ?)',
                         (username, score))
            conn.commit()
            conn.close()

            # Send back to Home page
            return redirect(url_for('score'))

    # Get create page       
    return render_template('create.html')

# Update information based on which user is clicked in the db
@app.route('/<int:id_1>/update/', methods=('GET', 'POST'))
def update(id_1):

    # Get the user in the db
    data = get_data(id_1)

    # Post information if all edits are made
    if request.method == 'POST':
        username = request.form['username']
        score = request.form['score']

        if not username:
            flash('Username required')
        elif not score:
            flash('Score required')

        else:

            # Connect to db and update
            conn = get_db_connection()
            conn.execute('UPDATE scoreTab SET username = ?, score = ?'
                         ' WHERE id_1 = ?',
                         (username, score, id_1))
            conn.commit()
            conn.close()

            # Send back to Home page
            return redirect(url_for('score'))
    
    # Get edit page
    return render_template('update.html', scoreTab=data)

# Delete from Database
@app.route('/<int:id_1>/delete/', methods=['POST',])
def delete(id_1):

    # Get user from the db and delete based on what is clicked
    data = get_data(id_1)
    conn = get_db_connection()
    conn.execute('DELETE FROM scoreTab WHERE id_1 = ?', (id_1,))
    conn.commit()
    conn.close()
    #flash('"{}" was successfully deleted!'.format(data['username']))

    # Reload Home page
    return redirect(url_for('score'))

if __name__ == "__main__":
    app.run(debug=True)