import "./RenderUserList.css"

import { useNavigate } from 'react-router-dom';
import DefaultProfilePicture from '../images/DefaultProfilePicture.png';

// this component takes a state thats a list of objects. each object is a user with profile picture and displayname
//    this is to be used in at least 3 locations: search, followers, following. it's useful to keep them styled similarly

export default function RenderUserList({users}) {
    const navigate = useNavigate();
    return <div>
        <ul className='unorderedUserList'>
            {users.map((user, index) => (
                <li key={index}>
                <button className='userButtonLink' onClick={() => navigate( '/garage/' + user["displayname"], {state: {enable_back_button: true}} )}>
                        <img src={window.location.origin + '/pfp/' + user["pfp_id"]} alt="Profile"/> {user["displayname"]}
                    </button>
                </li>
            ))}
        </ul>
    </div>
}
