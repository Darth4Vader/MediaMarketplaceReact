import {useApi} from "../http/api";
import React, {useState} from "react";
import './SearchPage.css'
import {Checkbox, IconButton, Skeleton} from "@mui/material";
import {
    infiniteScrollFetchWrapper,
    InfiniteScrollItem,
    useInfiniteScrollRefPage
} from "./PagainationScroll";
import CancelIcon from '@mui/icons-material/Cancel';
import Movie from "./Movie";
import {useEffectAfterPageRendered} from "./UseEffectAfterPageRendered";

export default function SearchPage() {
    console.log("search");

    const { searchMovies } = useApi();
    const [movies, setMovies] = useState([]);
    const [selectedActors, setSelectedActors] = useState([]);

    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const infiniteScrollRef = useInfiniteScrollRefPage(setPage, loading, hasMore);

    const search = async (pageNumber) => {
        let searchParams = "";
        /*const searchParams = {};
        if (selectedActors.length > 0) {
            searchParams.actors = selectedActors;
        }*/
        console.log("Search Params: ", selectedActors);
        if(selectedActors.length > 0) {
            const stringData = selectedActors.map((actor) => `${actor.id}`).join(',');
            searchParams = searchParams + `&actors=${stringData}`;
            //searchParams = searchParams + `?actors=${stringData}`;
            console.log(stringData);
            console.log(`/api/main/movies/search?actors=${selectedActors}`);
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

    return (
        <div style={{ width: "100%" }}>
            <h1>Search Page</h1>
            <p>This is the search page.</p>
            <div className="search-page">
                <div className="search-filters">
                    <div className="search-filters-scroll">
                        <p>This is the search page filters.</p>
                        <ActorsFilter selectedActors={selectedActors} setSelectedActors={setSelectedActors}/>
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
                        <div className="search-actors-filter-skeleton">
                            <Skeleton variant="rectangular"/>
                            <Skeleton variant="rectangular"/>
                            <Skeleton variant="rectangular"/>
                        </div> :
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
                            {loading && <Skeleton variant="rectangular"/>}
                        </div>
                    }
                </div>
            </div>
        </div>
    );
}

const ActorsFilter = ({ selectedActors, setSelectedActors }) => {

    const removeFromFilter = (index) => {
        setSelectedActors(selectedActors => selectedActors.filter((_, i) => i !== index));
    }

    const isCheckedAction = (actor) => {
        return selectedActors?.some((selectedActor) => selectedActor.id === actor.id);
    }

    const checkedChangeAction = (actor, isChecked) => {
        console.log(isChecked, actor);
        if(isChecked) {
            if(!isCheckedAction(actor))
                setSelectedActors((prevActors) => [...prevActors, actor]);
        } else {
            setSelectedActors((prevActors) => prevActors.filter((a) => a.id !== actor.id));
        }
    }

    return (
        <>
            <SearchActor
                checkedChangeAction={checkedChangeAction}
                isCheckedAction={isCheckedAction}
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

const SearchActor = ({ isCheckedAction, checkedChangeAction }) => {
    const { searchActors } = useApi();
    const [searchText, setSearchText] = useState("");
    const [actors, setActors] = useState([]);

    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const infiniteScrollRef = useInfiniteScrollRefPage(setPage, loading, hasMore);

    useEffectAfterPageRendered(() => {
        const fetchActors = async (pageNum: number) => {
            const fetchActorsFunction = async (pageNumber) => {
                const data = await searchActors(searchText, pageNumber, 3);
                console.log(data);
                console.log(data?.last);
                setActors((prevActors) => {
                    return [...prevActors, ...data?.content || []];
                });
                setHasMore(!data.last);
            }
            await infiniteScrollFetchWrapper(fetchActorsFunction, pageNum, loading, setLoading, setHasMore);
        }
        fetchActors(page);
    }, [searchText, page]);

    const searchTextChange = (e) => {
        //if(searchFinished) {
        const ALPHA_NUMERIC_DASH_REGEX = /^[a-zA-Z0-9- ]+$/;
        const value = e.target.value;
        if (value !== "" && !ALPHA_NUMERIC_DASH_REGEX.test(value)) {
            return;
        }
        setActors([]);
        setSearchText(value);
        console.log(searchText && searchText !== "");
        setPage(0);
    };

    return (
        <div className="search-actors-filter">
            <p>This is the people filter.</p>
            {/*searchFinished ?
                : <Skeleton variant="text" />
            */}
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
                                <DirectorCell castMember={actor}
                                              isChecked={isCheckedAction(actor)}
                                              onChange={(checkValue) => checkedChangeAction(actor, checkValue)}/>
                            </InfiniteScrollItem>
                        );
                    })}
                    {loading && <Skeleton variant="rectangular"/>}
                </ul>
            }
        </div>
    );
}

const DirectorCell = ({ castMember, isChecked, onChange }) => {
    console.log(castMember);
    return (
        <li key={castMember.id} className="search-director-cell">
            <Checkbox
                checked={isChecked}
                onChange={(e) => onChange(e.target.checked)}
            />
            {<img src={castMember?.imagePath} alt={`${castMember?.name} Poster`} width="10%" height="auto"/>}
            <p>{castMember?.name}</p>
        </li>
    );
};