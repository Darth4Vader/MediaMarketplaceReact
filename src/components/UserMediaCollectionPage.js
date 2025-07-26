import {useApi} from "../http/api";
import {PaginationNavigatePage, useCurrentPage} from "./Pagination";
import React, {useEffect, useState} from "react";
import {useErrorBoundary} from "react-error-boundary";
import MovieGrid from "./MovieGrid";


const UserMediaCollectionPage = () => {
    const { getCurrentUserMovieCollection } = useApi();
    const page = useCurrentPage();
    const [movies, setMovies] = useState(null);
    const [pageLoaded, setPageLoaded] = useState(false);

    const errorBoundary = useErrorBoundary();

    useEffect(() => {
        const fetchMoviesCollection = async () => {
            try {
                const movies = await getCurrentUserMovieCollection(page - 1, 10);
                console.log("Movies:", movies);
                setMovies(movies);
            } catch (error) {
                console.log("Hate")
                errorBoundary.showBoundary(error);
            }
        }
        fetchMoviesCollection();
    }, [page]);

    return (
        <div key="movie_collection">
            { movies?.content && <MovieGrid movies={movies?.content} />}
            <div className="pagination">
                <PaginationNavigatePage paginationResult={movies} />
            </div>
        </div>
    );
}

export default UserMediaCollectionPage;