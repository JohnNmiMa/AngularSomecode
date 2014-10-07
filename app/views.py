from flask import render_template, session, request, g, jsonify
from flask.ext.login import login_user, logout_user, current_user, login_required
from app import app
import pdb

@app.before_request
def before_request():
    g.user = current_user
    #if g.user.is_authenticated():
        #g.user.last_seen = datetime.utcnow()

@app.route('/')
@app.route('/index')
def index():
    #public_count = Snippet.query.filter_by(access=ACCESS_PUBLIC).count()
    return render_template('index.html')

@app.route('/logout')
#@login_required
def logout():
    #pdb.set_trace()
    #reply = {'user' : g.user}
    reply = {'user' : 'somebody'}
    pop_login_session()
    logout_user()
    return jsonify(reply)

def pop_login_session():
    session.pop('logged_in', None)
    session.pop('oauth_token', None)
