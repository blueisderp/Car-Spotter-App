# Sportscar Hunter
A Car Social Media app using React Native

## LINK
https://sc-backend.brian2002.com  
https://github.com/491A-Group/SeniorProject

# Front End
### React
React is our front-end library. We make lots of fetch requests to the backend, minimizing server-side rendering. 

#### Running
You can write for the frontend and see most changes by navigating to this /frontend folder and running `npm run start` which will start a development server you can see in your browser, and even your phone if you're at home. 

#### Deploying
Deploying is tedious since the server needs to pull changes, compile the frontend project, and may need to restart. The closest-to-streamline workflow we have is the 5-line python script that asks the server to do the process: senior_project_ci.py

Run the script and wait for it to output the servers' output. It may take a few seconds for the server to fully start however shortly after receiving output you should be able to access https://sc-backend.brian2002.com  
