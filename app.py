from flask import render_template
from flask import request

import time
import flask
import logging
import sys
from flask import Flask
#from flask_sslify import SSLify
import tweepy

import os
import requests

from flask import send_from_directory
from flask import Response, redirect, make_response

import time
from werkzeug.exceptions import Unauthorized

from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Table, Column, Float, Integer, String, DateTime, MetaData, ForeignKey, func

app = Flask(__name__,static_url_path='/static')
#sslify = SSLify(app)
#app.logger.addHandler(logging.StreamHandler(sys.stdout))
#app.logger.setLevel(logging.ERROR)

try:
  app.config['SQLALCHEMY_DATABASE_URI'] = os.environ['DATABASE_URL2']
except:
  app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///:memory:"
db = SQLAlchemy(app)

try:
  consumer_key = os.environ['TWITTER_KEY']
  consumer_secret = os.environ['TWITTER_SECRET']
except:
  print('OOPS TWITTER BROKEN')

class Sessions(db.Model):
  id = db.Column(db.Integer, primary_key=True)
  url = db.Column(db.String(80))
  user = db.Column(db.String(80))
  ctime = db.Column(DateTime, default=func.now())

class Users(db.Model):
  id = db.Column(db.Integer, primary_key=True)
  username = db.Column(db.String(80))
  last = db.Column(DateTime, default=func.now())  
  ctime = db.Column(DateTime, default=func.now())  

@app.before_first_request
def setup():
  print("[+] running setup")
  try:
    db.create_all()
    print("[+] created db")
  except:
    print("[+] db already exists")

@app.route('/')
def index():
  username = None
  try:
    key = request.cookies.get('twitter_key')
    secret = request.cookies.get('twitter_secret')
    auth = tweepy.OAuthHandler(consumer_key, consumer_secret)
    auth.set_access_token(key, secret)
    api = tweepy.API(auth)
    username = api.verify_credentials().screen_name
  except Exception as e:
    print(e)

  return render_template('index.html',username=username)

@app.route('/login')
def login():
  auth = tweepy.OAuthHandler(consumer_key, consumer_secret)
  return redirect(auth.get_authorization_url(), code=302)

@app.route('/twitter')
def twitter():
  auth = tweepy.OAuthHandler(consumer_key, consumer_secret)
  token = request.args.get('oauth_token')
  verifier = request.args.get('oauth_verifier')
  auth.request_token = { 'oauth_token' : token, 'oauth_token_secret' : verifier }
  access = auth.get_access_token(verifier)
  
  response = make_response(redirect('/'))
  response.set_cookie('twitter_key', value = access[0], httponly = True)
  response.set_cookie('twitter_secret', value = access[1], httponly = True)
  return response

@app.route('/new', methods=['POST'])
def new():
  try:
    key = request.cookies.get('twitter_key')
    secret = request.cookies.get('twitter_secret')
    auth = tweepy.OAuthHandler(consumer_key, consumer_secret)
    auth.set_access_token(key, secret)
    api = tweepy.API(auth)
    username = api.verify_credentials().screen_name

  except:
    return "NOPE, LOGIN FIRST"

  session = Session()
  session.url = "potato"
  session.user = username
  session.title = request.values['title']
  db.session.add(session)
  db.session.commit()  
  return "THANKS"

@app.route('/view')
def view():
  return render_template('view.html')
  #return render_template('templates/view.html',request.values['id'])

@app.route('/favicon.ico')
def favicon():
  return send_from_directory(os.path.join(app.root_path, 'static'),
    'favicon.ico',mimetype='image/vnd.microsoft.icon')

@app.route('/list')
def dump():
  session_list = Sessions.query.order_by(Interesting.ctime.desc()).all()
  return render_template("json.html",session_list)
