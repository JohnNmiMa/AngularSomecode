from flask import render_template
from app import app
import pdb

@app.route('/')
@app.route('/index')
def index():
    #public_count = Snippet.query.filter_by(access=ACCESS_PUBLIC).count()
    return render_template('index.html')