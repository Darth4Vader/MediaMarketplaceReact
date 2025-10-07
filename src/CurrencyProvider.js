import React, {createContext, useContext, useState} from "react";

const CurrencyContext = createContext();

export const useCurrencyContext = () => {
    return useContext(CurrencyContext);
}

export const CurrencyProvider = ({ children }) => {
    // we will set this to Date.now() when we start searching
    const [currentCurrency, setCurrentCurrency] = useState(0);
    return (
        <CurrencyContext.Provider value={{ currentCurrency, setCurrentCurrency }} /*value={searchInputRef}*/>
            {children}
        </CurrencyContext.Provider>
    );
}