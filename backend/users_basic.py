"""
This file is for API endpoints - BACKEND
"""
from flask import Blueprint, request, redirect, url_for, jsonify
from flask_login import login_user, login_required, logout_user, current_user
from backend.user import User, session_feeds # delete a user entry upon logging out
from backend.db_queries import db_connection_pool

from argon2 import PasswordHasher
from datetime import datetime

blueprint_users_basic = Blueprint("blueprint_users_basic", __name__)
import backend.follow # make sure to import this AFTER the blueprint is made to avoid circular import

ph = PasswordHasher()

@blueprint_users_basic.route('/test_session', methods=['GET'])
@login_required
def test_session():
    return 'Session seems valid', 200

@blueprint_users_basic.route('/login', methods=['POST'])
def login():
    """
    Takes in a form and responds so React can act accordingly
    # TODO MAKE SURE THIS WORKS WITH login_manager.login_view = 'blueprint_users_basic.login'
    """
    email = request.form['email']
    raw_password = request.form['password']

    with db_connection_pool.connection() as conn:
        cursor = conn.execute(
            """
            SELECT id, password
            FROM users
            WHERE email = %s;
            """,
            (email,)
        )
        # fetchone() should return (id, hashed_password)
        query_result = cursor.fetchone()
        if query_result is None:
            # most likely caused by non-existent email
            return "Log In Rejected", 401
        if query_result is not None:
            id, hash = query_result
            # print("debug555", id, hash, raw_password, type(hash), type(raw_password))
            try:
                # ph.verify is the argon2 function
                # unfortunately, it does NOT return a boolean, but just throws an exception
                ph.verify(hash, raw_password)
                login_user(User(id))
                print("\nuser " + str(id) + " successfully logged in\n")
                return "Log In Success", 202
            except Exception as e:
                return "Log In Rejected", 401
    return "Server error", 500

@blueprint_users_basic.route('/register', methods=['POST'])
def register():
    """
    Takes in a form and responds so React can act accordingly
    TODO FIX THIS FUNCTION THAT CURRENTLY DOES NO ERROR CHECKING

    AS OF NOW THIS FUNCTION DOES NOT CHECK FOR VALID INPUTS
        NOR
    GRACEFULLY FAIL IF IT VIOLATES SQL RULES

    TODO FIX EXCEPTIONS IE DUPLICATE EMAIL, DUPLICATE DISPLAYNAME
    """
    displayname = request.form["displayname"]
    email = request.form["email"]
    raw_password = request.form["password"]

    with db_connection_pool.connection() as conn:
        cursor = conn.execute(
            """
            INSERT INTO users (email, displayname, password)
            VALUES (%s, %s, %s)
            RETURNING id;
            """,
            (
                email,
                displayname,
                ph.hash(raw_password)
            )
        )
        # Since the query says 'returning id;' this fetchone() returns a tuple that represents a row.
        # This row has exactly one column that is the id
        query_result = cursor.fetchone()
        #print("SIGNUP QUERY RESULT: ", query_result)
        if query_result is not None:
            conn.commit()
            login_user(User(query_result[0]))
            return 'Registration Success', 201
        return 'Registration Failed', 409
    return 'Server Error', 500


# TODO declare rest methods
@blueprint_users_basic.route('/logout')
@login_required
def logout():
    """
    logout_user() interfaces with flask_login
    TODO fix return redirect to work with fetch api
    """
    del session_feeds[current_user.get_int_id()]
    logout_user()
    return redirect(url_for('index'))

@blueprint_users_basic.route('/garage', methods=['GET'])
@blueprint_users_basic.route('/garage/<displayname>', methods=['GET'])
@login_required
def garage(displayname=None):
    """
    Public fields when viewing a profile.
    Expects a string to search by displayname, however this
        function (not route) can also take an integer to search by id.
        displayname passed in from the flask route is always a string,
        however the other garage route calls this function passing in an id integer

    Given a (target user's ID or displayname, current_user's ID) returns counts:
    (displayname, followers, following, follow_status, catches, pfp)
    Follow status is one of 'self', 'following', 'stranger', '', 1
    OR if ID isn't found:
    ("", -2, -2, "", -2)
    """
    # If a displayname is provided that's the target, otherwise target self
    target_user=current_user.get_int_id()
    if displayname:
        target_user = displayname

    # ERROR CASE to be overwritten later; otherwise this error is the default
    displayname = ''
    followers = -2
    following = -2
    follow_status = ''
    catches = -2
    pfp = 1
    
    with db_connection_pool.connection() as conn:
        cursor = conn.execute(
            """
            SELECT
                cache.target_displayname,
                (SELECT count(*) AS followers FROM follows JOIN users ON users.id=follows.followed WHERE users.id=cache.target_id),
                (SELECT count(*) AS following FROM follows JOIN users ON users.id=follows.follower WHERE users.id=cache.target_id),
                (
                    SELECT
                        CASE
                            WHEN cache.target_id = cache.current_id THEN 'self'
                            WHEN (SELECT COUNT(*)=1 FROM follows WHERE follower = cache.current_id AND followed = cache.target_id) THEN 'following'
                            ELSE 'stranger'
                        END as follow_status
                ),
                (
                    SELECT count(*)
                    FROM posts
                    WHERE user_id=cache.target_id
                ) AS catches,
                cache.pfp_id
            FROM
                (
                    SELECT 
                        id as target_id,
                        displayname as target_displayname,
                        (SELECT %s) as current_id,
                        profile_picture_id as pfp_id
                    FROM users """ +
                    ("WHERE id = " if type(target_user) is int else "WHERE displayname = ") + """ %s
                ) AS cache
            """,
            (current_user.get_int_id(), target_user,)
        )
        # fetchone() should be a tuple: (displayname, followers, following, follow_status, catches)
        query_result = cursor.fetchone()
        print(query_result)
        if query_result is not None:
            displayname, followers, following, follow_status, catches, pfp = query_result
    
    return jsonify(
        {
            "displayname": displayname,
            "followers": followers,
            "following": following,
            "follow_status": follow_status,
            "catches": catches,
            "pfp_id": pfp,
        }
    ), 200

@blueprint_users_basic.route('/search_users/<query>', methods=['GET'])
def search(query):
    """
    This function was added after the first work review.

    It serves a list of users to be fed into the frontend RenderUserList.js:
    [{displayname, pfp_id}, {displayname, pfp_id} ...]

    LIMIT 32 to not make too much load
    """
    with db_connection_pool.connection() as conn:
        cursor = conn.execute(
            """
            SELECT displayname, profile_picture_id
            FROM users
            WHERE displayname ILIKE %s
            LIMIT 32;
            """,
            (query + '%',)
        )
        # Since the query says 'displayname' this fetchall() returns a list of tuples that each represent a row.
        #  Each row has exactly one column that is the displayname
        #  Convert this simply to a list of displaynames with flat_list
        query_result = cursor.fetchall()
        if query_result is not None:
            flat_list = [{"displayname": row[0], "pfp_id": row[1]} for row in query_result]
            print("query result for '" + query + "':", flat_list)
            return jsonify(flat_list)
        print("DB_QUERIES.SEARCH_USERNAME ERROR. QUERY:", query, "QUERY_RESULT:", query_result)
        return jsonify([]), 200
    print(datetime.now(), "search_username error. query:", query)
    return 'Server Error', 500


# SUGGESTIONS AND BUG REPORTING
@blueprint_users_basic.route('/brs', methods=['POST'])
@login_required
def suggest_or_report_bug():
    """
    Simple sql to post a bug report. TODO check date/time of last sent to stop spam. 

    This backend endpoint is almost done for Peer Review 2 however it's not available on the frontend yet. 
    """
    message = request.json.get('message')
    if len(message) > 2048:
        return '2048 Characters Max', 413 # Content too large

    with db_connection_pool.connection() as conn:
        conn.execute(
            """
            INSERT INTO suggestions(user_id, suggestion)
            VALUES (%s, %s);
            """,
            (current_user.get_int_id(), message)
        )
        return 'Success', 200
    return 'Server error', 500