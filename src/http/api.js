import * as requests from './requests';
import { useNavigate } from "react-router-dom";
import {getDataWithAuth} from "./requests";

export async function getAllMovies(){
    const response = await requests.getData('/api/main/movies/');
    console.log("Response");
    console.log(response);
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

export async function getMovie(id){
    const response = await requests.getData(`/api/main/movies/${id}`);
    console.log("Response");
    console.log(response);
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

export async function getActorsMovie(id){
    const response = await requests.getData(`/api/main/actors?movieId=${id}`);
    console.log("Response");
    console.log(response);
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

export async function getDirectorsMovie(id){
    const response = await requests.getData(`/api/main/directors?movieId=${id}`);
    console.log("Response");
    console.log(response);
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

export async function getReviewsOfMovie(id, page=0, size=1){
    const response = await requests.getData(`/api/main/movie-reviews/reviews/${id}?page=${page}&size=${size}`);
    console.log("Before: " + page);
    console.log("Pocacho: " + `/api/main/movie-reviews/reviews/${id}?page=${page}&size=${size}`);
    console.log("Response");
    console.log(response);
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

export async function getCurrentUserCart(navigation) {
    console.log("Get cart")
    const response = await requests.getDataWithAuth('/api/users/carts/', navigation);
    console.log("Response");
    console.log(response);
    if (!response.ok) {
        console.log("Error in getCurrentUserCart");
        //navigate('/login', { replace: true });
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

export async function updateProductInCart(navigation) {
    console.log("Get cart")
    const response = await requests.putDataWithAuth('/api/users/carts/', navigation);
    console.log("Response");
    console.log(response);
    if (!response.ok) {
        console.log("Error in getCurrentUserCart");
        //navigate('/login', { replace: true });
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

export async function getProductOfMovie(movieId) {
    const response = await requests.getData(`/api/main/products?movieId=${movieId}`);
    console.log("Response");
    console.log(response);
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