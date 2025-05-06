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
                <LoadProductOptions movieId={movieId} />
            </div>
            <div className="movie-synopsis">
                <h2>Synopsis</h2>
                <p>{movie?.synopsis || 'To Be Determined'}</p>
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
    const { data: userPurchaseInfoResponse, status } = useQuery(['userActiveMovieOrders', id], async () => {
        return await getUserActiveMoviesOrdered(id);
    }, {
        suspense: true,
        retry: false,
        useErrorBoundary: false,
    });
    console.log("userPurchaseInfoResponse", userPurchaseInfoResponse);
    useEffect(() => {
        console.log("What", status);
        if(status === 'success') {
            if(userPurchaseInfoResponse.ok) {
                const data = userPurchaseInfoResponse.json();
                console.log("Parsed");
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
        }
    }, [status, userPurchaseInfoResponse]);
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