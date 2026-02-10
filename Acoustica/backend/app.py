from flask import Flask, jsonify
from dotenv import load_dotenv
from db import init_db
from flask_cors import CORS
import logging

# import the blueprints
from routes import activities, admins, albums, analytics, artists, auth, listeners, playlists, posts, shop, social, songs, subscriptions, transactions, users

load_dotenv()

logging.basicConfig(
    filename = "app.log",
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s"
)

app = Flask(__name__)
CORS(app)

# register the blueprints
app.register_blueprint(activities.activities)
app.register_blueprint(admins.admins)
app.register_blueprint(albums.albums)
app.register_blueprint(analytics.analytics)
app.register_blueprint(artists.artists)
app.register_blueprint(auth.auth)
app.register_blueprint(listeners.listeners)
app.register_blueprint(playlists.playlists)
app.register_blueprint(posts.posts)
app.register_blueprint(shop.shop)
app.register_blueprint(social.social)
app.register_blueprint(songs.songs)
app.register_blueprint(subscriptions.subscriptions)
app.register_blueprint(transactions.transactions)
app.register_blueprint(users.users)

@app.route("/")
def home():
    return jsonify({"message": "This is backend"})

if __name__ == "__main__":
    # init_db()
    app.run(host = "0.0.0.0", port = 8000, debug = True)