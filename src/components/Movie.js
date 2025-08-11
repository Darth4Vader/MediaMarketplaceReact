import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import './Movie.css'
import {useFadeInOnScroll} from "./UtilsComponents";
import  './HelpfulStyles.css'

/**
 * MovieCell displays a movie's poster and title inside a vertically aligned box.
 * It handles click events to navigate to the detailed movie page.
 *
 * Props:
 * - movie: { name: string, posterPath: string }
 * - onClick: function to handle cell click (e.g., navigate to movie page)
 */

function MovieCell({ movie }) {
    const navigate = useNavigate();
    const { isVisible, elementRef } = useFadeInOnScroll();

    const handleClick = () => {
        if (movie) {
            navigate(`/movie/${movie.id}`);
        }
    };

    return (
        <div
            className={`fade-in ${isVisible ? 'visible' : ''}`}
            ref={elementRef}
        >
            <div className="glow-background">
                <div className="movie-cell">
                    <img
                        src={movie?.posterPath || ''}
                        alt={movie?.name || 'Movie Poster'}
                        style={{
                            height: '100%', // You could also make this responsive to parent size with CSS
                            width: '100%',
                        }}
                        onClick={handleClick}
                    />
                    <div
                         style={{
                             display: 'flex',
                             alignItems: 'center',
                             width: '100%',
                             height: '10%',
                             cursor: 'default',
                             position: 'absolute',
                             bottom: '0px',
                             backgroundColor: 'rgba(255, 255, 255, 0.8)', // Semi-transparent white background
                             containerType: 'inline-size',
                         }}
                    >
                        <p style={{
                            textAlign: 'center',
                            wordWrap: 'break-word',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            width: '100%',
                            textOverflow: 'ellipsis',
                            cursor: 'default',
                            fontSize: '10cqw',
                            color: 'black',
                        }}>
                            {movie?.name || ''}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default MovieCell;