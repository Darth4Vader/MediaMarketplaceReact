import {useApi} from "../http/api";
import React, {useEffect, useState} from "react";
import './SearchPage.css'
import {
    AppBar,
    Box, Button,
    Checkbox, Collapse,
    Drawer,
    Grid,
    IconButton, ListItem,
    ListItemButton,
    MenuItem,
    Select,
    Skeleton, SvgIcon,
    Toolbar
} from "@mui/material";
import {
    infiniteScrollFetchWrapper,
    InfiniteScrollItem,
    useInfiniteScrollRefPage
} from "./PagainationScroll";
import CancelIcon from '@mui/icons-material/Cancel';
import Movie from "./Movie";
import {useEffectAfterPageRendered} from "./UseEffectAfterPageRendered";
import {changeItemCheckedValue, isItemChecked, removeFromSelectedItems} from "./FilterUtils";
import {useSearchInputContext} from "../SearchInputProvider";
import List from "@mui/material/List";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { ReactComponent as DirectorImage} from '../director-profession-icon.svg';
import { ReactComponent as ActorImage} from '../actor-profession-icon.svg';
import { ReactComponent as MovieGenreImage} from '../movie-genre-icon.svg';
import TextField from "@mui/material/TextField";
import {HideOnScroll} from "./MyAppBar";

export default function SearchPage(props) {
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

    const { searchInput, isSearching } = useSearchInputContext();

    const search = async (pageNumber) => {
        let searchParams = "";
        /*const searchParams = {};
        if (selectedActors.length > 0) {
            searchParams.actors = selectedActors;
        }*/
        if( searchInput && searchInput.length > 0) {
            searchParams = `&name=${searchInput}`;
        }
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

    const fetchMoviesFirstPage = async () => {
        setMovies([]);
        if(page === 0)
            fetchMovies(0);
        else
            setPage(0);
    };

    // when page loads for the first time, check if there is a search input
    useEffect(() => {
        if(searchInput && searchInput.length > 0) {
            fetchMoviesFirstPage();
        }
    }, [isSearching]);

    useEffectAfterPageRendered(() => {
        console.log("search page");
        fetchMovies(page);
    }, [page]);

    useEffectAfterPageRendered(() => {
        fetchMoviesFirstPage();
    }, [sortOption]);

    return (
        <Box className="search-page">
            <Drawer
                variant="permanent"
                sx={{
                    width: 240,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: 240,
                        boxSizing: 'border-box',
                    },
                    zIndex: (theme) => theme.zIndex.drawer
                }}
            >
                <Toolbar className="app-bar" />
                <Box sx={{ overflow: 'auto' }}>
                    <List>
                        <SearchPageListItem text="Genres" icon={<MovieGenreImage/>}>
                            <GenreFilter selectedGenres={selectedGenres} setSelectedGenres={setSelectedGenres} />
                        </SearchPageListItem>
                        <SearchPageListItem text="Actors" icon={<ActorImage/>}>
                            <ActorsFilter selectedActors={selectedActors} setSelectedActors={setSelectedActors}/>
                        </SearchPageListItem>
                        <SearchPageListItem text="Directors" icon={<DirectorImage/>}>
                            <DirectorsFilter selectedDirectors={selectedDirectors} setSelectedDirectors={setSelectedDirectors}/>
                        </SearchPageListItem>
                    </List>
                    <Button variant="outlined" onClick={() => {
                        fetchMoviesFirstPage();
                    }} style={{ height: "50px"}}>
                        Search
                    </Button>
                </Box>
            </Drawer>
            <div className="main-search-page">
                <h1>Search Page</h1>
                <HideOnScroll {...props}>
                <AppBar
                    position="sticky"
                    style={{
                        top: "10vh"
                    }
                    }
                    sx={{ zIndex: (theme) => theme.zIndex.drawer+1}}
                >
                    <Toolbar variant="dense">
                        <label>Sort By</label>
                        <Select
                            style={{ marginLeft: '25px', width: '50%' }}
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
                            <MenuItem value={""} >None</MenuItem>
                            <MenuItem value={"name,ASC"}>Name: Low to High</MenuItem>
                            <MenuItem value={"name,DESC"}>Name: High to Low</MenuItem>
                            <MenuItem value={"rating,ASC"}>Rating: Low to High</MenuItem>
                            <MenuItem value={"rating,DESC"}>Rating: High to Low</MenuItem>

                        </Select>
                    </Toolbar>
                </AppBar>
                </HideOnScroll>
                <div className="search-center-page">
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
        </Box>
    );
}

const SearchPageListItem = ({ text, icon, children }) => {
    const [expanded, setExpanded] = useState(false);
    const handleExpandClick = () => {
        setExpanded(!expanded);
    }
    return (
        <div style={{width: '100%'}}>
            <ListItem key="text">
                <ListItemButton onClick={handleExpandClick}>
                    <ListItemIcon>
                        <SvgIcon color="primary">
                            {icon}
                        </SvgIcon>
                    </ListItemIcon>
                    <ListItemText primary={text} />
                    {expanded ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
            </ListItem>
            <Collapse in={expanded} timeout="auto" unmountOnExit>
                {children}
            </Collapse>
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
    const { searchGenres } = useApi();
    const fetchSearchGenres = async (text, pageNum) => await searchGenres(text, pageNum, 3);

    return (
        <CategoryFilter
            selectedItems={selectedGenres}
            setSelectedItems={setSelectedGenres}
            getListItemBody={(genre) => {
                return <ListItemText primary={genre?.name} />
            }}
            fetchSearchItems={fetchSearchGenres}
            searchLabel="Search for genres..."
        />
    );
}

const ActorsFilter = ({ selectedActors, setSelectedActors }) => {
    const { searchActors } = useApi();
    const fetchSearchActors = async (text, pageNum) => await searchActors(text, pageNum, 3);

    return (
        <CategoryFilter
            selectedItems={selectedActors}
            setSelectedItems={setSelectedActors}
            getListItemBody={(actor) => {
                return (
                    <>
                        <img src={actor?.imagePath} alt={`${actor?.name} Poster`} width="10%" height="auto"/>
                        <p>{actor?.name}</p>
                    </>
                )
            }}
            fetchSearchItems={fetchSearchActors}
            searchLabel="Search for actors..."
        />
    );
}

const DirectorsFilter = ({ selectedDirectors, setSelectedDirectors }) => {
    const { searchDirectors } = useApi();
    const fetchSearchDirectors = async (text, pageNum) => await searchDirectors(text, pageNum, 3);

    return (
        <CategoryFilter
            selectedItems={selectedDirectors}
            setSelectedItems={setSelectedDirectors}
            getListItemBody={(director) => {
                return (
                    <>
                        <img src={director?.imagePath} alt={`${director?.name} Poster`} width="10%" height="auto"/>
                        <p>{director?.name}</p>
                    </>
                )
            }}
            fetchSearchItems={fetchSearchDirectors}
            searchLabel="Search for directors..."
        />
    );
}

const CategoryFilter = ({ selectedItems, setSelectedItems, getListItemBody, fetchSearchItems, searchLabel }) => {
    const removeFromFilter = removeFromSelectedItems(selectedItems, setSelectedItems);
    const isItemInFilter = isItemChecked(selectedItems);
    const changeItemCheckInFilter = changeItemCheckedValue(selectedItems, setSelectedItems);

    return (
        <>
            <SearchCategory
                changeItemCheckInFilter={changeItemCheckInFilter}
                isItemInFilter={isItemInFilter}
                getListItemBody={getListItemBody}
                fetchSearchItems={fetchSearchItems}
                searchLabel={searchLabel}
            />
            <div className="search-actors-filter">
                <List>
                    {selectedItems?.map((item, index) => {
                        return (
                            <ListItem key={index}>
                                <IconButton aria-label="delete" size="large" className="remove-product-button"
                                            onClick={() => removeFromFilter(index)} >
                                    <CancelIcon />
                                </IconButton>
                                {getListItemBody(item)}
                            </ListItem>
                        );
                    })}
                </List>
            </div>
        </>
    );
}

const SearchCategory = ({ isItemInFilter, changeItemCheckInFilter, getListItemBody, fetchSearchItems, searchLabel }) => {
    const [searchText, setSearchText] = useState("");
    const [items, setItems] = useState([]);

    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const infiniteScrollRef = useInfiniteScrollRefPage(setPage, loading, hasMore);

    useEffectAfterPageRendered( () => {
        const fetchSearchPaginationItems = fetchPagination(fetchSearchItems, setItems, setHasMore, loading, setLoading);
        fetchSearchPaginationItems(searchText, page);
    }, [searchText, page]);

    const searchTextChange = textChangePagination(setItems, setSearchText, setPage);

    return (
        <div className="search-actors-filter">
            <TextField
                label={searchLabel}
                variant="outlined"
                value={searchText}
                onChange={(e) => searchTextChange(e)}
                placeholder={searchLabel}
                fullWidth
                margin="normal"
            />
            {(page === 0 && loading) ?
                <div className="search-actors-filter-skeleton">
                    <Skeleton variant="rectangular"/>
                    <Skeleton variant="rectangular"/>
                    <Skeleton variant="rectangular"/>
                </div> :
                <List>
                    {items?.map((item, index) => {
                        return (
                            <InfiniteScrollItem
                                idx={index}
                                length={items.length}
                                infiniteScrollRef={infiniteScrollRef}
                                className="search-director-cell-div"
                            >
                                <ListItem key={item.id} className="search-director-cell">
                                    <Checkbox
                                        checked={isItemInFilter(item)}
                                        onChange={(e) => changeItemCheckInFilter(item, e.target.checked)}
                                    />
                                    {getListItemBody(item)}
                                </ListItem>
                            </InfiniteScrollItem>
                        );
                    })}
                    {hasMore && !loading && <div style={{height: '20px'}}></div>}
                    {loading && <Skeleton variant="rectangular"/>}
                </List>
            }
        </div>
    );
}