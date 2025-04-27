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
        getProductOfMovie
    }

    async function handleResponse(response) {
        if (!response.ok) {
            return {
                status: response?.status,
                isError: true,
                error: `Request failed with status ${response.status}: ${response.statusText}`,
            };
        }

        // Parse the response data
        const data = await response.json();
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
        return handleResponse(await requests.get(`/api/main/directors?movieId=${id}`));
    }

    async function getReviewsOfMovie(id, page=0, size=1) {
        return handleResponse(await requests.get(`/api/main/movie-reviews/reviews/${id}?page=${page}&size=${size}`));
    }

    async function getCurrentUserCart(navigation) {
        return handleResponse(await requests.getWithAuth('/api/users/carts/', navigation));
    }

    async function updateProductInCart(navigation) {
        return handleResponse(await requests.putWithAuth('/api/users/carts/', navigation));
    }

    async function getProductOfMovie(movieId) {
        return handleResponse(await requests.get(`/api/main/products?movieId=${movieId}`));
    }
}