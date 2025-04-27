import React, {useState, useEffect, use, Suspense} from 'react';
import {postDataWithAuth} from '../http/requests';
import MovieGrid from "./MovieGrid";
import { useParams, Link } from 'react-router-dom';
import AppBar from "./AppBar";
import {getMovie, getActorsMovie, getDirectorsMovie, getReviewsOfMovie, getProductOfMovie} from "../http/api";
import Alert from '@mui/material/Alert';
import './MoviePage.css';
import {useNavigate} from 'react-router-dom';
import {Snackbar} from "@mui/material";

export default function LoadMoviePage() {
    const { id } = useParams();
    console.log(id);
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <MoviePage moviePromise={getMovie(id)} />
        </Suspense>
    );
}

const MoviePage = ({ moviePromise }) => {
    const movie = use(moviePromise);
    const navigation = useNavigate();
    return (
        <div className="movie-page">
            <div className="movie-header">
                <img src={movie?.posterPath} alt={`${movie?.name} Poster`} className="movie-poster" />
                <div className="movie-details">
                    <h1>{movie?.name}</h1>
                    <p><strong>Year:</strong> {movie?.year}</p>
                    <p><strong>Runtime:</strong> {movie?.runtime} minutes</p>
                    <p><strong>Rating:</strong> {movie?.rating}/100</p>
                </div>
                <Suspense fallback={<div>Loading Product Information...</div>}>
                    <ProductOptions productPromise={getProductOfMovie(movie.id, navigation)}/>
                </Suspense>
            </div>
            <div className="movie-synopsis">
                <h2>Synopsis</h2>
                <p>{movie?.synopsis || 'To Be Determined'}</p>
            </div>
            <div className="movie-cast">
                <h2>Directors</h2>
                <Suspense fallback={<div>Loading Directors...</div>}>
                    <DirectorList directorsPromise={getDirectorsMovie(movie.id)} />
                </Suspense>
                <h2>Actors</h2>
                <Suspense fallback={<div>Loading Actors...</div>}>
                    <ActorList actorsPromise={getActorsMovie(movie.id)} />
                </Suspense>
            </div>
            <div className="movie-reviews">
                <Link to="./reviews">
                    <h2>Reviews</h2>
                </Link>
                <Suspense fallback={<div>Loading Reviews...</div>}>
                    <PagesList pagePromise={getReviewsOfMovie(movie.id)} />
                </Suspense>
            </div>
        </div>
    );
};

const ProductOptions = ({ productPromise, navigation }) => {
    const [error, setError] = useState("");
    const product = use(productPromise);

    const addToCart = async (e, productId, purchaseType) => {
        e.preventDefault();
        const response = await postDataWithAuth('/api/users/carts/',
            JSON.stringify({productId, purchaseType}), navigation);
        console.log("Add to Cart");
        console.log(response);
        if (!response.ok) {
            setError(await response.text());
        }
        else {
            console.log("Added Successfully");
        }
    };

    const closeAlert = () => {
        setError("");
    };

    return (
        <div className="product-options">
            {error &&
                //<Snackbar open={error}>
                    <Alert severity="error" onClose={closeAlert}>{error}</Alert>
                //</Snackbar>
            }
            <button className="buy-button" onClick={(e) => addToCart(e, product.id, "buy")}>Buy for: {product?.finalBuyPrice}</button>
            <button className="rent-button" onClick={(e)  => addToCart(e, product.id, "rent")}>Rent for: {product?.finalRentPrice}</button>
        </div>
    );
};

function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

const ReviewsList = ({ reviewsPromise }) => {
    const reviews = use(reviewsPromise);
    console.log(reviews);
    return reviews?.content?.length > 0 ? (
                reviews?.content?.map((review) => (
                    <div key={review.id} className="review">
                        <h3>{review.title}</h3>
                        <p>{review.content}</p>
                        <p><strong>Rating:</strong> {review.rating}/100</p>
                    </div>
                ))
            ) : (
                <p>No reviews yet.</p>
            );
};

const DirectorList = ({ directorsPromise }) => {
    console.log(directorsPromise);
    const directors = use(directorsPromise);
    return (
        <ol>
            {directors?.map((director) => {
                return <DirectorCell castMember={director}/>;
            })}
        </ol>
    );
};

const ActorList = ({ actorsPromise }) => {
    console.log(actorsPromise);
    const actors = use(actorsPromise);
    return (
        <ol>
            {actors?.map((actor) => {
                return <ActorCell castMember={actor}/>;
            })}
        </ol>
    );
};

const ActorCell = ({ castMember }) => {
    return (
        <li key={castMember.id} className="cast-cell">
            <img src={castMember?.person?.imagePath} alt={`${castMember?.name} Poster`} />
            <div>
                <p>{castMember?.person?.name}</p>
                <p>{castMember?.roleName}</p>
            </div>
        </li>
    );
};

const DirectorCell = ({ castMember }) => {
    return (
        <li key={castMember.id} className="cast-cell">
            <img src={castMember?.person?.imagePath} alt={`${castMember?.name} Poster`} />
            <div>
                <p>{castMember?.person?.name}</p>
            </div>
        </li>
    );
};


export function LoadReviewsPage() {
    const { id } = useParams();
    console.log(id);
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AppBar />
            <MoviePage moviePromise={getReviewsOfMovie(id)} />
        </Suspense>
    );
}

const ReviewsPage = ({ reviewsPromise }) => {
    //const movie = use(reviewsPromise);
    return (
        /*
        <div className="movie-page">
            <div className="movie-header">
                <img src={movie?.posterPath} alt={`${movie?.name} Poster`} className="movie-poster" />
                <div className="movie-details">
                    <h1>{movie?.name}</h1>
                    <p><strong>Year:</strong> {movie?.year}</p>
                    <p><strong>Runtime:</strong> {movie?.runtime} minutes</p>
                    <p><strong>Rating:</strong> {movie?.rating}/100</p>
                </div>
            </div>
            <div className="movie-synopsis">
                <h2>Synopsis</h2>
                <p>{movie?.synopsis || 'To Be Determined'}</p>
            </div>
            <div className="movie-cast">
                <h2>Directors</h2>
                <Suspense fallback={<div>Loading Directors...</div>}>
                    <DirectorList directorsPromise={getDirectorsMovie(movie.id)} />
                </Suspense>
                <h2>Actors</h2>
                <Suspense fallback={<div>Loading Actors...</div>}>
                    <ActorList actorsPromise={getActorsMovie(movie.id)} />
                </Suspense>
            </div>
            <div className="movie-reviews">
                <h2>Reviews</h2>
                <Suspense fallback={<div>Loading Reviews...</div>}>
                    <ReviewsList reviewsPromise={getReviewsOfMovie(movie.id)} />
                </Suspense>
            </div>
        </div>

         */
        <PagesList pagePromise={reviewsPromise}/>

    );
};

const PagesList = ({ pagePromise }) => {
    const pageResult = use(pagePromise);
    console.log(pageResult);
    return (
        <div>
            {!pageResult?.first ? (
                <div>
                    <a>1</a>
                    <a>Previous</a>
                </div>
            ) : null}
            <a>{pageResult?.number != null ? pageResult.number+1 : null}</a>
            {!pageResult?.last ? (
                <div>
                    <a>{pageResult?.totalPages}</a>
                    <a>Next</a>
                </div>
            ) : null}
        </div>
        /*
        <div className="movie-page">
            <div className="movie-header">
                <img src={movie?.posterPath} alt={`${movie?.name} Poster`} className="movie-poster" />
                <div className="movie-details">
                    <h1>{movie?.name}</h1>
                    <p><strong>Year:</strong> {movie?.year}</p>
                    <p><strong>Runtime:</strong> {movie?.runtime} minutes</p>
                    <p><strong>Rating:</strong> {movie?.rating}/100</p>
                </div>
            </div>
            <div className="movie-synopsis">
                <h2>Synopsis</h2>
                <p>{movie?.synopsis || 'To Be Determined'}</p>
            </div>
            <div className="movie-cast">
                <h2>Directors</h2>
                <Suspense fallback={<div>Loading Directors...</div>}>
                    <DirectorList directorsPromise={getDirectorsMovie(movie.id)} />
                </Suspense>
                <h2>Actors</h2>
                <Suspense fallback={<div>Loading Actors...</div>}>
                    <ActorList actorsPromise={getActorsMovie(movie.id)} />
                </Suspense>
            </div>
            <div className="movie-reviews">
                <h2>Reviews</h2>
                <Suspense fallback={<div>Loading Reviews...</div>}>
                    <ReviewsList reviewsPromise={getReviewsOfMovie(movie.id)} />
                </Suspense>
            </div>
        </div>

         */

    );
};

//export default MoviePage;