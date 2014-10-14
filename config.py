import os

SECRET_KEY = '\xb1\x15Vjr\x1f\xdf\x18Q*\x18zGAm\xef\x06\x8eD\xbaF\x02\xf1\xfb'

# SQLAlchemy-migrate stuff
basedir = os.path.abspath(os.path.dirname(__file__))
# The path to the database file
SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(basedir, 'app.db')
#SQLALCHEMY_DATABASE_URI = 'postgresql://localhost' + os.path.join(basedir, 'app.db')
# Where the slqalchemy-migrate data files are stored
SQLALCHEMY_MIGRATE_REPO = os.path.join(basedir, 'db_repository')
# WhooshAlchemy for db searches
WHOOSH_BASE = os.path.join(basedir, 'search.db')

# OAuth stuff
TOKEN_SECRET = SECRET_KEY
FACEBOOK_APP_ID = '493837160742216'
FACEBOOK_APP_SECRET = '2bf379639bf9c4dbb4cc23da5bda284b'
TWITTER_APP_KEY = 'WAkx9YwlZt8IhhTnm9h59QuZu'
TWITTER_APP_SECRET = 'E8hqXow6vCQs6ziOPgz141Krd3ZnK87AiL8vLFo2zFvL9fM3ma'
TWITTER_CALLBACK_URL = 'http://jmsomecode.herokuapp.com:5000'
GOOGLE_CLIENT_ID = '548449261611.apps.googleusercontent.com'
GOOGLE_CLIENT_SECRET = '16xD_4oywvjFv65GZzVqSCHl'

facebook = {
    'graph_api_url': 'https://graph.facebook.com/me',
    'access_token_url': 'https://graph.facebook.com/oauth/access_token',
    'consumer_key': FACEBOOK_APP_ID,
    'consumer_secret': FACEBOOK_APP_SECRET,
}

twitter = {
    'request_token_url': 'https://api.twitter.com/oauth/request_token',
    'access_token_url': 'https://api.twitter.com/oauth/access_token',
    'authenticate_url': 'https://api.twitter.com/oauth/authenticate',
    'callback_uri': TWITTER_CALLBACK_URL,
    'consumer_key': TWITTER_APP_KEY,
    'consumer_secret': TWITTER_APP_SECRET
}

google = {
    'access_token_url': 'https://accounts.google.com/o/oauth2/token',
    'people_api_url' : 'https://www.googleapis.com/plus/v1/people/me/openIdConnect',
    'consumer_key': GOOGLE_CLIENT_ID,
    'consumer_secret': GOOGLE_CLIENT_SECRET
}
