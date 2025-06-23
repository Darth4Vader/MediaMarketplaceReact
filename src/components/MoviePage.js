import {useState, use, Suspense, useEffect} from 'react';
import { useParams, Link } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import { Fade } from "@mui/material";
import { useMutation, useQuery } from 'react-query';
import { ErrorBoundary } from "react-error-boundary";
import { useFetchRequests } from '../http/requests';
import { useApi } from "../http/api";
import './MoviePage.css';
import {NotFoundErrorBoundary} from "./ApiErrorUtils";
import ColorThief from "colorthief/dist/color-thief";
import { CircularProgressbarWithChildren  } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

export default function LoadMoviePage() {
    const { getMovie } = useApi();
    const { id } = useParams();
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <MoviePage moviePromise={getMovie(id)} />
        </Suspense>
    );
}

const MoviePage = ({ moviePromise}) => {
    const movie = use(moviePromise);
    const [ userMovieReview, setUserMovieReview] = useState(null);
    const movieId = movie.id;
    const [color, setColor] = useState([0,0,0]);
    useEffect(() => {
        const img = new Image();
        img.src = movie?.posterPath;
        img.crossOrigin = 'Anonymous'; // Ensure the image can be accessed
        img.onload = () => {
            const colorThief = new ColorThief();
            const dominantColor = colorThief.getColor(img);
            setColor(dominantColor);
        };
    }, [movie?.posterPath]);
    return (
        <div className="movie-page">
            <div style={{
                backgroundImage: `url(${movie?.backdropPath})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                width: '100%',
            }}>
                <div className="movie-header" style={{
                    backgroundImage: `linear-gradient(to right, rgba(${color[0]}, ${color[1]}, ${color[2]}, 1), rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.84) 50%, rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.84) 100%)`
                }}>
                    <img src={movie?.posterPath} alt={`${movie?.name} Poster`} className="movie-poster" />
                    <div className="movie-details">
                        <h1>{movie?.name} ({movie?.year})</h1>
                        <div className="movie-main-info">
                            {movie?.releaseDate?.length === 3 &&
                                <span>
                                    {movie?.releaseDate[2]}/{movie?.releaseDate[1]}/{movie?.releaseDate[0]}
                                </span>
                            }
                            <span>
                                {movie?.runtime?.formattedText}
                            </span>
                        </div>
                        {movie?.averageRating ?
                            <div>
                                <strong>Rating:</strong>
                                <div className="movie-rating-circle">
                                    <CircularProgressbarWithChildren value={movie?.averageRating}>
                                        <div className="movie-rating">
                                            <div className="movie-rating-container">
                                                {movie?.averageRating}
                                                <span className="rating-percentage">
                                                    %
                                                </span>
                                            </div>
                                        </div>
                                    </CircularProgressbarWithChildren>
                                </div>
                            </div>
                            : <p> Not yet Rated </p>
                        }
                        <UserMovieRating movieId={movieId} setUserMovieReview={setUserMovieReview} userMovieReview={userMovieReview} />
                        <div className="movie-synopsis">
                            <h2>Synopsis</h2>
                            <p>{movie?.synopsis || 'To Be Determined'}</p>
                        </div>
                    </div>
                    <LoadProductOptions movieId={movieId} />
                </div>
            </div>
            <div className="movie-cast">
                <h2>Directors</h2>
                <Suspense fallback={<div>Loading Directors...</div>}>
                    <DirectorList id={movieId} />
                </Suspense>
                <h2>Actors</h2>
                <Suspense fallback={<div>Loading Actors...</div>}>
                    <ActorList id={movieId} />
                </Suspense>
            </div>
            <div className="movie-reviews">
                <Link to="./reviews">
                    <h2>Reviews</h2>
                </Link>
            </div>
        </div>
    );
};

const UserMovieRating = ({ movieId, userMovieReview, setUserMovieReview }) => {
    const { getUserMovieReview } = useApi();
    const requests = useFetchRequests();
    const [userLoggedIn, setUserLoggedIn] = useState(false);
    const [userRating , setUserRating] = useState(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetching = async () => {
            try {
                const data = await getUserMovieReview(movieId);
                console.log(data);
                setUserMovieReview(data);
                setUserLoggedIn(true);
            } catch (e) {
                setUserLoggedIn(false);
            }
        }
        fetching();
    }, [movieId]);

    const { mutate: addUserRatingRequest } = useMutation({
        mutationFn: async ({ rating }) => {
            return await requests.postWithAuth(`/api/main/movie-reviews/ratings/${movieId}/current-user`,
                { rating });
        },
        onSuccess: async (response) => {
            console.log(response);
            if (response.ok) {
                setMessage("Updated Successfully");
            }
            else {
                if( response.status === 401) {
                    throw response;
                }
                //setMessage(await response.text());
            }
        },
        useErrorBoundary: true,
        throwOnError: true,
    });

    const addToCart = async (e, rating) => {
        e.preventDefault();
        const response = await addUserRatingRequest({ rating });
    };

    console.log("Hello", userMovieReview);

    return (
        <div className="user-movie-rating">
            {userMovieReview?.rating ? (
                <p>Your Rating: {userMovieReview?.rating}/100</p>
            ) : (
                <>
                    <p>Rate Movie: </p>
                    <input
                        type="number"
                        min={0}
                        max={100}
                        value={userRating}
                        onKeyDown={(e) => {
                            // prevent the user from entering scientific notation
                            // regex pattern for only numbers
                            const regex = /^[0-9]*$/;
                            if (!regex.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete'
                            && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key != "ArrowUp" && e.key != "ArrowDown") {
                                e.preventDefault();
                            }
                        }}
                        onChange={(e) => {
                            // replace with regex the caracters "e", "E", "+", "-"
                            // to prevent the user from entering scientific notation
                            const value = e.target.value;
                            console.log(value);
                            if (value < 0) {
                                setUserRating(0);
                            } else if (value > 100) {
                                setUserRating(100);
                            } else {
                                setUserRating(value);
                            }
                        }}
                    />
                    <button onClick={(e) => {
                        addToCart(e, userRating);
                    }}>
                        Submit Rating
                    </button>
                </>
            )}
        </div>
    );
}

const LoadProductOptions = ({ movieId }) => {
    return (
        <NotFoundErrorBoundary fallbackRender={({ error, resetErrorBoundary }) => {
            return (
                <div className="product-missing">
                    <p>Movie Not Available to Purchase</p>
                </div>
            );
        }}>
            <Suspense fallback={<div>Loading Product Information...</div>}>
                <ProductOptions id={movieId} />
            </Suspense>
        </NotFoundErrorBoundary>
    );
}

const ProductOptions = ({ id }) => {
    const { getUserActiveMoviesOrdered } = useApi();
    const [openAlert, setOpenAlert] = useState(false);
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState('info');
    const [isRented, setIsRented] = useState(false);
    const [isBought, setIsBought] = useState(false);
    useEffect(() => {
        const fetching = async () => {
            try {
                const data = await getUserActiveMoviesOrdered(id);
                console.log(data);
                if (data?.activePurchases?.length > 0) {
                    data?.activePurchases?.forEach(purchaseInfo => {
                        console.log(purchaseInfo);
                        if (purchaseInfo?.isRented === true) {
                            setIsRented(true);
                        } else if (purchaseInfo?.isRented === false) {
                            setIsBought(true);
                        }
                    });
                }
            }
            catch (e) {}
        }
        fetching();
    }, []);

    const closeAlert = () => {
        setOpenAlert(false);
    };
    return (
        <div className="product-options">
                <Fade
                    in={openAlert}
                    //timeout={{ enter: 500, exit: 200 }}
                    timeout={1000}
                    addEndListener={() => {
                        setTimeout(() => {
                            setOpenAlert(false)
                        }, 1000);
                    }}
                    >
                    <Alert severity={severity} onClose={closeAlert} >{message}</Alert>
                </Fade>

            {(isRented || isBought) &&
                <button>
                    Watch Movie
                </button>
            }
            <ProductPurchaseOptions id={id} isRented={isRented} isBought={isBought} setOpenAlert={setOpenAlert} setMessage={setMessage} setSeverity={setSeverity} />
        </div>
    );
};

const ProductPurchaseOptions = ({ id, isRented, isBought, setOpenAlert, setMessage, setSeverity }) => {
    const requests = useFetchRequests();
    const { getProductOfMovie } = useApi();
    const { data: product } = useQuery(['product', id], () => getProductOfMovie(id), {
        suspense: true,
        retry: false,
        //cacheTime: 1,
    });
    const { mutate: addToCarRequest } = useMutation({
        mutationFn: async ({productId, purchaseType}) => {
            return await requests.postWithAuth('/api/users/carts/',
                {productId, purchaseType});
        },
        onSuccess: async (response) => {
            setOpenAlert(true);
            console.log(response);
            if (!response.ok) {
                setMessage(await response.text());
                setSeverity('error');
            } else {
                setMessage("Added Successfully");
                setSeverity('success');
            }
        },
        useErrorBoundary: true,
        throwOnError: true,
    });
    const addToCart = async (e, productId, purchaseType) => {
        e.preventDefault();
        const response = await addToCarRequest({productId, purchaseType});
    };
    console.log(isRented);
    console.log(isBought);
    return (
        <div className="product-options">
            {!isBought &&
                <button className="buy-button" onClick={(e) => addToCart(e, product.id, "buy")}>
                    Buy for: {product?.finalBuyPrice}
                </button>
            }
            {(!isBought && !isRented) &&
                <button className="rent-button" onClick={(e)  => addToCart(e, product.id, "rent")}>
                    Rent for: {product?.finalRentPrice}
                </button>
            }
        </div>
    );
};

const DirectorList = ({ id }) => {
    const { getDirectorsMovie } = useApi();
    const { data: directors} = useQuery({
        queryKey: ['directors', id],
        queryFn: () => getDirectorsMovie(id),
        suspense: true
    });
    return (
        <ol>
            {directors?.map((director) => {
                return <DirectorCell castMember={director}/>;
            })}
        </ol>
    );
};

const ActorList = ({ id }) => {
    const { getActorsMovie } = useApi();
    const {data: actors} = useQuery(['actors', id], () => getActorsMovie(id), {
        suspense: true
    });
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