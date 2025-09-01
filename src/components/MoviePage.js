import React, {useState, use, Suspense, useEffect} from 'react';
import { useParams, Link } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import {
    Box,
    Button,
    createTheme,
    Dialog, DialogActions,
    DialogContent, DialogContentText,
    DialogTitle,
    Fade, Skeleton, Stack,
    ThemeProvider,
    Typography
} from "@mui/material";
import { useMutation, useQuery } from 'react-query';
import { ErrorBoundary } from "react-error-boundary";
import { useFetchRequests } from '../http/requests';
import { useApi } from "../http/api";
import 'react-circular-progressbar/dist/styles.css';
import './MoviePage.css';
import {NotFoundErrorBoundary} from "./ApiErrorUtils";
import ColorThief from "colorthief/dist/color-thief";
import { CircularProgressbarWithChildren  } from 'react-circular-progressbar';
import TextField from "@mui/material/TextField";
import {useAuthContext} from "../AuthProvider";
import MuiLink from '@mui/material/Link';

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
    const movieId = movie.id;
    const [isRatingMovie, setIsRatingMovie] = useState(false);

    const handleClickOpen = () => {
        setIsRatingMovie(true);
    };

    const handleClose = () => {
        setIsRatingMovie(false);
    };


    /*
    const [ userMovieReview, setUserMovieReview] = useState(null);
    useEffect(() => {
        const fetching = async () => {
            try {
                const data = await getUserMovieReview(movieId);
                console.log(data);
                setUserMovieReview(data);
                setUserRating(data?.rating);
                setUserLoggedIn(true);
            } catch (e) {
                setUserLoggedIn(false);
            }
        }
        fetching();
    }, [movieId]);
     */

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
                    paddingLeft: '20px',
                    backgroundImage: 'linear-gradient(to left, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 1))'
                }}>
                    <div className="movie-details">
                        <h1>{movie?.name}</h1>
                        <div className="movie-main-info">
                            {movie?.releaseDate?.length === 3 &&
                                <span>
                                    {movie?.releaseDate[2]}/{movie?.releaseDate[1]}/{movie?.releaseDate[0]}
                                </span>
                            }
                            <span>
                                {movie?.runtime?.formattedText}
                            </span>
                                <div className="movie-rating-circle">
                                    <div className="movie-rating-circle-inner">
                                        <CircularProgressbarWithChildren value={movie?.averageRating} styles={{
                                            path: {
                                                stroke: movie?.averageRating > 65 ? "#21d07a"
                                                    : movie?.averageRating > 30 ? "#d2d531"
                                                        : movie?.averageRating > 0 ? "#db2360"
                                                            : "#d4d4d4"
                                            },

                                            trail: {
                                                stroke: movie?.averageRating > 65 ? "#204529"
                                                    : movie?.averageRating > 30 ? "#423d0f"
                                                        : movie?.averageRating > 0 ? "#571435"
                                                            : "#666666"
                                            }
                                        }}>
                                            {/**/}
                                            <div className="movie-rating">
                                                {movie?.averageRating ?
                                                    <div className="movie-rating-container">
                                                        <text className="rating-number" onClick={(e) => {
                                                            e.preventDefault();
                                                            setIsRatingMovie(!isRatingMovie);
                                                        }}>
                                                            {movie?.averageRating}
                                                        </text>
                                                        <span className="rating-percentage">
                                                                %
                                                            </span>
                                                    </div>
                                                    :
                                                    <div className="movie-rating-container">
                                                        <text className="rating-number" onClick={(e) => {
                                                            e.preventDefault();
                                                            setIsRatingMovie(false);
                                                        }}>
                                                            N/A
                                                        </text>
                                                    </div>
                                                }
                                            </div>
                                            {/**/}
                                        </CircularProgressbarWithChildren>
                                </div>
                                <UserMovieRating movieId={movieId} isRatingMovie={isRatingMovie} handleClose={handleClose} />
                            </div>
                        </div>
                        <p>{movie?.synopsis || 'To Be Determined'}</p>
                        <LoadProductOptions movieId={movieId} />
                    </div>
                </div>
            </div>
            <div className="movie-page-content">
                <div className="movie-cast">
                    <h2>Directors</h2>
                    <Suspense fallback={<CastListSkeleton/>}>
                        <DirectorList id={movieId} />
                    </Suspense>
                    <h2>Actors</h2>
                    <Suspense fallback={<CastListSkeleton/>}>
                        <ActorList id={movieId} />
                    </Suspense>
                </div>
                <div className="movie-reviews">
                    <Link to="./reviews">
                        <h2>Reviews</h2>
                    </Link>
                </div>
            </div>
        </div>
    );
};

const UserMovieRating = ({ movieId, isRatingMovie, handleClose }) => {
    const { getUserMovieReview } = useApi();
    const requests = useFetchRequests();
    const [userRating , setUserRating] = useState(null);
    const [userRatingError, setUserRatingError] = useState('');
    const [message, setMessage] = useState('');
    const [openAlert, setOpenAlert] = useState(false);
    const [severity, setSeverity] = useState('info');
    const {isLogged} = useAuthContext();

    useEffect(() => {
        const fetching = async () => {
            if(isLogged) try {
                const data = await getUserMovieReview(movieId);
                console.log(data);
                setUserRating(data?.rating);
            } catch (e) {
                setUserRating("");
            }
        }
        setUserRatingError("");
        fetching();
    }, [isRatingMovie]);

    const { mutate: addUserRatingRequest } = useMutation({
        mutationFn: async ({ rating }) => {
            return await requests.postWithAuth(`/api/main/movie-reviews/ratings/${movieId}/current-user`,
                { rating });
        },
        onSuccess: async (response) => {
            console.log(response);
            if (response.ok) {
                setMessage("Updated Successfully");
                const msg = await response.text();
                setSeverity("success");
                setMessage(msg);
                setOpenAlert(true);
            }
            else {
                if(response.status === 400) {
                    // problem with input fields
                    const vals = await response.json();
                    if(vals?.fields) {
                        if(vals.fields.rating) {
                            setUserRatingError(vals.fields.rating);
                        }
                    }
                }
                else if(response.status === 404) {
                    //movie not found
                    const err = await response.text();
                    setMessage("Problem finding movie");
                    setSeverity("error");
                }
                else if(response.status === 401) {
                    throw response;
                }
            }
        },
        useErrorBoundary: true,
        throwOnError: true,
    });

    const addUserRating = async (e, rating) => {
        e.preventDefault();
        const response = await addUserRatingRequest({ rating });
    };

    return (
        <Dialog
            open={isRatingMovie}
            onClose={handleClose}
            slotProps={{
                paper: {
                    component: 'form',
                    onSubmit: (event) => {
                        event.preventDefault();
                        handleClose();
                    },
                    sx: { backgroundImage: 'none' },
                },
            }}
        >
            <DialogTitle>Rate Movie</DialogTitle>
            <DialogContent
                sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}
            >
                <DialogContentText>
                    Enter you Rating between 0-100
                </DialogContentText>
                <TextField
                    autoFocus
                    required
                    type="number"
                    value={userRating}
                    autoComplete="off"
                    min={0}
                    max={100}
                    label={"User Rating"}
                    variant="outlined"
                    error={!!userRatingError}
                    helperText={userRatingError ? userRatingError : ""}
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
                        setUserRatingError("");
                        setOpenAlert(false);
                        setMessage("")
                    }}
                />
            </DialogContent>
            <DialogActions sx={{ pb: 3, px: 3 }}>
                <Button onClick={handleClose}>Cancel</Button>
                <Button
                    variant="contained" type="submit"
                    onClick={(e) => {
                        addUserRating(e, userRating);
                    }}
                >
                    Submit Rating
                </Button>
            </DialogActions>
            {openAlert && (
                <Alert severity={severity} sx={{ m: 2 }}>
                    {message}
                </Alert>
            )}
        </Dialog>
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
            <Suspense fallback={
                <div>
                    <Stack direction="row" spacing={1} className="product-options">
                        <Skeleton variant="rectangular" width={"100%"} sx={{ borderRadius: 1}} />
                        <Skeleton variant="rectangular" width={"100%"} sx={{ borderRadius: 1 }} />
                    </Stack>
                    <Fade in={false}>
                        <Alert/>
                    </Fade>
                </div>
            }>
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
        <div>
            <div className="product-options">
                {(isRented || isBought) &&
                    <Button variant="outlined">
                        Watch Movie
                    </Button>
                }
                <ProductPurchaseOptions id={id} isRented={isRented} isBought={isBought} setOpenAlert={setOpenAlert} setMessage={setMessage} setSeverity={setSeverity} />
            </div>
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
        <>
            {!isBought &&
                <Button variant="outlined" className="buy-button" onClick={(e) => addToCart(e, product.id, "buy")}>
                    Buy for: {product?.finalBuyPrice}
                </Button>
            }
            {(!isBought && !isRented) &&
                <Button variant="outlined" className="rent-button" onClick={(e)  => addToCart(e, product.id, "rent")}>
                    Rent for: {product?.finalRentPrice}
                </Button>
            }
        </>
    );
};

const CastListSkeleton = () => {
    return (
        <Stack direction="row" spacing={2} className="movie-cast-list">
            {[...Array(5)].map((_, index) => (
                <Skeleton
                    variant="rectangular"
                    width="150px"
                    height="100%"
                    animation="wave"
                    className="cast-cell"
                    key={index}
                    sx={{ borderRadius: '8px' }}
                />
            ))}
        </Stack>
    );
}

const DirectorList = ({ id }) => {
    const { getDirectorsMovie } = useApi();
    const { data: directors} = useQuery({
        queryKey: ['directors', id],
        queryFn: () => getDirectorsMovie(id),
        suspense: true
    });
    return (
        <Stack direction="row" spacing={2} className="movie-cast-list">
            {directors?.map((actor) => {
                return <CastCell castMember={actor} isActor={false}/>;
            })}
        </Stack>
    );
};

const ActorList = ({ id }) => {
    const { getActorsMovie } = useApi();
    const {data: actors} = useQuery(['actors', id], () => getActorsMovie(id), {
        suspense: true
    });
    return (
        <Stack direction="row" spacing={2} className="movie-cast-list">
            {actors?.map((actor) => {
                return <CastCell castMember={actor} isActor={true}/>;
            })}
        </Stack>
    );
};

const CastCell = ({ castMember, isActor }) => {
    return (
        <div className="cast-cell">
            <Link to={`/person/${castMember?.person?.id}`} className="cell-image-link">
                <img src={castMember?.person?.imagePath} alt={`${castMember?.name} Poster`} />
            </Link>
            <div className="cast-cell-name">
                <MuiLink
                    to={`/person/${castMember?.person?.id}`}
                    className="cast-name"
                    component={Link}
                >
                    {castMember?.person?.name}
                </MuiLink>
                {isActor && <text className="cast-character">{castMember?.roleName}</text>}
            </div>
        </div>
    );
};