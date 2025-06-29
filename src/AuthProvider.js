import React, {createContext, useCallback, useContext, useEffect, useState} from "react";
import {useApi} from "./http/api";

const AuthContext = createContext();

export const useAuthContext = () => {
    return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
    const { getLoggedUserName } = useApi();

    const [userMessage, setUserMessage] = useState('User Not Logged');

    const userLogged = useCallback(async (isLogged) => {
        console.log("LOGGer")
        if( isLogged) {
            const info = await getLoggedUserName();
            console.log("Too Buy");
            console.log(info.name);
            //navigate(-1);
            setUserMessage(info.name);
        }
        else {
            setUserMessage("User Not Logged");
        }
    }, []);

    useEffect(() => {
        getLoggedUserName()
            .then((name) => {
                console.log("User Logged In");
                console.log(name);
                setUserMessage(name.name);
            })
            .catch((error) => {
                setUserMessage("User Not Logged");
            })
    }, []);

    /*
    const contextValue = useMemo(() => ({
        userMessage,
        userLogged
    }), [userMessage, userLogged]);

     */
    return (
        <AuthContext.Provider value={{userMessage, userLogged}}>
            {children}
        </AuthContext.Provider>
    );
}