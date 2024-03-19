

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import Search from "../images/search.png";
import Filter  from "../images/filter.png";
import NavBar from '../components/NavBar';
import heart from '../images/heart.png';
//Le Duong, installed react infinite scroll dependency in frontend node_modules folder, might need to install locally
import InfiniteScroll from 'react-infinite-scroll-component';



// Overall Main/Home page
export default function HomePage() {
    const navigate = useNavigate()


    // Initializing a state variable 'postData' using useState hook with an empty array as initial state.
    const [postData, setPostData] = useState([])
    // this below version is about appropriate for debug
    // const [postData, setPostData] = useState([
    //     {
    //         poster_displayname: "?displayname",
    //         poster_pfp: 1,
    //         post_image: "",
    //         car_model: "?model",
    //         car_make: "?make",
    //         car_details: "?details",
    //         car_start_year: "?0",
    //         car_end_year: "?1970",
    //         post_uuid: "?uuid",
    //         post_timestamp: Date(),
    //         post_likes: -1,
    //         post_location: ["State", "County", "Place"]
    //     }
    // ]);
    const [page, setPage] = useState(1); // State for tracking current page
    const [hasMore, setHasMore] = useState(true); // State for indicating whether there is more data to fetch

      // Async function to fetch data from the specified endpoint.
    const fetchData = async () => {
      try {
        // Fetching data from the provided API endpoint.
        const response = await fetch(window.location.origin + '/feed');

        // Checking if the response is okay, if not, logging a network error and throwing an error.
        if (!response.ok) {
          console.log("network error")
          throw new Error('Failed to fetch data');
        }

        // Parsing the response data to JSON format.
        const jsonData = await response.json();

        for (const element of jsonData) {
            element.post_timestamp = new Date(element.post_timestamp)
        }

        // Updating the 'postData' state with the fetched JSON data.
        setPostData(prevData => [...prevData, ...jsonData]); //concatenantes prevData with new data (jsonData)
        setPage(page + 1); //increments page to load new set of posts when scrolling
        setHasMore(jsonData.length > 0); //checks if there is more posts to fetch and populate on main feed
        //otherwise, hasMore will be set to false meaning no new posts can be fetched
      } catch (error) {
        // Catching any errors that occur during the fetch process and logging them.
        console.error('Error fetching data', error);
      };
    
    }
  
    // useEffect hook to perform side effects like data fetching when the component mounts.
    useEffect(() => {
      fetchData(); // Fetch initial data on component mount
    }, []); // Empty dependency array ensures that this effect runs only once after the initial render.


    //the main return to display the home page or main feed
    return (
      <div className="homeContainer">
        <div>
          <h1 style={{color: 'red'}}>Sportscar Spotter</h1> {/* HomePage Title */}
        <div className="searchPad">
          <img src={Filter} alt="Filter" /> {/* Filter icon */}
          <p> Filters:</p>
          
          <button onClick={() => {navigate('/search')}}><img src={Search} alt="Search"/></button> {/* Search Button */}
        </div>
        <InfiniteScroll
            dataLength={postData.length} // Number of items
            next={fetchData} // Function to call when scrolling reaches the bottom
            hasMore={hasMore} // Indicate whether there is more data to fetch
            loader={<h4>Loading...</h4>} // Loading indicator
            endMessage={<p>No more posts</p>} // Message when all data is fetched
        >  
            <ul className="content">
                {postData.map((post, index) => (    
                <li className="post" key={index}>
                    <div>
                        <p>
                            <img className="postPfp" src={window.location.origin + '/pfp/' + post.poster_pfp} alt={post.poster_displayname} /> {/* Displaying Poster's Profile Picture */} 
                            {post.poster_displayname}
                        </p> {/* Displaying Poster Username */}
                        <p> {post.post_location && post.post_location.join(" • ")} </p>
                    </div>
                    <div className="cardHeader">
                        <img src={post.make_icon} alt={post.car_make} /> {/* Display Car Brand Icon/Logo */}
                        <h2>
                        {
                        post.car_make + ' ' +
                        post.car_model + ' ' +
                        post.car_start_year + '-' + post.car_end_year
                        }
                        </h2> {/* Display Car's Name (Year/Make/Model) */}
                    </div>
                    <div className="main">
                        <div className="imageContainer">
                            {/*<img src={post.icon} alt={post.name} />*/} {/* Redisplay Car Brand Icon/Logo */}
                            <img src={'data:image/jpg;base64,' + post.post_image} alt={post.car_model} className='postImage'/> {/* Display Car Image */}
                        </div>
                        <div>
                            <p>
                                {post.post_timestamp.toLocaleString(
                                    'default', 
                                    { year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: '2-digit', hour12: true }
                                )}
                            </p>
                            
                            <img src={heart} alt={post.post_likes} className='likeImage'/> {/* Display Number of Likes on Post */}
                            <span className='whiteFont'>{post.post_likes}</span>
                            <p>{post.car_details}</p> {/* Display Car Details */}
                            <p>{post.post_uuid}</p>
                        </div>
                    </div>
                </li>
                ))}

                {/* !hasMore && <li> nothing more to show </li> */}
            </ul>
        </InfiniteScroll> 
        <button onClick={() => {navigate("/")}}>Go to Test Page</button>
        </div>
        <NavBar/>
      </div>
      
    );
  }