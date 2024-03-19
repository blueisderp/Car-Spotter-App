"""

follow or unfollow users. see followers/following

MVC: model and control logic are both in this file
The first check in each function quickly disregards requests that are attempting to
reference a displayname longer than Postgres schema allowed
"""

from flask_login import login_required, current_user
from flask import jsonify

from backend.db_queries import db_connection_pool
from backend.users_basic import blueprint_users_basic

@blueprint_users_basic.route('/user_function/<method>/<displayname>', methods=['POST'])
@login_required
def follow(method, displayname):
    """
    This function follows or unfollows a user. 

    /user_function/follow/<displayname>
    /user_function/unfollow/<displayname>
    """

    if len(displayname) > 32:
        return 'Bad Request', 400

    if method == 'follow':
        with db_connection_pool.connection() as conn:
            conn.execute(
                """
                INSERT INTO follows(follower, followed) VALUES(
                    %s,
                    (SELECT id FROM users WHERE displayname=%s)
                );
                """,
                (current_user.get_int_id(), displayname)
            )
            conn.commit()
            return 'followed', 201
    elif method == 'unfollow':    
        with db_connection_pool.connection() as conn:
            conn.execute(
                """
                DELETE FROM follows
                WHERE   follower=%s 
                        AND followed=(
                            SELECT id FROM users
                            WHERE displayname=%s
                        );
                """,
                (current_user.get_int_id(), displayname)
            )
            conn.commit()
            return 'no longer following', 201
        
    return 'Server error', 500


@blueprint_users_basic.route('/user_function/get_relations/<relation>', methods=['GET'])
@blueprint_users_basic.route('/user_function/get_relations/<relation>/<displayname>', methods=['GET'])
@login_required
def get_list(relation, displayname=None):
    """
    This function returns a list of displaynames and id's
    It shows who is following who

    Since the frontend always knows the displayname the route without displayname is never used
    It's cool to just have in there
    """
    if len(relation) > 32:
        return 'Bad Request', 400
    
    # this string is the start of any relation query
    find_relations_query = """
        SELECT related.profile_picture_id, related.displayname
        FROM users owner
    """

    # choose next part of relation query
    if relation == 'followers':
        find_relations_query += """
            JOIN follows f ON f.followed=owner.id
            JOIN users related ON f.follower=related.id
        """
    elif relation == 'following':
        find_relations_query += """
            JOIN follows f ON f.follower=owner.id
            JOIN users related ON f.followed=related.id
        """
    else:
        return 'Bad Request', 400
    
    # finally, to support the self|displayname-less query it queries the id instead of the displayname
    if displayname:
        find_relations_query += " WHERE owner.displayname=%s "
    else:
        find_relations_query += " WHERE owner.id=%s "

    # debug
    #print(type(displayname), displayname, " ||| backup id for self:", current_user.get_int_id())
    #print(find_relations_query)

    with db_connection_pool.connection() as conn:    
        if displayname:
            cur = conn.execute(find_relations_query, (displayname,))
        else:
            cur = conn.execute(find_relations_query, (current_user.get_int_id(),))
        return jsonify(
            [{"displayname": displayname, "pfp_id": pfp_id} for pfp_id, displayname in cur.fetchall()]
        ), 200
    return 'Server error', 500

