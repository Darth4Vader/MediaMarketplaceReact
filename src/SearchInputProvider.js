import React, {createContext, useContext, useState} from "react";

const SearchInputContext = createContext();

export const useSearchInputContext = () => {
    return useContext(SearchInputContext);
}

export const SearchInputProvider = ({ children }) => {
    const [searchInput, setSearchInput] = useState("");
    // we will set this to Date.now() when we start searching
    const [isSearching, setIsSearching] = useState(0);
    return (
        <SearchInputContext.Provider value={{ searchInput, setSearchInput, isSearching, setIsSearching }} /*value={searchInputRef}*/>
            {children}
        </SearchInputContext.Provider>
    );
}