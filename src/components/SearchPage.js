import {useApi} from "../http/api";
import React, {useState} from "react";
import './SearchPage.css'
import {Checkbox, Grid, IconButton, MenuItem, Select, Skeleton} from "@mui/material";
import {
    infiniteScrollFetchWrapper,
    InfiniteScrollItem,
    useInfiniteScrollRefPage
} from "./PagainationScroll";
import CancelIcon from '@mui/icons-material/Cancel';
import Movie from "./Movie";
import {useEffectAfterPageRendered} from "./UseEffectAfterPageRendered";
import {changeItemCheckedValue, isItemChecked, removeFromSelectedItems} from "./FilterUtils";

export default function SearchPage() {
    console.log("search");

    const { searchMovies } = useApi();
    const [movies, setMovies] = useState([]);
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [selectedActors, setSelectedActors] = useState([]);
    const [selectedDirectors, setSelectedDirectors] = useState([]);

    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const infiniteScrollRef = useInfiniteScrollRefPage(setPage, loading, hasMore);

    const [sortOption, setSortOption] = useState("");

    const search = async (pageNumber) => {
        let searchParams = "";
        /*const searchParams = {};
        if (selectedActors.length > 0) {
            searchParams.actors = selectedActors;
        }*/
        console.log("Search Params: ", selectedActors);
        if(selectedGenres.length > 0) {
            const stringData = selectedGenres.map((genre) => `${genre.id}`).join(',');
            searchParams = searchParams + `&genres=${stringData}`;
            //searchParams = `?genres=${stringData}`;
            console.log(stringData);
            console.log(`/api/main/movies/search?genres=${selectedGenres}`);
        }
        if(selectedActors.length > 0) {
            const stringData = selectedActors.map((actor) => `${actor.id}`).join(',');
            searchParams = searchParams + `&actors=${stringData}`;
            //searchParams = searchParams + `?actors=${stringData}`;
            console.log(stringData);
            console.log(`/api/main/movies/search?actors=${selectedActors}`);
        }
        if(selectedDirectors.length > 0) {
            const stringData = selectedDirectors.map((director) => `${director.id}`).join(',');
            searchParams = searchParams + `&directors=${stringData}`;
            //searchParams = searchParams + `?directors=${stringData}`;
            console.log(stringData);
            console.log(`/api/main/movies/search?directors=${selectedDirectors}`);
        }
        console.log(sortOption);
        if(sortOption) {
            searchParams = searchParams + `&sort=${sortOption}`;
        }
        //const url = `/api/main/movies/search${searchParams}`;
        //const data = await handleResponse(requests.get(url));
        return await searchMovies(pageNumber, 8, searchParams);

        //console.log(`/api/main/movies/search?actors=${selectedActors}`);
    };

    const fetchMovies = async (pageNumber: number) => {
        const fetchMoviesFunction = async (pageNum) => {
            const data = await search(pageNum);
            console.log(data);
            console.log(data?.last);
            setMovies((prevMovies) => {
                return [...prevMovies, ...data?.content || []];
            });
            setHasMore(!data.last);
        };
        await infiniteScrollFetchWrapper(fetchMoviesFunction, pageNumber, loading, setLoading, setHasMore);
    };

    useEffectAfterPageRendered(() => {
        console.log("search page");
        fetchMovies(page);
    }, [page]);

    useEffectAfterPageRendered(() => {
        if(page === 0)
            fetchMovies(0);
        else
            setPage(0);
    }, [sortOption]);

    return (
        <div style={{ width: "100%" }}>
            <h1>Search Page</h1>
            <p>This is the search page.</p>
            <label>Sort By</label>
            <Select
                value={sortOption}
                onChange={(e) => {
                    console.log("Fast", e.target.value);
                    setSortOption(e.target.value);
                    setMovies([]);
                    /*if(page === 0)
                        fetchMovies(0);
                    else
                        setPage(0);*/
                }}

            >
                <MenuItem value={"name,ASC"}>Name: Low to High</MenuItem>
                <MenuItem value={"name,DESC"}>Name: High to Low</MenuItem>
                <MenuItem value={"rating,ASC"}>Rating: Low to High</MenuItem>
                <MenuItem value={"rating,DESC"}>Rating: High to Low</MenuItem>

            </Select>
            <div className="search-page">
                <div className="search-filters">
                    <div className="search-filters-scroll">
                        <p>This is the search page filters.</p>
                        <GenreFilter selectedGenres={selectedGenres} setSelectedGenres={setSelectedGenres} />
                        <ActorsFilter selectedActors={selectedActors} setSelectedActors={setSelectedActors}/>
                        <DirectorsFilter selectedDirectors={selectedDirectors} setSelectedDirectors={setSelectedDirectors}/>
                        <button onClick={() => {
                            setMovies([]);
                            if(page === 0)
                                fetchMovies(0);
                            else
                                setPage(0);
                        }} style={{ height: "50px"}}>
                            Search
                        </button>
                    </div>
                </div>
                <div className="search-results">
                    {(page === 0 && loading) ?
                        <SearchMovieSkeleton num={16}/> :
                        <div>
                            <div className="search-results-items">
                                {movies.map((item, index) => {
                                    const movie = item.movie || item; // handle both ProductDto and MovieReference

                                    return (
                                        <InfiniteScrollItem
                                            idx={index}
                                            length={movies.length}
                                            infiniteScrollRef={infiniteScrollRef}
                                            //className="search-movie-cell-div"
                                        >
                                            <Movie key={index} movie={movie} />
                                        </InfiniteScrollItem>
                                    );
                                })}
                            </div>
                            {loading && <SearchMovieSkeleton num={16}/>}
                        </div>
                    }
                </div>
            </div>
        </div>
    );
}

const SearchMovieSkeleton = ({ num }) => {
    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(30%,180px), 1fr))',
                gap: '16px',
                padding: '20px',
            }}
        >
            {[...Array(num)].map((_, index) =>
                <Skeleton variant="rectangular" style={{height:'10vh'}}/>
            )}
        </div>
    );
}

function fetchPagination(fetchFunction, setItems, setHasMore, loading, setLoading) {
    return async (text, pageNum: number) => {
        const fetchItemsFunction = async (text, pageNumber) => {
            const data = await fetchFunction(text, pageNumber);
            console.log(data);
            console.log("Last", data?.last);
            setItems((prevItems) => {
                return [...prevItems, ...data?.content || []];
            });
            setHasMore(!data.last);
        }
        const wrapFunction = async (pageNumber) => { await fetchItemsFunction(text, pageNumber); };
        await infiniteScrollFetchWrapper(wrapFunction, pageNum, loading, setLoading, setHasMore);
    }
}

function textChangePagination(setItems, setSearchText, setPage) {
    return (e) => {
        const ALPHA_NUMERIC_DASH_REGEX = /^[a-zA-Z0-9- ]+$/;
        const value = e.target.value;
        if (value !== "" && !ALPHA_NUMERIC_DASH_REGEX.test(value)) {
            return;
        }
        setItems([]);
        setSearchText(value);
        setPage(0);
    };
}

const GenreFilter = ({ selectedGenres, setSelectedGenres }) => {
    const removeFromFilter = removeFromSelectedItems(selectedGenres, setSelectedGenres);
    const isItemInFilter = isItemChecked(selectedGenres);
    const changeItemCheckInFilter = changeItemCheckedValue(selectedGenres, setSelectedGenres);

    return (
        <>
            <SearchGenre
                changeItemCheckInFilter={changeItemCheckInFilter}
                isItemInFilter={isItemInFilter}
            />
            <div className="search-actors-filter">
                <p>This is the selected people filter.</p>
                <ul>
                    {selectedGenres?.map((genre, index) => {
                        return (
                            <li key={genre.id} className="search-director-cell">
                                <IconButton aria-label="delete" size="large" className="remove-product-button"
                                            onClick={() => removeFromFilter(index)} >
                                    <CancelIcon />
                                </IconButton>
                                <p>{genre?.name}</p>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </>
    );
}

const SearchGenre = ({ isItemInFilter, changeItemCheckInFilter }) => {
    const { searchGenres } = useApi();
    const [searchText, setSearchText] = useState("");
    const [genres, setGenres] = useState([]);

    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const infiniteScrollRef = useInfiniteScrollRefPage(setPage, loading, hasMore);

    useEffectAfterPageRendered( () => {
        const fetchGenresFunction = async (text, pageNum) => await searchGenres(text, pageNum, 3);
        const fetchGenres = fetchPagination(fetchGenresFunction, setGenres, setHasMore, loading, setLoading);
        fetchGenres(searchText, page);
    }, [searchText, page]);

    const searchTextChange = textChangePagination(setGenres, setSearchText, setPage);

    return (
        <div className="search-actors-filter">
            <p>This is the Genres filter.</p>
            <input
                type="text"
                value={searchText}
                onChange={(e) => searchTextChange(e)}
                placeholder="Search for people..."
            />
            {(page === 0 && loading) ?
                <div className="search-actors-filter-skeleton">
                    <Skeleton variant="rectangular"/>
                    <Skeleton variant="rectangular"/>
                    <Skeleton variant="rectangular"/>
                </div> :
                <ul>
                    {genres?.map((genre, index) => {
                        return (
                            <InfiniteScrollItem
                                idx={index}
                                length={genres.length}
                                infiniteScrollRef={infiniteScrollRef}
                                className="search-director-cell-div"
                            >
                                <GenreCell genre={genre}
                                            isChecked={isItemInFilter(genre)}
                                            onChange={(checkValue) => changeItemCheckInFilter(genre, checkValue)}/>
                            </InfiniteScrollItem>
                        );
                    })}
                    {hasMore && !loading && <div style={{height: '20px'}}></div>}
                    {loading && <Skeleton variant="rectangular"/>}
                </ul>
            }
        </div>
    );
}

const ActorsFilter = ({ selectedActors, setSelectedActors }) => {
    const removeFromFilter = removeFromSelectedItems(selectedActors, setSelectedActors);
    const isItemInFilter = isItemChecked(selectedActors);
    const changeItemCheckInFilter = changeItemCheckedValue(selectedActors, setSelectedActors);

    return (
        <>
            <SearchActor
                changeItemCheckInFilter={changeItemCheckInFilter}
                isItemInFilter={isItemInFilter}
            />
            <div className="search-actors-filter">
                <p>This is the selected people filter.</p>
                <ul>
                    {selectedActors?.map((actor, index) => {
                        return (
                            <li key={actor.id} className="search-director-cell">
                                <IconButton aria-label="delete" size="large" className="remove-product-button"
                                            onClick={() => removeFromFilter(index)} >
                                    <CancelIcon />
                                </IconButton>
                                <img src={actor?.imagePath} alt={`${actor?.name} Poster`} width="10%" height="auto"/>
                                <p>{actor?.name}</p>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </>
    );
}

const SearchActor = ({ isItemInFilter, changeItemCheckInFilter }) => {
    const { searchActors } = useApi();
    const [searchText, setSearchText] = useState("");
    const [actors, setActors] = useState([]);

    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [loading, setLoading] = useState(false);
    const infiniteScrollRef = useInfiniteScrollRefPage(setPage, loading, hasMore);

    useEffectAfterPageRendered(() => {
        const fetchActorsFunction = async (text, pageNum) => await searchActors(text, pageNum, 3);
        const fetchActors = fetchPagination(fetchActorsFunction, setActors, setHasMore, loading, setLoading);
        fetchActors(searchText, page);
        console.log("Is It Last", hasMore);
    }, [searchText, page]);

    const searchTextChange = textChangePagination(setActors, setSearchText, setPage);

    return (
        <div className="search-actors-filter">
            <p>This is the Actors filter.</p>
            <input
                type="text"
                value={searchText}
                onChange={(e) => searchTextChange(e)}
                placeholder="Search for people..."
            />
            {(page === 0 && loading) ?
                <div className="search-actors-filter-skeleton">
                    <Skeleton variant="rectangular"/>
                    <Skeleton variant="rectangular"/>
                    <Skeleton variant="rectangular"/>
                </div> :
                <ul>
                    {actors?.map((actor, index) => {
                        return (
                            <InfiniteScrollItem
                                idx={index}
                                length={actors.length}
                                infiniteScrollRef={infiniteScrollRef}
                                className="search-director-cell-div"
                            >
                                <PersonCell person={actor}
                                            isChecked={isItemInFilter(actor)}
                                            onChange={(checkValue) => changeItemCheckInFilter(actor, checkValue)}/>
                            </InfiniteScrollItem>
                        );
                    })}
                    {hasMore && !loading && <div style={{height: '20px'}}></div>}
                    {loading && <Skeleton variant="rectangular"/>}
                </ul>
            }
        </div>
    );
}

const DirectorsFilter = ({ selectedDirectors, setSelectedDirectors }) => {
    const removeFromFilter = removeFromSelectedItems(selectedDirectors, setSelectedDirectors);
    const isItemInFilter = isItemChecked(selectedDirectors);
    const changeItemCheckInFilter = changeItemCheckedValue(selectedDirectors, setSelectedDirectors);

    return (
        <>
            <SearchDirector
                changeItemCheckInFilter={changeItemCheckInFilter}
                isItemInFilter={isItemInFilter}
            />
            <div className="search-actors-filter">
                <p>This is the selected people filter.</p>
                <ul>
                    {selectedDirectors?.map((director, index) => {
                        return (
                            <li key={director.id} className="search-director-cell">
                                <IconButton aria-label="delete" size="large" className="remove-product-button"
                                            onClick={() => removeFromFilter(index)} >
                                    <CancelIcon />
                                </IconButton>
                                <img src={director?.imagePath} alt={`${director?.name} Poster`} width="10%" height="auto"/>
                                <p>{director?.name}</p>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </>
    );
}

const SearchDirector = ({ isItemInFilter, changeItemCheckInFilter }) => {
    const {searchDirectors} = useApi();
    const [searchText, setSearchText] = useState("");
    const [directors, setDirectors] = useState([]);

    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const infiniteScrollRef = useInfiniteScrollRefPage(setPage, loading, hasMore);

    useEffectAfterPageRendered(() => {
        const fetchDirectorsFunction = async (text, pageNum) => await searchDirectors(text, pageNum, 3);
        const fetchDirectors = fetchPagination(fetchDirectorsFunction, setDirectors, setHasMore, loading, setLoading);
        fetchDirectors(searchText, page);
    }, [searchText, page]);

    const searchTextChange = textChangePagination(setDirectors, setSearchText, setPage);

    return (
        <div className="search-actors-filter">
            <p>This is the Directors filter.</p>
            <input
                type="text"
                value={searchText}
                onChange={(e) => searchTextChange(e)}
                placeholder="Search for people..."
            />
            {(page === 0 && loading) ?
                <div className="search-actors-filter-skeleton">
                    <Skeleton variant="rectangular"/>
                    <Skeleton variant="rectangular"/>
                    <Skeleton variant="rectangular"/>
                </div> :
                <ul>
                    {directors?.map((director, index) => {
                        return (
                            <InfiniteScrollItem
                                idx={index}
                                length={directors.length}
                                infiniteScrollRef={infiniteScrollRef}
                                className="search-director-cell-div"
                            >
                                <PersonCell person={director}
                                            isChecked={isItemInFilter(director)}
                                            onChange={(checkValue) => changeItemCheckInFilter(director, checkValue)}/>
                            </InfiniteScrollItem>
                        );
                    })}
                    {hasMore && !loading && <div style={{height: '20px'}}></div>}
                    {loading && <Skeleton variant="rectangular"/>}
                </ul>
            }
        </div>
    );
}

const PersonCell = ({ person, isChecked, onChange }) => {
    console.log(person);
    console.log("AmI Checked", isChecked);
    return (
        <li key={person.id} className="search-director-cell">
            <Checkbox
                checked={isChecked}
                onChange={(e) => onChange(e.target.checked)}
            />
            {<img src={person?.imagePath} alt={`${person?.name} Poster`} width="10%" height="auto"/>}
            <p>{person?.name}</p>
        </li>
    );
};

const GenreCell = ({ genre, isChecked, onChange }) => {
    console.log(genre);
    return (
        <li key={genre.id} className="search-director-cell">
            <Checkbox
                checked={isChecked}
                onChange={(e) => onChange(e.target.checked)}
            />
            <p>{genre?.name}</p>
        </li>
    );
};