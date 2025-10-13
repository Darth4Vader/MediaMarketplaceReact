import React, {createContext, useContext} from "react";
import {useMediaQuery, useTheme} from "@mui/material";

const ScreenContext = createContext();

export const useScreenContext = () => {
    return useContext(ScreenContext);
}

export const ScreenProvider = ({ children }) => {
    // get the current screen size
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // sm = 600px
    return (
        <ScreenContext.Provider value={{ isMobile }}>
            {children}
        </ScreenContext.Provider>
    );
}