import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import loading from "../images/loading.gif";
  

export default function LoginPage() {
    const navigate = useNavigate();

    //When isLogIn is false, assume the user wants to create an account
    const [isLogIn, setIsLogIn] = useState(true);
    const [successfulLogIn, setSuccessfulLogIn] = useState(false);
  
    // This effect is used to give a second-long pause,
    //then redirect user to Home page once they have successfully logged in.
    useEffect(() => {
        if (successfulLogIn) {
            const timeout = setTimeout(() => {
                navigate("/home");
            }, 1000);

            return () => clearTimeout(timeout);
        }
    }, [successfulLogIn]); //dependency array, used to prevent re-running effect after every render
  
    //These states have the strings of user input in the forms. 
    //The Login and Register portions share these states so switching between them doesn't clear fields
    const [input_displayname, setDisplayname] = useState('');
    const [input_email, setEmail] = useState('');
    const [input_password, setPassword] = useState('');
    const [check_password, setCheckPassword] = useState('');

    // This is new, error messages for email verification and forgotten password.
    // More messages were created for various error messages.
    const [errorMessage, setErrorMessage] = useState('');
    const [passwordMessage, setPasswordMessage] = useState('');
    const [displayNameErrorMessage, setDisplayNameErrorMessage] = useState('');
    const [emailErrorMessage, setEmailErrorMessage] = useState('');
    const [passErrorMessage, setPassErrorMessage] = useState('');
    const [passwordNotMatchError, setPasswordNotMatchError] = useState('');
    const [logInFailureError, setLogInFailureError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    
    //state for pw pop up note for pw suggestions
    //When set to false, it will show all text input into the password field 
    //as password text (****), when true it will show all text input as plain text.
    const [passwordNoteVisible, setPasswordNoteVisible] = useState(false);
  
  
    //This was written to handle both switching between Login/Register
    //pages AND clearing error messages (invalid email message does not
    //persist rendering on Login page once switched back and forth)
    const handlePageSwitch = (status) => {
      setIsLogIn(status);
      setIsLoading(false);
      setErrorMessage('');
      setPasswordMessage('');
      setPasswordNoteVisible(false);
      setDisplayNameErrorMessage('');
      setEmailErrorMessage('');
      setPassErrorMessage('');
      setPasswordNotMatchError('');
      setLogInFailureError('');
    }
  
    //Handlers for the states - updates changes when users type
    const handleDisplaynameChange = (event) => {setDisplayname(event.target.value)}
    const handleEmailChange = (event) => {
        setEmail(event.target.value);
        validateEmail(event.target.value);
    }
    
    //sets password field to take in user input
    const handlePasswordChange = (event) => {setPassword(event.target.value)}
    //sets confirm password field to take in user input 
    const handleCheckPasswordChange = (event) => {setCheckPassword(event.target.value)}

    
  
    // currently just works with cookies and does no re-routing logic
    const handleSubmitLogin = (event) => {

        //This new chunk is for validating that the email and password
        //fields are valid before continuing the rest of handleSubmitLogin.
        setIsLoading(true);
        setPasswordNotMatchError('');
        setEmailErrorMessage('');
        setPassErrorMessage('');
        setDisplayNameErrorMessage('');
        setPasswordNoteVisible(false);
        setLogInFailureError('');

        //hasError is a boolean that is marked as "true" when any validations for email/passwords fail.
        //this allows for us to set the error messages and exit once we've gone through all of the validations,
        //not just returning upon whichever validation that fails.
        let hasError = false;

        if (!validateEmail(input_email)) {
            setEmailErrorMessage("Invalid email format.");
            hasError = true;
        }

        if (!validatePassword(input_password)) {
            setPassErrorMessage("Password field cannot be blank.");
            hasError = true;
        }

        if (hasError) {
            setIsLoading(false);
            return;
        }

        setEmailErrorMessage('');
        setPassErrorMessage('');

        let login_form = new FormData()
        login_form.append("email", input_email)
        login_form.append("password", input_password)

        //console.log(input_email, input_password)
        fetch(window.location.origin + "/login", {
            method: 'POST',
            body: login_form
        })
        .then(response => {
            if (response.ok) {
                setSuccessfulLogIn(true); //RL: New; needed for redirect to homepage after successful login.
                console.log("login success")
            } else {
                setLogInFailureError('Login failed. Check credentials and try again.')
                setIsLoading(false);
                console.log("login error")
            }
        })
    }

    //helped write this function to sign up
    // currently just works with cookies and does no re-routing logic
    //Modified function to include constraints and set error messages if any of the validations
    //are not met.
    const handleSubmitRegister = (event) => {
        setIsLoading(true);
        /*
        if (input_displayname.toLowerCase() == 'iloveml') {
            window.location.href = 'https://encord.com/blog/an-introduction-to-data-labelling-and-training-data/'
            return;
        }
        */
        setPasswordNotMatchError('');
        setEmailErrorMessage('');
        setPassErrorMessage('');
        setDisplayNameErrorMessage('');
        setPasswordNoteVisible(false);
        let hasError = false;

        if(!validateDisplayName(input_displayname)) {
            setDisplayNameErrorMessage("Display Name cannot be blank.")
            hasError = true;
        }

        if (!validateEmail(input_email)) {
            setEmailErrorMessage("Invalid email format.");
            hasError = true;
        }

        if (!validatePassword(input_password) || !validatePassword(check_password)) {
            setPassErrorMessage("Password field(s) cannot be blank.");
            setIsLoading(false);
            return;
        }

        if (!handlePasswordCheck(input_password, check_password)) {
            setPasswordNotMatchError("Passwords do not match. Please Try again.")
            setPasswordNoteVisible(!passwordNoteVisible);
            hasError = true;
        }

        if (hasError) {
            setIsLoading(false);
            return;
        }

        setPasswordNotMatchError('');
        setEmailErrorMessage('');
        setPassErrorMessage('');
        setDisplayNameErrorMessage('');


        let signup_form = new FormData()
        signup_form.append("displayname", input_displayname)
        signup_form.append("email", input_email)
        signup_form.append("password", input_password)
        
        //console.log(input_displayname, input_email, input_password)
        fetch(window.location.origin + "/register", {
            method: 'POST',
            body: signup_form
        })
        .then (response => {
            if (response.ok) {
                setSuccessfulLogIn(true);
                console.log("signup response received ", response)
            } else {
                setIsLoading(false);
                console.log("signup error")
            }
        })
    }
    
    //Temporary function for Forgot password button
    const handleForgottenPassword = (event) => {
        event.preventDefault();

        setPasswordMessage("Yo that's crazy dawg, why'd you forget it ¯\\_(ツ)_/¯");
        return;
    }

    //Now this is a real doozy, this function uses a regular expression to ensure that
    //email input follows a certain combination. To successfully pass validation an email must be the following combination:
    // (chars) + (@) + (chars) + (.) + (chars)
    //Not perfect but it's what I managed to figure out. 
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    //RL: Adding validation for password and displayname to be > length 0
    const validatePassword = (password) => {
        return password.length > 0;
    }

    const validateDisplayName = (displayName) => {
        return displayName.length > 0;
    }

  // checks both password fields to confirm they match when user submit reigster form
    const handlePasswordCheck = (input_password, check_password) => {
        return input_password === check_password;
      }

  //Added a password note to give users guidelines on good password creation
  //Inserted extra text box for Register page to confirm password. 
  //added error messages when user tries to login/register with invalid password
  return (
      <div className="loginpage">
        <div className="container">
            <h1 className="h1">SportsCar Spotter 🏎️ 💨</h1>
            
            { isLogIn ? (
                <>
                    <h2 className="h2">Log In</h2>
                    <input type="email" value={input_email} onChange={handleEmailChange} placeholder="Email" />
                    {emailErrorMessage && <div style={{color: 'red'}}>{emailErrorMessage}</div>}
                    <br />
                    <input type="password" value={input_password} onChange={handlePasswordChange} placeholder="Password" />
                    {logInFailureError && <div style={{color: 'red'}}>{logInFailureError}</div>}
                    {passErrorMessage && <div style ={{color: 'red'}}>{passErrorMessage}</div>}
                    <br />
                    <button className="btn" onClick={handleForgottenPassword}>Forgot Password?</button>
                    {passwordMessage && <div style = {{color: 'red'}}>{passwordMessage}</div>}
                    <br />
                    <button className="btn" onClick={handleSubmitLogin}>Log In</button>
                    <p className = "p">
                        Don't have an account? 
                        <button className="btn" onClick={() => handlePageSwitch(false)}>Register</button>
                    </p>
                </>
            ) : (
                <>
                    <h2 className="h2">Register</h2>
                    <input type="text" value={input_displayname} onChange={handleDisplaynameChange} placeholder="Displayname"/>
                    <br />
                    {displayNameErrorMessage && <div style={{color: 'red'}}>{displayNameErrorMessage}</div>}
                    <input type="email" value={input_email} onChange={handleEmailChange} placeholder="Email" />
                    <br />
                    {emailErrorMessage && <div style={{color: 'red'}}>{emailErrorMessage}</div>}
                    {errorMessage && <div style={{color: 'red'}}>{errorMessage}</div>}
                    <input type = {passwordNoteVisible ? "text" : "password"}  value={input_password} onChange={handlePasswordChange} placeholder="Password"/>
                    <br />
                    <input type= {passwordNoteVisible ? "text" : "password"} value={check_password} onChange={handleCheckPasswordChange} placeholder="Confirm Password"/> 
                    <br />
                    <p>
                    {passErrorMessage && <div style={{color: 'red'}}>{passErrorMessage}</div>}
                    {passwordNotMatchError && <div style={{color: 'red'}}>{passwordNotMatchError}</div>}
                    </p>
                    <p className="p" id = "pwdnote" >
                      Password should be: <br />
                      - 8 to 16 characters <br />
                      - use a variety of characters (lowercase, uppercase, numbers, and special characters)  <br />
                      - unique and distinct <br />
                    </p>
                    <br />
                    <button className="btn" onClick={handleSubmitRegister}>Register</button>
                    <p className="p">
                        Already have an account? 
                        <button className="btn" id = "loginbtn" onClick={() => handlePageSwitch(true)}>Log In</button>
                    </p>
                </>
            )}
            {successfulLogIn && (
                <div style = {{color: 'white'}}>
                    <p> Successful Login! Loading homepage now....</p>
                    {isLoading && <img src = {loading} width="25vw" />}
                </div>
            )}
        </div>
      </div>
    );
};
