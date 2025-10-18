import React, {Suspense, useEffect, useState, use} from 'react';
import MovieGrid from './MovieGrid';
import MyAppBar from './MyAppBar';
import { useApi } from '../http/api';
import {Box, Stack} from "@mui/material";
import MovieCell from "./Movie";

export default function HomePage() {
    const { getAllMovies } = useApi();
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LoadHomePage dataPromise={getAllMovies()} />
        </Suspense>
    );
}

function LoadHomePage({dataPromise}) {
    const products = use(dataPromise);
    const { getMovieRecommendationForCurrentUser } = useApi();

    const [recommendations, setRecommendations] = useState([]);

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const data = await getMovieRecommendationForCurrentUser();
                setRecommendations(data);
            } catch (error) {
                console.error("Error fetching movie recommendations:", error);
            }
        }
        fetchRecommendations();
    }, []);
    console.log("Products in HomePage");
    console.log(products);
    return (
        <div style={{width: '100%'}}>
            <h1 style={{ textAlign: 'center', fontSize: '48px', margin: '20px 0' }}>
                Welcome
            </h1>
            {recommendations.length > 0 && (
                <>
                    <div style={{
                        textAlign: 'start',
                    }}>
                        Recommended for you:
                    </div>
                    <Stack direction="row" spacing={2} sx={{
                        overflowX: 'auto',
                        overflowY: 'hidden',
                        whiteSpace: "nowrap",
                        height: "25vh",
                        alignItems: "center",
                    }} disable >
                        {recommendations?.map((item, index) => {
                            const movie = item.movie || item; // handle both ProductDto and MovieReference
                            console.log(movie)
                            if (!movie?.name || !movie?.posterPath) return null;
                            return (
                                <Box sx={{
                                    flexShrink: 0,      // don't allow shrinking
                                    height: '100%',
                                    width: '15%',
                                    marginLeft: "0px !important"
                                }}>
                                    <MovieCell key={index} movie={movie} />
                                </Box>
                            );
                        })}
                    </Stack>
                </>
            )}
            <MovieGrid movies={products?.content} />
        </div>
    );
}