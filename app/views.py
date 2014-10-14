import json
import jwt
import pdb
import requests
from functools import wraps
from urlparse import parse_qs, parse_qsl
from urllib import urlencode
from flask import current_app
from flask import render_template, flash, redirect, url_for, session, request, g, jsonify
from flask.ext.login import login_user, logout_user, current_user
from models import User, Topic, Snippet, ROLE_USER, ROLE_ADMIN, ACCESS_PRIVATE, ACCESS_PUBLIC
from app import app, db, login_manager
from requests_oauthlib import OAuth1
from config import facebook, twitter
from datetime import datetime, timedelta
from sqlalchemy import desc


def create_jwt_token(user):
    payload = {
        'iss': 'localhost',
        'sub': user.id,
        'iat': datetime.now(),
        'exp': datetime.now() + timedelta(days=14)
    }
    token = jwt.encode(payload, app.config['TOKEN_SECRET'])
    return token.decode('unicode_escape')

def parse_token(req):
    token = req.headers.get('Authorization').split()[1]
    return jwt.decode(token, app.config['TOKEN_SECRET'])

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not request.headers.get('Authorization'):
            response = jsonify(message='Missing authorization header')
            response.status_code = 401
            return response

        payload = parse_token(request)

        if datetime.fromtimestamp(payload['exp']) < datetime.now():
            response = jsonify(message='Token has expired')
            response.status_code = 401
            return response

        g.user_id = payload['sub']

        return f(*args, **kwargs)

    return decorated_function

@login_manager.user_loader
def load_user(id):
    return User.query.get(int(id))


# Routes

@app.before_request
def before_request():
    g.user = current_user
    if g.user.is_authenticated():
        g.user.last_seen = datetime.utcnow()

thecallback = ""


@app.route('/')
@app.route('/index')
def index():
    #public_count = Snippet.query.filter_by(access=ACCESS_PUBLIC).count()
    return render_template('index.html')


@app.route('/user')
def user():
    topics = g.user.topics
    personal_count = 0
    for topic in topics:
        personal_count += topic.snippets.count()
    public_count = Snippet.query.filter_by(access=ACCESS_PUBLIC).count()

    token = create_jwt_token(g.user)
    reply = {'username':g.user.name, 'token':token, 'personal_count':personal_count, 'public_count':public_count}
    return jsonify(reply)

    #MVP stuff
    #return render_template('user.html', name = g.user.name, user_id = g.user.id,
    #                       topics = topics.all(), page = 'home',
    #                       personal_count = personal_count, public_count = public_count)


@app.route('/logout')
@login_required
def logout():
    pdb.set_trace()
    #reply = {'user' : g.user}
    reply = {'user' : 'somebody'}
    pop_login_session()
    logout_user()
    return jsonify(reply)


def pop_login_session():
    session.pop('logged_in', None)
    session.pop('oauth_token', None)


###
### Facebookk OAuth

def createUserInDb(fb_id, goog_id, twit_id, name, email, role):
    id = None
    user = None
    if fb_id is not None:
        id = fb_id
        user = User(fb_id = fb_id, name = name, email = email, role = role)
    elif goog_id is not None:
        id = goog_id
        user = User(google_id = goog_id, name = name, email = email, role = role)
    elif twit_id is not None:
        id = twit_id
        user = User(twitter_id = twit_id, name = name, role = role)

    if id is None:
        return;

    db.session.add(user)

    # All accounts have a 'General' topic
    topic = Topic(topic = 'General', author = user)
    db.session.add(topic)

    # All accounts have a 'Welcome' account
    topic = Topic(topic = 'Welcome', author = user)
    db.session.add(topic)
    db.session.commit()

    # Add snippets from SomeCode's 'Welcome' topic
    # to the user's 'Welcome' topic
    admin_user = User.query.filter_by(name='SomeCode').first()
    welcome_topic = admin_user.topics.filter_by(topic='Welcome').first()
    welcome_snippets = welcome_topic.snippets
    snippets = welcome_snippets.all()
    snippets.reverse()
    for snip in snippets:
        s = Snippet(title=snip.title, description=snip.description, code=snip.code,
                            timestamp=snip.timestamp, topic=topic, creator_id=snip.id, access=ACCESS_PRIVATE)
        db.session.add(s)

    db.session.commit()

    return user

@app.route('/signin/facebook_authorized', methods = ['POST'])
def facebook_authorized():
    params = {
        'client_id': request.json['clientId'],
        'redirect_uri': request.json['redirectUri'],
        'client_secret': facebook['consumer_secret'],
        'code': request.json['code']
    }

    # Step 1. Exchange authorization code for access token.
    r = requests.get(facebook['access_token_url'], params=params)
    access_token = dict(parse_qsl(r.text))

    # Step 2. Retrieve information about the current user.
    r = requests.get(facebook['graph_api_url'], params=access_token)
    profile = json.loads(r.text)

    # Step 3. Create a new account or return an existing one.
    session['logged_in'] = True
    # see if user is already in the db
    user = User.query.filter_by(email = profile['email']).first()
    if user is None:
        # Save new user and the 'General' topic in the db
        name = profile['username']
        if (name == ""):
            name = 'Unknown'
        user = createUserInDb(profile['id'], None, None, name, profile['email'], ROLE_USER)
        if user is None:
            return jsonify(error=500, text='Error creating user'), 500
    else:
        fb_id = user.fb_id
        if fb_id is None:
            user.fb_id = profile['id']
            db.session.commit()

        # Update name if it changed
        fb_name = user.name
        if (fb_name !=  profile['username']):
            user.name = profile['username']
            db.session.commit()

    # log the user in
    login_user(user)
    return redirect(url_for('user'))

###
### Twitter OAuth

@app.route('/signin/twitter_authorized')
def twitter_authorized():
    if request.args.get('oauth_token') and request.args.get('oauth_verifier'):
        auth = OAuth1(twitter['consumer_key'],
                      client_secret=twitter['consumer_secret'],
                      resource_owner_key=request.args.get('oauth_token'),
                      verifier=request.args.get('oauth_verifier'))
        r = requests.post(twitter['access_token_url'], auth=auth)
        profile = dict(parse_qsl(r.text))
        screen_name = profile['screen_name']
        twitter_id = profile['user_id']

        session['logged_in'] = True
        session['twitter_user'] = screen_name
        print("response user_id and screen_name = {} and {}").format(twitter_id, screen_name)

        # See if user is already in the db
        user = User.query.filter_by(twitter_id = twitter_id).first()
        if user is None:
            # Save new user in the db
            name = screen_name
            if (name == ""):
                name = 'Unknown'
            user = createUserInDb(None, None, twitter_id, name, '', ROLE_USER)
        else:
            # Update name if it changed
            twitter_name = user.name
            if (twitter_name != screen_name):
                user.name = screen_name
                db.session.commit()

        # Log the user in
        login_user(user)
        return redirect(url_for('user'))
    else:
        oauth = OAuth1(twitter['consumer_key'],
                       client_secret=twitter['consumer_secret'],
                       callback_uri=twitter['callback_uri'])
        r = requests.post(twitter['request_token_url'], auth=oauth)
        oauth_token = dict(parse_qsl(r.text))
        qs = urlencode(dict(oauth_token=oauth_token['oauth_token']))
        return redirect(twitter['authenticate_url'] + '?' + qs)


