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
        getUserMovieReview,
        handleResponse,
        checkIfUserLogged,
        getLoggedUserName,
        purchaseCart,
        login,
        register,
        logout,
        getCurrentUserOrders,
        searchGenres,
        searchActors,
        searchDirectors,
        searchMovies,
    }

    async function handleResponseRejection(response) {
        if (!response.ok) {
            console.log("Not ok");
            return Promise.reject(response);
            /*return {
                status: response?.status,
                isError: true,
                error: `Request failed with status ${response.status}: ${response.statusText}`,
            };*/
        }
        return response;
    }

    async function handleResponse(response) {
        await handleResponseRejection(response);

        // Parse the response data
        const data = await response.json();
        console.log(data);
        // Return the successful response
        return data;
    }

    async function getAllMovies() {
        return handleResponse(await requests.get('/api/main/movies/search?page=0&size=25'));
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

    async function getCurrentUserCart(page=0, size=1, searchParams) {
        return handleResponse(await requests.getWithAuth(`/api/users/carts?page=${page}&size=${size}${searchParams}`));
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
        return handleResponse(await requests.getWithAuth(`/api/users/current/movie-purchased/actives/${movieId}`));
    }

    async function getUserMovieReview(movieId) {
        return handleResponse(await requests.getWithAuth(`/api/main/movie-reviews/reviews/${movieId}/current-user`));
    }

    async function checkIfUserLogged() {
        return await requests.getWithAuth('/api/users/authenticate');
    }

    async function getLoggedUserName() {
        return handleResponse(await requests.getWithAuth(`/api/users/current`));
    }

    async function purchaseCart() {
        return handleResponseRejection(await requests.postWithAuth(`/api/users/current/orders/place-order`));
    }

    async function login(username, password) {
        return await requests.postWithCookies('/api/users/login', { username, password });
    }

    async function register(username, password, passwordConfirm) {
        return await requests.postWithCookies('/api/users/register', { username, password, passwordConfirm });
    }

    async function logout() {
        return await requests.postWithCookies('/api/users/refresh/logout');
    }

    async function getCurrentUserOrders(page=0, size=1) {
        return handleResponse(await requests.getWithAuth(`/api/users/current/orders?page=${page}&size=${size}`));
    }

    async function searchGenres(name, page=0, size=1) {
        return handleResponse(await requests.get(`/api/main/genres/search?name=${name}&page=${page}&size=${size}`))
            .then(sleeper(3000));
    }

    async function searchActors(name, page=0, size=1) {
        return handleResponse(await requests.get(`/api/main/actors/search?name=${name}&page=${page}&size=${size}`))
            .then(sleeper(3000));
    }

    async function searchDirectors(name, page=0, size=1) {
        return handleResponse(await requests.get(`/api/main/directors/search?name=${name}&page=${page}&size=${size}`))
            .then(sleeper(3000));
    }

    async function searchMovies(page=0, size=1, searchParams) {
        return handleResponse(await requests.get(`/api/main/movies/search?page=${page}&size=${size}${searchParams}`))
            .then(sleeper(3000));
    }
}