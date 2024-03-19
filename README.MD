# [Live Deployment](https://sc-backend.brian2002.com)

## File Structure
 - updateTODO??:
   - /frontend is the entire npm project
     - if you are ONLY doing frontend work it is appropriate to make that the folder you open in vscode
     - run `npm run start` in that folder, not this root directory
     - that directory may have its own readme
     - still make commits normally even if you only work in /frontend
     - write code primarily in /frontend/src
   - /ACURA has the folder for the only model 
   - main.py, model.py, other python files in root are for backend

## Routes
- /login
- /register
- /logout
- /garage/\<displayname>
- /search_users/\<query>
- /pfp/\<id> #ID of static pfp, NOT ID OF USER; no dynamic pfp yet
- /predict
- /user_function
    - /follow/\<displayname>
    - /unfollow/\<displayname>

## Backend
 - flask server for ml. takes a request and returns predictions  
 - many details documented in each file & function
 
## Running
I always recommend to do a venv
 - A certain version of python may be required for tensorflow ?? tbd. 3.11 confirmed working
 - `python -m venv venvname`
 - Activating venv:
   - Linux: `source venvname/bin/activate`
   - Windows: `venvname/Scripts/activate`
 - Install required libraries with pip
   - untested, however try `pip install -r requirements.txt`
   - otherwise try old fashioned way with `pip install tensorflow numpy flask gunicorn pillow flask-cors flask-login argon2-cffi "psycopg[binary]" pip install "psycopg[pool]"`
   - I've outlined how to install psycopg using the binaries however this isn't the best practice, as the documentation for psycopg installation states that with a 'Local Installation' all upgrades in dependencies will be automatically used. For the scope of the class this is too much to learn/maintain.
     - ..etc you'll see the next missing library each time it fails to run
 - Make a valid config file or get one from Brian ~ config.ini (need to do ssh tunnel in python first)
 - Make sure the frontend React project is built.
   - Navigate to 'frontend'
   - If it's the first time you need to run `npm install`
   - After making any changes make sure to compile them with `npm run build` otherwise Flask will serve your older build
 
## Finally, pick a way to serve:
### Gunicorn
 - only ?necessary? for deployment
 - have gunicorn installed 'pip install gunicorn'
 - gunicorn --workers 2 --bind 0.0.0.0:3030 main:app
   - i've copied the gunicorn command into run.sh
### Flask development server
- for developers this is the go-to to see full-stack
 1. Activate the venv
 2. `python main.py`
### npm development server
 1. Navigate to 'frontend'
 2. `npm run start`
