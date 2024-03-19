from flask import Flask, render_template, jsonify
from flask_login import LoginManager
import configparser

# config.ini
config = configparser.ConfigParser()
config.read('config.ini')

# Flask app. Some of these attributes help serve static folders - the entire React project is static
app = Flask(
    __name__,
    static_url_path='',
    static_folder='frontend/build',
    template_folder='frontend/build'
)
# This helps flask_login, cookies, and some other secrets.
# Perhaps a seed for random? Keeping this key the same often saves sessions between restarts
app.config['SECRET_KEY'] = config["SECRET_KEY"]["key"]


# Load routes for static assets in Postgres
from backend.static import blueprint_db_static
app.register_blueprint(blueprint_db_static)
# Load the route for the user post use case (including ML model). Everything it needs is taken care of in that file
from backend.user_post_flow import blueprint_user_post_flow
app.register_blueprint(blueprint_user_post_flow)

# flask_login handles all the cookies since those can get complicated to handle
login_manager = LoginManager(app)
login_manager.login_view = 'blueprint_users_basic.login'
from backend.user import User
@login_manager.user_loader
def load_user(user_id):
    return User(user_id)

# users_basic has lots of endpoints. Examples login, register, logout, garage
from backend.users_basic import blueprint_users_basic
app.register_blueprint(blueprint_users_basic)

@app.route("/")
def index():
    # This is the main entry point for React. Other entry points in the project are for fetch/restful api
    return render_template("index.html")

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=3030)
print('main.py is finishing execution. see readme for gunicorn instructions instead')
