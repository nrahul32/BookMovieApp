import { GridList, GridListTile, GridListTileBar } from '@material-ui/core';
import { Rating, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom/cjs/react-router-dom';
import YouTube from 'react-youtube';
import StarBorderIcon from '@material-ui/icons/StarBorder';
import Header from '../../common/header/Header';
import "./Details.css";

const Details = function(props){

    let { id } = useParams();
    let [movie, setMovie] = useState({artists:[], release_date: undefined});
    let [stars, setStars] = useState(0);
    const history = useHistory();
    const [showBookBotton, setShowBookBotton] = useState(false);

    // load the movie details
    const loadDetails = async () => {
        let rawResp = await fetch(`http://localhost:8085/api/v1/movies/${id}`);
        let jsonResp = await rawResp.json();
        if(!jsonResp.artists){
            jsonResp.artists = [];
        }
        setMovie(jsonResp);
        if(jsonResp.status === 'RELEASED'){
            setShowBookBotton(true);
        }
    }

    // generate id
    const getVideoId = (url) => {
        let id='';
        if(url === undefined) return id;

        let index = url.indexOf('?v=');
        if(index>-1){
            id = url.substr(index+3);
        }

        return id;
    }

    // load movie details on initialization
    useEffect(() => {
        loadDetails();
    }, []);

    return (
        <React.Fragment>
            <Header showBook={showBookBotton} movieId={id} />
            <div className='details-container'>

                {/* Back button */}
                <div className='back-button'>
                    <Typography component="span" onClick={() => {history.push(`/`);}}>&lt; Back to Home</Typography>
                </div>
                <div className='movie-detail'>

                    {/* Movie Poster */}
                    <div className='left'>
                        <img src={movie.poster_url} alt={movie.title} />
                    </div>

                    {/* Details Section */}
                    <div className='middle'>
                        <Typography variant="h2" component="div"><b>{movie.title}</b></Typography>
                        <Typography variant="h6" component="div"><b>Genre:</b>&nbsp;{movie.genres}</Typography>
                        <Typography variant="h6" component="div"><b>Duration:</b>&nbsp;{movie.duration}</Typography>
                        <Typography variant="h6" component="div"><b>Release Date:</b>&nbsp;{new Date(movie.release_date).toDateString()}</Typography>
                        <Typography variant="h6" component="div"><b>Rating:</b>&nbsp;{movie.rating}</Typography>
                        <Typography variant="h6" component="div" style={{marginTop: '16px'}}><b>Plot:</b>&nbsp;(<a href={movie.wiki_url}>Wiki Link</a>)&nbsp;{movie.storyline}</Typography>
                        <Typography variant="h6" component="div" style={{marginTop: '16px'}}><b>Trailer:</b></Typography>
                        <YouTube videoId={getVideoId(movie.trailer_url)}  />
                    </div>
                    <div className='right'>

                        {/* Rating */}
                        <div>
                            <Typography variant="h6" component="h6"><b>Rate this movie:</b></Typography>
                        </div>

                        {/* Star display */}
                        <div>
                            <Rating
                                name="simple-controlled"
                                value={stars} precision={1}
                                onChange={(event, newValue) => {
                                    setStars(newValue);
                                }}
                                emptyIcon={<StarBorderIcon className='star' />}
                                icon={<StarBorderIcon />}
                            />
                        </div>

                        {/* Artist Section */}
                        <div>
                            <Typography variant="h6" component="h6" style={{marginTop: '16px'}}><b>Artists:</b></Typography>
                        </div>
                        <div>
                            <GridList cellHeight={250} rows={1} cols={2} >
                                {
                                    movie.artists.map((artist) => {
                                        return (
                                            <GridListTile key={artist.id}>
                                                <img src={artist.profile_url} alt={artist.first_name + ' ' + artist.last_name} />
                                                <GridListTileBar title={artist.first_name + ' ' + artist.last_name} />
                                            </GridListTile>
                                        )
                                    })
                                }
                            </GridList>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};

export default Details;
