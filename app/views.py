from flask import current_app
#from flask import render_template, flash, redirect, url_for, session, request, g, jsonify
from flask import render_template, flash, redirect, url_for, session, request, g
from flask.ext.jsonpify import jsonify
from flask.ext.login import login_user, logout_user, current_user, login_required
from models import User, Topic, Snippet, ROLE_USER, ROLE_ADMIN, ACCESS_PRIVATE, ACCESS_PUBLIC
from app import app, db, login_manager, oauth
from facebook_oauth import facebook
from twitter_oauth import twitter
from google_oauth import google
from datetime import datetime
from sqlalchemy import desc
import json
import pdb


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


@app.route('/signin/<social>')
def signin(social):
    if g.user is not None and g.user.is_authenticated():
        print('In signin, but already authenticated and logged in')
        return redirect(url_for('user'))

    if (social == 'facebook'):
        #pdb.set_trace()
        global thecallback
        thecallback = request.args.get('callback')
        #result = facebook.authorize(callback=url_for('facebook_authorized',
        return facebook.authorize(callback=url_for('facebook_authorized',
                                  next=request.args.get('next') or request.referrer or None,
                                  _external=True))
        #return result
    elif (social == 'twitter'):
        pdb.set_trace()
        return twitter.authorize(callback=url_for('twitter_authorized',
                                 next=request.args.get('next') or request.referrer or None))
    elif (social == 'google'):
        return google.authorize(callback=url_for('google_authorized', _external=True))

    # Log the user in - this will create a flask session
    return redirect(url_for('user'))

def __pad(strdata):
    global thecallback
    str = "%s(%s);" % (thecallback, strdata)
    return str

def __dumps(*args, **kwargs):
    indent = None
    if current_app.config.get('JSONIFY_PRETTYPRINT_REGULAR', False) \
        and not request.is_xhr:
        indent = 2
    return json.dumps(args[0] if len(args) is 1 else dict(*args, **kwargs), indent=indent)

def myjsonpify(*args, **kwargs):
    resp = current_app.response_class(__pad(__dumps(*args, **kwargs)),
                                      mimetype='application/json')
    return resp

@app.route('/user')
def user():
    topics = g.user.topics
    personal_count = 0
    for topic in topics:
        personal_count += topic.snippets.count()
    public_count = Snippet.query.filter_by(access=ACCESS_PUBLIC).count()

    pdb.set_trace()
    reply = {'username':g.user.name}
    #return jsonify(reply)
    return myjsonpify(reply)
    #return render_template('user.html', name = g.user.name, user_id = g.user.id,
    #                       topics = topics.all(), page = 'home',
    #                       personal_count = personal_count, public_count = public_count)


@app.route('/logout')
@login_required
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

@app.route('/signin/facebook_authorized')
@facebook.authorized_handler
def facebook_authorized(resp):
    #pdb.set_trace()
    next_url = request.args.get('next') or url_for('index')
    if resp is None or 'access_token' not in resp:
        #return redirect(next_url)
        flash(u'<h5>Facebook login error - please try logging in again!</h5>', 'error')
        return redirect(next_url)

    # The session must contain the access token before you can query the facebook API (such as
    # calling facebook.get('/me')
    session['logged_in'] = True
    session['oauth_token'] = (resp['access_token'], '')
    me = facebook.get('/me')
    #print("response user id, username & email = {}, {} & {}").format(me.data['id'], me.data['username'], me.data['email'])
    #pdb.set_trace()

    # See if user is already in the db
    user = User.query.filter_by(email = me.data['email']).first()
    if user is None:
        # Save new user and the 'General' topic in the db
        name = me.data['username']
        if (name == ""):
            name = 'Unknown'
        user = createUserInDb(me.data['id'], None, None, name, me.data['email'], ROLE_USER)
        if user is None:
            return jsonify(error=500, text='Error creating user'), 500
    else:
        fb_id = user.fb_id
        if fb_id is None:
            user.fb_id = me.data['id']
            db.session.commit()

        # Update name if it changed
        fb_name = user.name
        if (fb_name !=  me.data['username']):
            user.name = me.data['username']
            db.session.commit()

    # Log the user in
    login_user(user)
    return redirect(url_for('user'))

@facebook.tokengetter
def get_facebook_oauth_token():
    return session.get('oauth_token')


###
### Twitter OAuth

@app.route('/signin/twitter_authorized')
@twitter.authorized_handler
def twitter_authorized(resp):
    #pdb.set_trace()
    next_url = request.args.get('next') or url_for('index')
    if resp is None:
        flash(u'<h5>Twitter login error - please try logging in again!</h5>', 'error')
        return redirect(next_url)

    # Save the access token away
    session['logged_in'] = True
    session['oauth_token'] = (
        resp['oauth_token'],
        resp['oauth_token_secret']
    )
    screen_name = resp['screen_name']
    twitter_id = resp['user_id']
    session['twitter_user'] = screen_name
    #print("response user_id and screen_name = {} and {}").format(resp['user_id'], resp['screen_name'])

    # See if user is already in the db
    user = User.query.filter_by(twitter_id = twitter_id).first()
    if user is None:
        # Save new user in the db
        name = screen_name
        if (name == ""):
            name = 'Unknown'
        user = createUserInDb(None, None, twitter_id, name, '', ROLE_USER)
        if user is None:
            return jsonify(error=500, text='Error creating user'), 500
    else:
        # Update name if it changed
        twitter_name = user.name
        if (twitter_name != screen_name):
            user.name = screen_name
            db.session.commit()

    # Log the user in
    login_user(user)
    return redirect(url_for('user'))

@twitter.tokengetter
def get_twitter_oauth_token():
    return session.get('oauth_token')


###
### Google OAuth

@app.route('/signin/google_authorized')
@google.authorized_handler
def google_authorized(resp):
    next_url = request.args.get('next') or url_for('index')
    if resp is None or 'access_token' not in resp:
        flash(u'<h5>Google login error - please try logging in again!</h5>', 'error')
        return redirect(next_url)

    # Get the users oauth information
    from urllib2 import Request, urlopen, URLError, HTTPError
    import json

    access_token = resp['access_token']
    headers = {'Authorization': 'OAuth '+access_token}
    req = Request('https://www.googleapis.com/oauth2/v1/userinfo', None, headers)
    try:
        response = urlopen(req)
    except HTTPError as e:
        if e.code == 401:
            # Unauthorized - bad token
            flash(u'<h5>Google login error - please try logging in again!</h5>', 'error')
            return redirect(next_url)

    # Save the access token away
    session['logged_in'] = True
    session['oauth_token'] = access_token, ''
    #print("response user id, username & email = {}, {} & {}").format(me['id'], me['name'], me['email'])
    #pdb.set_trace()

    # See if user is already in the db
    me = json.load(response)
    user = User.query.filter_by(email = me['email']).first()
    if user is None:
        # Save new user in the db
        name = me['given_name']
        if (name == ""):
            name = 'Unknown'
        user = createUserInDb(None, me['id'], None, name, me['email'], ROLE_USER)
        if user is None:
            return jsonify(error=500, text='Error creating user'), 500
    else:
        google_id = user.google_id
        if google_id is None:
            user.google_id = me['id']
            db.session.commit()

        # Update name if it changed
        google_name = user.name
        if (google_name != me['given_name']):
            user.name = me['given_name']
            db.session.commit()

    # Log the user in
    login_user(user)
    return redirect(url_for('user'))


@google.tokengetter
def get_google_access_token():
    #pdb.set_trace()
    return session.get('oauth_token')


def pop_login_session():
    session.pop('logged_in', None)
    session.pop('oauth_token', None)


@login_manager.user_loader
def load_user(id):
    return User.query.get(int(id))

