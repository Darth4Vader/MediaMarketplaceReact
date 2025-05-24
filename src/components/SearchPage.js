import MovieGrid from "./MovieGrid";
import {useApi} from "../http/api";
import React, {Suspense, use, useCallback, useEffect, useRef, useState} from "react";
import './SearchPage.css'
import {Checkbox, FormControl, FormControlLabel, IconButton, Skeleton} from "@mui/material";
import {PaginationScroll} from "./PagainationScroll";
import DeleteIcon from "@mui/icons-material/Delete";
import CancelIcon from '@mui/icons-material/Cancel';
import {useFetchRequests} from "../http/requests";
import Movie from "./Movie";

export default function SearchPage() {
    const { getAllMovies } = useApi();
    return (
            <LoadSearchPage />
    );
}

function LoadSearchPage() {
    /*const movies = use(dataPromise);*/
    const [movies, setMovies] = useState([]);
    console.log("search");

    const { searchMovies } = useApi();

    const [selectedActors, setSelectedActors] = useState([]);

    const [page, setPage] = useState(0);

    const hasPageRendered = useRef(false);

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

    const fetchActors = async (pageNum: number) => {
        setLoading(true);
        try {
            const data = await search(pageNum);
            console.log(data);
            console.log(data?.last);
            setMovies((prevMovies) => {
                return [...prevMovies, ...data?.content || []];
            });
            //}
            setHasMore(!data.last);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log("search page");
        if(hasPageRendered.current) {
            const c = fetchActors(page);
        }
        else {
            hasPageRendered.current = true;
        }
    }, [page]);

    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    const observer = useRef(null);
    const lastPostElementRef = useCallback(
        (node: HTMLDivElement) => {
            console.log("Hola", loading, hasMore);
            console.log(observer.current);
            if (loading) return;
            if (observer.current) observer.current.disconnect();
            observer.current = new IntersectionObserver(
                (entries) => {
                    if (entries[0].isIntersecting && hasMore) {
                        setPage((prevPage) => prevPage + 1);
                    }
                },
                { threshold: 1.0 }
            );
            if (node) observer.current.observe(node);
        },
        [loading, hasMore]
    );

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
                            if (observer.current) observer.current.disconnect();
                            if(page === 0)
                                fetchActors(0);
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
                                    if(movies.length === index + 1) {
                                        console.log("last");
                                        console.log(movie);
                                        return (
                                            <div ref={lastPostElementRef} key={movie.id}>
                                                <Movie key={index} movie={movie} />
                                            </div>
                                        );
                                    } else {
                                        return (
                                            <div key={movie.id}>
                                                <Movie key={index} movie={movie} />
                                            </div>
                                        );
                                    }
                                })}
                            </div>
                            {loading && <Skeleton variant="rectangular"/>}
                        </div>
                    }
                    {/*<MovieGrid movies={movies?.content} />*/}
                </div>
            </div>
        </div>
    );
}

const SearchPageFilters = ( { movies, setMovies } ) => {
    const [selectedActors, setSelectedActors] = useState([]);
    const requests = useFetchRequests();
    const { handleResponse } = useApi();
    const search = async () => {
        let searchParams = "";
        /*const searchParams = {};
        if (selectedActors.length > 0) {
            searchParams.actors = selectedActors;
        }*/
        console.log("Search Params: ", selectedActors);
        if(selectedActors.length > 0) {
            const stringData = selectedActors.map((actor) => `${actor.id}`).join(',');
            if(searchParams !== "")
                searchParams = `?actors=${stringData}`;
            else
                searchParams = searchParams + `&actors=${stringData}`;
            //searchParams = searchParams + `?actors=${stringData}`;
            console.log(stringData);
            console.log(`/api/main/movies/search?actors=${selectedActors}`);
        }
        const url = `/api/main/movies/search${searchParams}`;
        const data = await handleResponse(requests.get(url));


        //console.log(`/api/main/movies/search?actors=${selectedActors}`);
    };

    return (
        <div className="search-filters">
            {/*<h1>Search Page Filters</h1>*/}
            <p>This is the search page filters.</p>
            <ActorsFilter selectedActors={selectedActors} setSelectedActors={setSelectedActors}/>
            <button onClick={() => search()} style={{ height: "50px"}}>
                Search
            </button>
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
    const hasPageRendered = useRef(false);
    const [searchFinished, setSearchFinished] = useState(true);
    const [page, setPage] = useState(0);


    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);


    const fetchActors = async (pageNum: number) => {
        setLoading(true);
        try {
            const data = await searchActors(searchText, pageNum, 3);
            console.log(data);
            console.log(data?.last);
            setActors((prevActors) => {
                return [...prevActors, ...data?.content || []];
            });
            //}
            setHasMore(!data.last);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log("search page");
        if(hasPageRendered.current) {
            const c = fetchActors(page);
        }
        else {
            hasPageRendered.current = true;
        }
    }, [searchText, page]);


    const observer = useRef(null);
    const lastPostElementRef = useCallback(
        (node: HTMLDivElement) => {
            console.log("Hola", loading, hasMore);
            console.log(observer.current);
            if (loading) return;
            if (observer.current) observer.current.disconnect();
            observer.current = new IntersectionObserver(
                (entries) => {
                    if (entries[0].isIntersecting && hasMore) {
                        setPage((prevPage) => prevPage + 1);
                    }
                },
                { threshold: 1.0 }
            );
            if (node) observer.current.observe(node);
        },
        [loading, hasMore]
    );

    const searchTextChange = (e) => {
        //if(searchFinished) {
        const ALPHA_NUMERIC_DASH_REGEX = /^[a-zA-Z0-9- ]+$/;
        const value = e.target.value;
        if (value !== "" && !ALPHA_NUMERIC_DASH_REGEX.test(value)) {
            return;
        }
        if (observer.current) observer.current.disconnect();
        //setPage(0);
        //setResultPage(0);
        setActors([]);
        setSearchText(value);
        console.log(hasPageRendered.current);
        console.log(searchText && searchText !== "");
        //if (searchText && searchText !== "") {
        setPage(0);
        //}
        //}
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
                        if(actors.length === index + 1) {
                            console.log("last");
                            console.log(actor);
                            return (
                                <div ref={lastPostElementRef} key={actor.id} className="search-director-cell-div">
                                    <DirectorCell castMember={actor}
                                                  isChecked={isCheckedAction(actor)}
                                                  onChange={(checkValue) => checkedChangeAction(actor, checkValue)}/>
                                </div>
                            );
                        } else {
                            return (
                                <div key={actor.id} className="search-director-cell-div">
                                    <DirectorCell castMember={actor}
                                                  isChecked={isCheckedAction(actor)}
                                                  onChange={(checkValue) => checkedChangeAction(actor, checkValue)}/>
                                </div>
                            );
                        }
                    })}
                    {loading && <Skeleton variant="rectangular"/>}
                </ul>
            }
        </div>
    );
}

/*
                {
                <PaginationScroll
                    page={page}
                    setPage={setPage}
                    lastPage={lastPage}
                    //changePageAction={(newPage) => {
                   //setPage(newPage);
                    //}}
                >
                    <ul>
                        {actors?.map((actor) => {
                            return <DirectorCell castMember={actor}/>;
                        })}
                    </ul>
                </PaginationScroll>
                }
 */

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


const DirectorCell2 = ({ castMember }) => {
    return (
        <li key={castMember.id} className="cast-cell">
            <input
                type="checkbox"
                //checked={isChecked}
                //onChange={handleCheckboxChange}
            />
            <img src={castMember?.person?.imagePath} alt={`${castMember?.name} Poster`} />
            <div>
                <p>{castMember?.person?.name}</p>
            </div>
        </li>
    );
};



const DirectorCell3 = ({ castMember }) => {
    console.log(castMember);
    return (
        <li key={castMember.id} className="search-director-cell">
            <FormControlLabel
                control={
                    <Checkbox
                        //checked={isChecked}
                        //onChange={handleCheckboxChange}
                    />
                }
                label={
                    <React.Fragment>
                        {<img src={castMember?.imagePath} alt={`${castMember?.name} Poster`} width="20px" height="auto"/>}
                        <p>{castMember?.name}</p>
                    </React.Fragment>
                }
            />
        </li>
    );
};

const PeopleFilter = () => {
    const [searchText, setSearchText] = useState("");
    return (
        <div className="people-filter">
            <p>This is the people filter.</p>
            <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search for people..."
            />
        </div>
    );
}