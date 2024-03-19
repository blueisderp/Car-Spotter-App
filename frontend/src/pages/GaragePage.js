import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

import './HomePage.css';
import './GaragePage.css';

import NavBar from '../components/NavBar';
import BackButton from '../components/BackButton';

//This function handles all garage pages, a user viewing their own or anyone else's page
export default function Garage() {
    const navigate = useNavigate();
    const location = useLocation();
    const {profile} = useParams();
    //console.log('garage page loaded for profile:', profile)

    // If profile is undefined, view your own page
    // Otherwise, profile should be a valid displayname to view
    const is_self = profile === undefined;
    const [followers, setFollowers] = useState(-1)
    const [following, setFollowing] = useState(-1)
    const [catches, setCatches] = useState(-1)
    const [followStatus, setFollowStatus] = useState('')
    const [displayname, setDisplayname] = useState('')
    const [pfpId, setPfpId] = useState(1)

    //Brian helped work on this function to fetch data from the database
    const fetchData = async () => {
        try {
            const query_destination = window.location.origin + '/garage' + (is_self ? '' : '/' + profile)
            //console.log("about to get @: ", query_destination)
            const response = await fetch(query_destination);
            if (!response.ok) {
                console.log("network error")
                throw new Error('Network response was not ok');
            }
            const jsonData = await response.json();
            //console.log(jsonData)
            
            //The following 5 lines put the data from the Fetch response into React states
            setFollowers(jsonData["followers"])
            setFollowing(jsonData["following"])
            setFollowStatus(jsonData["follow_status"])
            setCatches(jsonData["catches"])
            setDisplayname(jsonData["displayname"])
            setPfpId(jsonData["pfp_id"])
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        //GET INFORMATION ON THE PAGE WHEN THE PAGE LOADS
        //This functions dependencies is [profile] so it runs whenever we view a new profile and that displayname 
        //      is passed into the url (see app.js route for this component)
        //I CHANGED THIS FROM DEPENDENCY ARRAY FROM [] TO FIX NO-REFRESH BUG WHEN COMING FROM OTHER PAGES, SAY FROM SEARCH
        //      so if stuff breaks maybe learn how this is supposed to work.
        //console.log(is_self, profile, profile===null)
        fetchData();
    }, [profile]);

    function renderFollowButton(status) {
        switch(String(status)) {
            case "self":
                return <button className="sbtn" onClick={() => {navigate("/bug-report")}}>Report Bug / Make Suggestion</button>
            case "following":
                return <div>
                    <button onClick={() => {unfollow()}}>
                        Unfollow
                    </button>
                </div>
            case "stranger":
                return <div>
                    <button onClick={() => {follow()}}>
                        Follow
                    </button>
                </div>
        }
    }

    async function follow() {
        try {
            const query_destination = window.location.origin + '/user_function/follow/' + profile
            console.log("about to post @: ", query_destination)
            const response = await fetch(query_destination, {method: 'POST'});
            if (!response.ok) {
                console.log("network error")
                throw new Error('Network response was not ok');
            }

            fetchData()
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }
    async function unfollow() {
        try {
            const query_destination = window.location.origin + '/user_function/unfollow/' + profile
            console.log("about to post @: ", query_destination)
            const response = await fetch(query_destination, {method: 'POST'});
            if (!response.ok) {
                console.log("network error")
                throw new Error('Network response was not ok');
            }

            fetchData()
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    const renderBackButton = () => {
        if (location.state !== null && location.state !== undefined) {
            if (location.state.enable_back_button) {
                return <BackButton enableBackButton={true} />
            } 
        }
    }

    return (
        <div>
            {renderBackButton()}

            <div className="garageContainer">
            <div className="userInfo">
                <div className="userProfile">
                    <img src={window.location.origin + '/pfp/' + pfpId} />
                    <div className="displayname">{displayname}</div>
                </div>
                <div className="userStats">
                    <div className="userStatsItem">
                        <div>Followers</div>
                        <button className="userStatsItem" onClick={() => {
                            navigate('/relations', {state: {relations: "followers", owner: displayname}})
                        }}>{followers}</button>
                    </div>
                    <div className="userStatsItem">
                        <div>Following</div>
                        <button className="userStatsItem"  onClick={() => {
                            navigate('/relations', {state: {relations: "following", owner: displayname}})
                        }}>{following}</button>
                    </div>
                    <div className="userStatsItem">
                        <div>Catches</div>
                        <p className="userStatsItem" >{catches}</p>
                    </div>
                </div>
            </div>

            {renderFollowButton(followStatus)}

            <div className="carViewOptions">
                <button className="carbtn">Grid View</button>
                <button className="carbtn">List View</button>
            </div>
            <div className="carGrid">
                {/* Car brand logos will be rendered here */}
                {/* <div className="carItem">
                    <img src = {AcuraLogo}/> Find new Acura Logo, cause this shit is brocken
                </div> */}
                <div className="carItem">
                    <img src={window.location.origin + "/pfp/50"}/>
                </div>
                <div className="carItem">
                    <img src={window.location.origin + "/pfp/2"}/>
                </div>
                <div className="carItem">
                    <img src={window.location.origin + "/pfp/3"}/>
                </div>
                <div className="carItem">
                    <img src={window.location.origin + "/pfp/4"}/>
                </div>
                <div className="carItem">
                    <img src={window.location.origin + "/pfp/5"}/>
                </div>
                <div className="carItem">
                    <img src={window.location.origin + "/pfp/6"}/>
                </div>
                <div className="carItem">
                    <img src={window.location.origin + "/pfp/70"}/>
                </div>
                <div className="carItem">
                    <img src={window.location.origin + "/pfp/28"}/>
                </div>
                <div className="carItem">
                    <img src={window.location.origin + "/pfp/30"}/>
                </div>
                {/* Add more car items as needed */}
            </div>
            {/* Or, for list view */}
            {/* <ul className="carList">
                <li>Car Brand 1</li>
                <li>Car Brand 2</li>
                <li>Car Brand 3</li>
                // Add more list items as needed
            </ul> */}
            
            <button onClick={() => {navigate('/');}}>Go to Test Page</button>
            <br/><br/><br/><p><br/><br/><br/></p><br/><br/><br/>
        </div>
        <NavBar/>
        </div>
        
    );
}
