from flask_login import UserMixin

session_feeds = {} # a dictionary where the key is user id and the value is list of seen posts

class User(UserMixin):
    def __init__(self, user_id):
        # flask_login expects self.id to be a string. it's converted automatically from the database
        self.id = user_id
        if self.get_int_id() not in session_feeds:
            session_feeds[self.get_int_id()] = []
            print(self.get_int_id(), 'added to session_feeds', session_feeds)
        else:
            print(self.get_int_id(), 'already in session_feeds', session_feeds)
    
    def is_anonymous(self):
        return False
    def is_authenticated(self):
        return True
    
    def get_int_id(self):
        # occasionally useful
        return int(self.id)
    