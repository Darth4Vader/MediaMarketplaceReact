import {useFetchRequests} from "./requests";

import { useNavigate } from "react-router-dom";
import {getDataWithAuth} from "./requests";

export function useApi() {
    const requests = useFetchRequests();
    return {
        getAllMovies,
        getMovie,
        getActorsMovie,
        getDirectorsMovie,
        getReviewsOfMovie,
        getCurrentUserCart,
        updateProductInCart,
        getProductOfMovie,
        getUserActiveMoviesOrdered,
        handleResponse,
        checkIfUserLogged
    }

    async function handleResponse(response) {
        if (!response.ok) {
            console.log("Not ok");
            return Promise.reject(response);
            /*return {
                status: response?.status,
                isError: true,
                error: `Request failed with status ${response.status}: ${response.statusText}`,
            };*/
        }

        console.log(response);

        // Parse the response data
        const data = await response.json();
        console.log(data);
        // Return the successful response
        return data;
    }

    async function getAllMovies() {
        return handleResponse(await requests.get('/api/main/movies/'));
    }

    async function getMovie(id) {
        return handleResponse(await requests.get(`/api/main/movies/${id}`));
    }

    async function getActorsMovie(id) {
        return handleResponse(await requests.get(`/api/main/actors?movieId=${id}`));
    }

    async function getDirectorsMovie(id) {
        //return handleResponse(await requests.get(`/api/main/directors?movieId=${id}`));
       /* const response = handleResponse(await requests.get(`/api/main/directors?movieId=${id}`));
        return Promise.delay(3000).then(() => {
            return response;
        });*/
        // for testing. need to remove this and use the above version
        return handleResponse(await requests.get(`/api/main/directors?movieId=${id}`))
            .then(sleeper(3000))
            .catch((err) => {
                console.log("Oh no catched error");
            });
    }

    async function getReviewsOfMovie(id, page=0, size=1) {
        return handleResponse(await requests.get(`/api/main/movie-reviews/reviews/${id}?page=${page}&size=${size}`));
    }

    function sleeper(ms) {
        return function(x) {
            return new Promise(resolve => setTimeout(() => resolve(x), ms));
        };
    }

    async function getCurrentUserCart() {
        return handleResponse(await requests.getWithAuth('/api/users/carts/'));
    }

    async function updateProductInCart(productId, purchaseType) {
        return handleResponse(await requests.putWithAuth(`/api/users/carts/${productId}`, {purchaseType}))
            .then(sleeper(3000))
            .then((data) => {
                console.log("Good Morning")
                return data;})
            ;
    }

    async function getProductOfMovie(movieId) {
        return handleResponse(await requests.get(`/api/main/products?movieId=${movieId}`))
            .then(sleeper(3000))
            /*.catch((err) => {
                console.log("Oh no catched error");
            });*/
    }

    async function getUserActiveMoviesOrdered(movieId) {
        return await requests.getWithAuth(`/api/users/current/movie-purchased/actives/${movieId}`);
        //return handleResponse(await requests.getWithAuth(`/api/users/current/movie-purchased/actives/${movieId}`));
    }

    async function checkIfUserLogged() {
        return await requests.getWithAuth('/api/users/authenticate');
    }
}