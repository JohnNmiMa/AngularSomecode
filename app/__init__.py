import os, logging
from logging.handlers import RotatingFileHandler
from flask import Flask
from flask.ext.login import LoginManager
from flask.ext.sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config.from_object('config')
db = SQLAlchemy(app)

login_manager = LoginManager()
login_manager.init_app(app)

file_handler = RotatingFileHandler('somecodelog', maxBytes=10000, backupCount=1)
file_handler.setLevel(logging.DEBUG)
app.logger.addHandler(file_handler)

from app import views, models
