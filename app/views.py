import json
import jwt
import pdb
import requests
from functools import wraps
from urlparse import parse_qs, parse_qsl
from urllib import urlencode
from flask import current_app
from flask import render_template, flash, redirect, url_for, session, request, Response, g, jsonify
from flask.ext.login import login_user, logout_user, current_user
from models import User, Topic, Snippet, ROLE_USER, ROLE_ADMIN, ACCESS_PRIVATE, ACCESS_PUBLIC
from app import app, db, login_manager
from requests_oauthlib import OAuth1
from config import facebook, twitter, google
from datetime import datetime, timedelta
from sqlalchemy import desc


def getSnippetCounts():
    topics = g.user.topics
    personal_count = 0
    for i, topic in enumerate(topics):
        personal_count += topic.snippets.count()
    public_count = Snippet.query.filter_by(access=ACCESS_PUBLIC).count()
    return {'personal_count':personal_count, 'public_count':public_count}

def create_jwt_token(user):
    payload = {
        'iss': 'somecode',
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
        #pdb.set_trace()
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


@app.route('/')
@app.route('/index')
def index():
    public_count = Snippet.query.filter_by(access=ACCESS_PUBLIC).count()
    return render_template('index.html', public_count = public_count)


@app.route('/topics')
@login_required
def user():
    topics = g.user.topics
    personal_count = 0
    topicList = []
    for i, topic in enumerate(topics):
        personal_count += topic.snippets.count()
        d = dict(id = topic.id, name = topic.topic, count = topic.snippets.count())
        topicList.append(d)
    public_count = Snippet.query.filter_by(access=ACCESS_PUBLIC).count()

    reply = {'topics':topicList, 'snippet_counts':{'personal_count':personal_count, 'public_count':public_count}}
    return Response(json.dumps(reply), 200, mimetype="application/json")


@app.route('/topic/<atopic>', methods = ['POST', 'PUT', 'DELETE'])
@login_required
def topic(atopic):
    if request.method == 'POST':
        t = Topic(topic = atopic, author = g.user)
        db.session.add(t)
        db.session.commit()
        reply = dict(id = t.id, name = t.topic, count = t.snippets.count())
        return Response(json.dumps(reply), 200, mimetype="application/json")

    elif request.method == 'PUT':
        topic_id = atopic
        topic_name = ""
        topic_name = request.data

        t = g.user.topics.filter_by(id=topic_id).first()
        t.topic = topic_name
        db.session.commit()
        reply = dict(id = t.id, name = t.topic, count = t.snippets.count())
        return Response(json.dumps(reply), 200, mimetype="application/json")

    elif request.method == 'DELETE':
        topic = g.user.topics.filter_by(id=atopic).first()
        if topic is None:
            return jsonify(error=404, text='Invalid topic id'), 404

        # Get all snippets in the topic
        snippets = topic.snippets.all()

        # Move all snippets in the topic to be removed to the 'General' topic
        general_topic = g.user.topics.filter_by(topic='General').first()
        snippets_added_to_general = 0
        for snippet in snippets:
            snippets_added_to_general += 1
            snippet.topic = general_topic

        db.session.delete(topic)
        db.session.commit()

        # Return the number of topics added to the 'General' list
        reply = dict(id = atopic, new_general_snippets = snippets_added_to_general)
        return Response(json.dumps(reply), 200, mimetype="application/json")


@app.route('/snippets/<topic>', methods = ['POST', 'PUT', 'GET', 'DELETE'])
@login_required
def snippets(topic):
    if request.method == 'POST':
        """ Save a new snippet """
        # See if the topic exists
        topic = g.user.topics.filter_by(topic=topic).first()
        if topic is None:
            return jsonify(error=404, text='Invalid topic name'), 404

        # Get the snippet data from the request
        if (request.data):
            data = json.loads(request.data)
        access = ACCESS_PRIVATE;
        if data.get('access') == True:
            access = ACCESS_PUBLIC;
        title = data['title']
        description = data['description']
        code = data['code']
        language = data['language']

        # Persist the snippet to the users topic
        snippet = Snippet(title = title, description = description, code = code,
                          timestamp = datetime.utcnow(), topic = topic,
                          creator_id = g.user.id, language = language, access = access)
        db.session.add(snippet)
        db.session.commit()

        d = dict(title = snippet.title, description = snippet.description, code = snippet.code,
                 language = snippet.language, access = snippet.access,
                 creator_id = snippet.creator_id, id = snippet.id,
                 topic = snippet.topic.topic, snippet_counts = getSnippetCounts())
        return Response(json.dumps(d), 200, mimetype="application/json")

    elif request.method == 'PUT':
        """ Update an existing snippet """
        snippet_id = int(topic)
        topics = g.user.topics
        snippet = None
        for topic in topics:
            snippet = topic.snippets.filter_by(id=snippet_id).first()
            if snippet != None:
                break;

        if snippet == None:
            return jsonify(error=404, text='Invalid snippet ID'), 404

        if (request.data):
            data = json.loads(request.data)
        #pdb.set_trace()
        access = ACCESS_PRIVATE;
        if data.get('access') == True:
            access = ACCESS_PUBLIC;

        snippet.title = data['title']
        snippet.description = data['description']
        snippet.code = data['code']
        snippet.access = access
        snippet.language = data['language']
        db.session.commit()
        return jsonify(id = snippet.id, creator_id = snippet.creator_id, access = snippet.access, snippet_counts = getSnippetCounts())

    elif request.method == 'GET':
        """ Find all snippets associated with a topic """
        # Find the topic
        topic = g.user.topics.filter_by(topic=topic).first()
        if topic is None:
            return jsonify(error=404, text='Invalid topic name'), 404

        # Get all snippets in the topic
        snippets = topic.snippets.order_by(Snippet.timestamp.desc()).all()
        snippetList = []
        for i, snip in enumerate(snippets):
            d = dict(title = snip.title, description = snip.description, code = snip.code,
                     language = snip.language, access = snip.access,
                     creator_id = snip.creator_id, id = snip.id, topic = snip.topic.topic)
            snippetList.append(d)

        return Response(json.dumps(snippetList), 200, mimetype="application/json")

    elif request.method == 'DELETE':
        """ Delete a snippet """
        snippet_id = int(topic)
        topics = g.user.topics
        snippet = None
        for topic in topics:
            snippet = topic.snippets.filter_by(id=snippet_id).first()
            if snippet != None:
                break;

        if snippet == None:
            return jsonify(error=404, text='Invalid snippet ID'), 404

        topicName = snippet.topic.topic
        if snippet.ref_count == 1:
            db.session.delete(snippet)
            db.session.commit()
        else:
            snippet.dec_ref()
            db.session.commit()
        return jsonify({'id':snippet_id, 'topic':topicName, 'snippet_counts':getSnippetCounts()})


@app.route('/snippets/search/personal', methods = ['GET'])
@login_required
def search_personal():
    topics = g.user.topics
    query = request.args['search']

    # Get all user's snippets that match the search
    snippetList = []
    i = 0;
    for topic in topics:
        snippets = Snippet.query.filter_by(topic_id=topic.id).whoosh_search(query).all()
        for snip in snippets:
            d = dict(title = snip.title, description = snip.description, code = snip.code,
                     language = snip.language, access = snip.access, creator_id = snip.creator_id, id = snip.id)
            snippetList.append(d)
            i += 1;

    return Response(json.dumps(snippetList), 200, mimetype="application/json")


@app.route('/snippets/search/public', methods = ['GET'])
def search_public():
    query = request.args['search']

    # Get all public snippets that match the search
    snippets = Snippet.query.whoosh_search(query).filter_by(access=ACCESS_PUBLIC).all()
    snippetList = []
    for i, snip in enumerate(snippets):
        d = dict(title = snip.title, description = snip.description, code = snip.code,
                 language = snip.language, access = snip.access, creator_id = snip.creator_id, id = snip.id)
        snippetList.append(d)
    return Response(json.dumps(snippetList), 200, mimetype="application/json")


@app.route('/logout')
@login_required
def logout():
    #pdb.set_trace()
    username = g.user.name
    reply = {'user' : username}
    logout_user()
    return jsonify(reply)


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
    ### admin_user = User.query.filter_by(name='SomeCode').first()
    admin_user = User.query.filter(User.name.startswith('SomeCode')).first()
    welcome_topic = admin_user.topics.filter_by(topic='Welcome').first()
    welcome_snippets = welcome_topic.snippets
    snippets = welcome_snippets.all()
    snippets.reverse()
    for snip in snippets:
        s = Snippet(title=snip.title, description=snip.description, code=snip.code,
                    timestamp=snip.timestamp, topic=topic, creator_id=user.id,
                    language=snip.language, access=ACCESS_PRIVATE)
        db.session.add(s)

    db.session.commit()

    return user

###
### Facebookk OAuth

@app.route('/signin/facebook_authorized', methods = ['POST'])
def facebook_authorized():
    #pdb.set_trace()
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
    #session['logged_in'] = True
    # see if user is already in the db
    user = User.query.filter_by(email = profile['email']).first()
    if user is None:
        # Save new user and the 'General' topic in the db
        name = profile['name']
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
        if (fb_name !=  profile['name']):
            user.name = profile['name']
            db.session.commit()

    # log the user in
    login_user(user)
    token = create_jwt_token(g.user)
    reply = {'token':token, 'username':user.name, 'userid':user.id}
    return jsonify(reply)

###
### Google OAuth

@app.route('/signin/google_authorized', methods=['POST'])
def google_authorized():
    payload = dict(client_id=request.json['clientId'],
                   redirect_uri=request.json['redirectUri'],
                   client_secret=google['consumer_secret'],
                   code=request.json['code'],
                   grant_type='authorization_code')

    # Step 1. Exchange authorization code for access token.
    r = requests.post(google['access_token_url'], data=payload)
    token = json.loads(r.text)
    headers = {'Authorization': 'Bearer {0}'.format(token['access_token'])}

    # Step 2. Retrieve information about the current user.
    r = requests.get(google['people_api_url'], headers=headers)
    profile = json.loads(r.text)

    # Step 3. Create a new account or return an existing one.
    #session['logged_in'] = True
    # see if user is already in the db
    user = User.query.filter_by(email = profile['emails'][0]['value']).first()
    if user is None:
        # Save new user and the 'General' topic in the db
        name = profile['displayName']
        if (name == ""):
            name = 'Unknown'
        user = createUserInDb(None, profile['id'], None, name, profile['emails'][0]['value'], ROLE_USER)
        if user is None:
            return jsonify(error=500, text='Error creating user'), 500
    else:
        google_id = user.google_id
        if google_id is None:
            user.google_id = profile['id']
            db.session.commit()

        # Update name if it changed
        google_name = user.name
        if (google_name !=  profile['displayName']):
            user.name = profile['displayName']
            db.session.commit()

    # log the user in
    login_user(user)
    token = create_jwt_token(g.user)
    reply = {'token':token, 'username':user.name, 'userid':user.id}
    return jsonify(reply)

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
        #app.logger.debug("Profile = ", profile)
        #app.logger.debug(profile)
        screen_name = profile['screen_name']
        twitter_id = profile['user_id']

        #session['logged_in'] = True
        #print("response user_id and screen_name = {} and {}").format(twitter_id, screen_name)

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
        token = create_jwt_token(g.user)
        reply = {'token':token, 'username':user.name, 'userid':user.id}
        return jsonify(reply)
    else:
        oauth = OAuth1(twitter['consumer_key'],
                       client_secret=twitter['consumer_secret'],
                       callback_uri=request.url_root)
        #app.logger.debug("oauth consumer key = %s", twitter['consumer_key'])
        #app.logger.debug("oauth consumer secret = %s", twitter['consumer_secret'])
        #app.logger.debug("oauth callback URI = %s", request.url_root)

        r = requests.post(twitter['request_token_url'], auth=oauth)
        oauth_token = dict(parse_qsl(r.text))
        qs = urlencode(dict(oauth_token=oauth_token['oauth_token']))
        return redirect(twitter['authenticate_url'] + '?' + qs)

