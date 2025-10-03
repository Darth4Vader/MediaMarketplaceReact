import {useApi} from "../http/api";
import React, {useEffect, useRef, useState} from "react";
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
import {useSearchParams} from "react-router-dom";
import {compareArrays, hasStringChanged, normalizeToArray, parseStringAsNumberArray} from "./UtilsFunctions";

export default function SearchPage(props) {
    console.log("search");

    const { searchMovies, getGenres, getPeople } = useApi();
    const [movies, setMovies] = useState([]);
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [selectedActors, setSelectedActors] = useState([]);
    const [selectedDirectors, setSelectedDirectors] = useState([]);

    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const infiniteScrollRef = useInfiniteScrollRefPage(setPage, loading, hasMore);

    const [sortOption, setSortOption] = useState("");

    const { searchInput, setSearchInput, isSearching } = useSearchInputContext();

    const [searchParams, setSearchParams] = useSearchParams({});

    const [loadPage, setLoadPage] = useState(false);

    const fetchMovies = async (pageNumber: number) => {
        const fetchMoviesFunction = async (pageNum) => {
            const data = await searchMovies(pageNum, 8, searchParams)
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
        if(loadPage) {
            if (searchInput && searchInput.length > 0) {
                fetchMoviesFirstPage();
            }
        }
    }, [isSearching]);

    const isUpdateSearchParams = useRef(false);

    useEffect(() => {
        const loadCategoryItemsAsync = async() => {
            if(searchParams.get("name")) {
                setSearchInput(searchParams.get("name"));
            }
            const newSearchParams = new URLSearchParams(searchParams);
            await loadCategoryItems("genres", getGenres, setSelectedGenres, isUpdateSearchParams, newSearchParams);
            await loadCategoryItems("actors", getPeople, setSelectedActors, isUpdateSearchParams, newSearchParams);
            await loadCategoryItems("directors", getPeople, setSelectedDirectors, isUpdateSearchParams, newSearchParams);
            if(isUpdateSearchParams.current) {
                isUpdateSearchParams.current = false;
                const newUrl = `${window.location.pathname}?${newSearchParams.toString()}`;
                window.history.replaceState(null, '', newUrl);
            }
            else
                setLoadPage(true);
        }
        loadCategoryItemsAsync();
    }, [])

    useEffectAfterPageRendered(async () => {
        console.log("search page");
        if(loadPage)
            await fetchMovies(page);
    }, [page]);

    useEffectAfterPageRendered(() => {
        if(loadPage) {
            if (hasStringChanged(searchParams.get("sort"), sortOption)) {
                setSearchParams((prevSearchParams) => {
                    const newSearchParams = new URLSearchParams(prevSearchParams);
                    if (sortOption) {
                        newSearchParams.set("sort", sortOption);
                    } else {
                        newSearchParams.delete("sort"); // cleanly remove from URL if none
                    }
                    return newSearchParams;
                });
            }
        }
    }, [sortOption, loadPage]);


    useEffect(() => {
        if(loadPage) {
            if (hasStringChanged(searchParams.get("name"), searchInput)) {
                setSearchParams((prevSearchParams) => {
                    const newSearchParams = new URLSearchParams(prevSearchParams);
                    if (searchInput && searchInput.length > 0) {
                        newSearchParams.set("name", searchInput);
                    } else {
                        newSearchParams.delete("name"); // cleanly remove from URL if none
                    }
                    return newSearchParams;
                });
            }
        }
    }, [searchInput, loadPage]);

    useEffect(() => {
        if(loadPage)
            fetchMoviesFirstPage();
    }, [searchParams, loadPage])

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
                            <GenreFilter selectedGenres={selectedGenres} setSelectedGenres={setSelectedGenres} setSearchParams={setSearchParams} />
                        </SearchPageListItem>
                        <SearchPageListItem text="Actors" icon={<ActorImage/>}>
                            <ActorsFilter selectedActors={selectedActors} setSelectedActors={setSelectedActors} setSearchParams={setSearchParams} />
                        </SearchPageListItem>
                        <SearchPageListItem text="Directors" icon={<DirectorImage/>}>
                            <DirectorsFilter selectedDirectors={selectedDirectors} setSelectedDirectors={setSelectedDirectors} setSearchParams={setSearchParams} />
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

const loadCategoryItems = async(categoryName, getItemsFunction, setSelectedItems, searchParamsChangedRef, searchParams) => {
    if (searchParams.get(categoryName)) {
        const searchIds = parseStringAsNumberArray(searchParams.get(categoryName));
        const fetchedItems = await getItemsFunction(searchIds);
        const fetchedIds = fetchedItems?.map(genre => genre.id) || [];
        if (!compareArrays(searchIds, fetchedIds)) {
            searchParamsChangedRef.current = true;
            updateSearchParamCategory(searchParams, categoryName, fetchedItems);
        }
        setSelectedItems(fetchedItems || []);
    } else {
        setSelectedItems([]);
    }
}

const updateSearchParamCategory = (searchParams, categoryName, selectedItems) => {
    if (selectedItems.length > 0) {
        const categoryIds = selectedItems.map(item => item.id).join(',');
        searchParams.set(categoryName, categoryIds);
    } else {
        searchParams.delete(categoryName); // cleanly remove from URL if none
    }
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

function textAlphanumericFilter(setText) {
    return (e) => {
        const ALPHA_NUMERIC_DASH_REGEX = /^[a-zA-Z0-9- ]+$/;
        const value = e.target.value;
        if (value !== "" && !ALPHA_NUMERIC_DASH_REGEX.test(value)) {
            return;
        }
        setText(value);
    };
}

const GenreFilter = ({ selectedGenres, setSelectedGenres, setSearchParams }) => {
    const { searchGenres } = useApi();
    const fetchSearchGenres = async (text, pageNum) => await searchGenres(text, pageNum, 3);

    return (
        <CategoryFilter
            categoryName = "genres"
            selectedItems={selectedGenres}
            setSelectedItems={setSelectedGenres}
            setSearchParams={setSearchParams}
            getListItemBody={(genre) => {
                return <ListItemText primary={genre?.name} />
            }}
            fetchSearchItems={fetchSearchGenres}
            searchLabel="Search for genres..."
        />
    );
}

const ActorsFilter = ({ selectedActors, setSelectedActors, setSearchParams }) => {
    const { searchActors } = useApi();
    const fetchSearchActors = async (text, pageNum) => await searchActors(text, pageNum, 3);

    return (
        <CategoryFilter
            categoryName = "actors"
            selectedItems={selectedActors}
            setSelectedItems={setSelectedActors}
            setSearchParams={setSearchParams}
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

const DirectorsFilter = ({ selectedDirectors, setSelectedDirectors, setSearchParams }) => {
    const { searchDirectors } = useApi();
    const fetchSearchDirectors = async (text, pageNum) => await searchDirectors(text, pageNum, 3);

    return (
        <CategoryFilter
            categoryName = "directors"
            selectedItems={selectedDirectors}
            setSelectedItems={setSelectedDirectors}
            setSearchParams={setSearchParams}
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

const CategoryFilter = ({ categoryName, selectedItems, setSelectedItems, setSearchParams, getListItemBody, fetchSearchItems, searchLabel }) => {
    const removeFromFilter = removeFromSelectedItems(selectedItems, setSelectedItems);
    const isItemInFilter = isItemChecked(selectedItems);
    const changeItemCheckInFilter = changeItemCheckedValue(selectedItems, setSelectedItems);

    useEffectAfterPageRendered(() => {
        setSearchParams((prevSearchParams) => {
            const newSearchParams = new URLSearchParams(prevSearchParams);
            updateSearchParamCategory(newSearchParams, categoryName, selectedItems);
            return newSearchParams;
        });
    }, [selectedItems])

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

    const searchTextChange = textAlphanumericFilter(setSearchText);

    const { handleKeyDown } = usePaginationTextSearch(page, setPage, loading, setLoading, searchText, fetchSearchItems, setItems, setHasMore, 1000);

    return (
        <div className="search-actors-filter">
            <TextField
                label={searchLabel}
                variant="outlined"
                value={searchText}
                onChange={(e) => searchTextChange(e)}
                onKeyDown={handleKeyDown}
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

const usePaginationTextSearch = (page, setPage, loading, setLoading, searchText, fetchSearchItems, setItems, setHasMore, searchTimeout) => {
    const [debouncedInput, setDebouncedInput] = useState('');
    const debounceTimerRef = useRef(null);

    const lockRef = useRef(false); // 🔒 Prevents starting debounce during search

    const searchSessionRef = useRef(0); // 🆔 Each new search gets a new ID


    const [subLoading, setSubLoading] = useState(false);
    const [subHasMore, setSubHasMore] = useState(false);
    const [newSearch, setNewSearch] = useState(false);

    const setItemsInSession = (sessionId) => {
        return (newItems) => {
        if(sessionId === searchSessionRef.current) { // ✅ Only update if this fetch is still valid
                setItems(newItems);
            }
        }
    }

    // search first page
    const runSearch = async (query) => {
        if (!query) return;
        if (lockRef.current) return;

        lockRef.current = true; // 🔒 Block new timers
        searchSessionRef.current += 1; // 🚨 Invalidate all old fetches
        const sessionId = searchSessionRef.current;

        setItems([]);
        setPage(0);
        const fetchSearchPaginationItems = fetchPagination(
            fetchSearchItems,
            setItemsInSession(sessionId),
            setHasMore,
            loading,
            setLoading
        );

        await fetchSearchPaginationItems(query, 0);
        lockRef.current = false; // 🔓 Unlock for next debounce
    };

    // search new text (can wait until old search finishes and then searches the next text)
    const runNewSearch = async (query) => {
        // Trigger immediate search
        if(!loading) {
            await runSearch(query);
        }
        else {
            setNewSearch(true);
            setLoading(false);
        }
    }

    // search next page
    useEffectAfterPageRendered( () => {
        if (page === 0) return; // Skip if it's the initial page handled by runSearch

        const run = async () => {
            const sessionId = searchSessionRef.current;
            setLoading(true);
            const fetchSearchPaginationItems = fetchPagination(
                fetchSearchItems,
                setItemsInSession(sessionId),
                setSubHasMore,
                subLoading,
                setSubLoading
            );

            await fetchSearchPaginationItems(searchText, page);
            if(sessionId === searchSessionRef.current) {
                setLoading(false);
                setHasMore(subHasMore);
            }
        }
        run();
    }, [page]);

    // Called when user types, will have a timer of input seconds until search begins (text change will reset the timer)
    useEffect(() => {
        if (lockRef.current) return;

        // Reset previous timer if it exists
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        // Start new debounce timer
        debounceTimerRef.current = setTimeout(() => {
            setDebouncedInput(searchText);
        }, searchTimeout); // ⏲️ timeout seconds

        return () => {
            clearTimeout(debounceTimerRef.current);
        };
    }, [searchText]);

    // When debounce completes and input is ready, run the task
    useEffect(() => {
        if (debouncedInput) {
            runNewSearch(debouncedInput);
        }
    }, [debouncedInput]);

    // Handle Enter key press
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            if (lockRef.current) return;

            // Cancel pending debounce
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
                debounceTimerRef.current = null;
            }

            runNewSearch(searchText);
        }
    };

    // if loading changes, stops loading, and there is a new search pending, run it
    useEffect(() => {
        if(!loading) {
            if(newSearch) {
                setNewSearch(false);
                runSearch(searchText);
            }
        }
    }, [loading]);

    return { handleKeyDown };
}

function fetchPagination(fetchFunction, setItems, setHasMore, loading, setLoading) {
    return async (text, pageNum: number) => {
        const fetchItemsFunction = async (text, pageNumber) => {
            const data = await fetchFunction(text, pageNumber);
            console.log(data);
            console.log("Last", data?.last);
            setItems((prevItems) => {
                if (pageNumber === 0) {
                    return data?.content || [];
                } else {
                    return [...prevItems, ...data?.content || []];
                }
            });
            setHasMore(!data.last);
        }
        const wrapFunction = async (pageNumber) => { await fetchItemsFunction(text, pageNumber); };
        await infiniteScrollFetchWrapper(wrapFunction, pageNum, loading, setLoading, setHasMore);
    }
}