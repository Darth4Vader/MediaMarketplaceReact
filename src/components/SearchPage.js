import MovieGrid from "./MovieGrid";
import {useApi} from "../http/api";
import React, {Suspense, use, useEffect, useRef, useState} from "react";
import './SearchPage.css'
import {Checkbox, FormControlLabel, Skeleton} from "@mui/material";
import {PaginationScroll} from "./PagainationScroll";

export default function SearchPage() {
    const { getAllMovies } = useApi();
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LoadSearchPage dataPromise={getAllMovies()} />
        </Suspense>
    );
}

function LoadSearchPage({dataPromise}) {
    const movies = use(dataPromise);
    console.log("search");
    return (
        <div style={{ width: "100%" }}>
            <h1>Search Page</h1>
            <p>This is the search page.</p>
            <div className="search-page">
                <SearchPageFilters/>
                <div className="search-results">
                    {<p>hello</p>}
                    {/*<MovieGrid movies={movies?.content} />*/}
                </div>
            </div>
        </div>
    );
}

const SearchPageFilters = () => {
    return (
        <div className="search-filters">
            {/*<h1>Search Page Filters</h1>*/}
            <p>This is the search page filters.</p>
            <SearchActor/>
        </div>
    );
}

const ActorsFilter = () => {
    const { searchActors } = useApi();
    const [searchText, setSearchText] = useState("");
    const [pageLoaded, setPageLoaded] = useState(false);
    const [actors, setActors] = useState([]);
    const hasPageRendered = useRef(false);
    useEffect(() => {
        if(hasPageRendered.current) {
            if(searchText && searchText !== "") {
                const fetching = async () => {
                    const data = await searchActors(searchText);
                    console.log(data);
                    setActors(data?.content || []);
                    setPageLoaded(true);
                };
                fetching();
            }
            else {
                setActors([]);
            }
        }
        else {
            hasPageRendered.current = true;
        }
    }, [searchText]);
    return (
        <div className="search-actors-filter">
            <p>This is the people filter.</p>
            <input
                type="text"
                value={searchText}
                pattern={
                    "^[a-zA-Z0-9]*$"
                }
                onChange={(e) => {
                    const ALPHA_NUMERIC_DASH_REGEX = /^[a-zA-Z0-9- ]+$/;
                    const value = e.target.value;
                    if (value !== "" && !ALPHA_NUMERIC_DASH_REGEX.test(value)) {
                        return;
                    }
                    setSearchText(value);
                }}
                placeholder="Search for people..."
            />
            {pageLoaded ?
                <ul>
                    {actors?.map((actor) => {
                        return <DirectorCell castMember={actor}/>;
                    })}
                </ul>
                : <Skeleton variant="rectangular"/>
            }
        </div>
    );
}


const SearchActor = () => {
    const { searchActors } = useApi();
    const [searchText, setSearchText] = useState("");
    const [actors, setActors] = useState([]);
    const hasPageRendered = useRef(false);
    const [searchFinished, setSearchFinished] = useState(true);
    const [page, setPage] = useState(0);
    const [lastPage, setLastPage] = useState(true);
    const [resultPage, setResultPage] = useState(0);

    useEffect(() => {
        if(hasPageRendered.current) {
            if(searchText && searchText !== "") {
                const fetching = async () => {
                    const data = await searchActors(searchText, page, 5);
                    console.log(data);
                    //setResultPage(data?.page || 0);
                    setLastPage(data.last);
                    console.log(data?.last);
                    if(page === 0) {
                        setActors(data?.content || []);
                        setSearchFinished(true);
                    }
                    else {
                        setActors((prevActors) => {
                            return [...prevActors, ...data?.content || []];
                        });
                    }
                };
                fetching();
            }
            else {
                setSearchFinished(true);
                setActors([]);
            }
        }
        else {
            hasPageRendered.current = true;
        }
    }, [searchText, page]);
    return (
        <div className="search-actors-filter">
            <p>This is the people filter.</p>
            {/*searchFinished ?
                : <Skeleton variant="text" />
            */}
            <input
                type="text"
                value={searchText}
                onChange={(e) => {
                    //if(searchFinished) {
                        const ALPHA_NUMERIC_DASH_REGEX = /^[a-zA-Z0-9- ]+$/;
                        const value = e.target.value;
                        if (value !== "" && !ALPHA_NUMERIC_DASH_REGEX.test(value)) {
                            return;
                        }
                        setSearchFinished(false);
                        setPage(0);
                        setSearchText(value);
                    //}
                }}
                placeholder="Search for people..."
            />
            {searchFinished ?
                <PaginationScroll
                    page={page}
                    setPage={setPage}
                    lastPage={lastPage}
                    /*changePageAction={(newPage) => {
                   setPage(newPage);
                }}*/>
                    <ul>
                        {actors?.map((actor) => {
                            return <DirectorCell castMember={actor}/>;
                        })}
                    </ul>
                </PaginationScroll>
                : <Skeleton variant="rectangular"/>
            }
        </div>
    );
}

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

const DirectorCell = ({ castMember }) => {
    console.log(castMember);
    return (
        <li key={castMember.id} className="cast-cell">
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