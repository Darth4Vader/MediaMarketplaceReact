import React, {createContext, useCallback, useContext, useEffect, useState} from "react";
import {useApi} from "./http/api";

const AuthContext = createContext();

export const useAuthContext = () => {
    return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
    const { getLoggedUserName } = useApi();

    const [userInfo, setUserInfo] = useState(null);
    const [isLogged, setIsLogged] = useState(false);

    const userLogged = useCallback(async (isLogged) => {
        console.log("LOGGer")
        if(isLogged) {
            await getLoggedUserName()
                .then((user) => {

                    setUserInfo(user);
                    setIsLogged(true);
                })
                .catch((error) => {
                    setUserInfo(null);
                    setIsLogged(false);
                })
        }
        else {
            setUserInfo(null);
            setIsLogged(false);
        }
    }, []);

    /*
    const contextValue = useMemo(() => ({
        userMessage,
        userLogged
    }), [userMessage, userLogged]);

     */
    return (
        <AuthContext.Provider value={{userInfo, userLogged, isLogged}}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuthenticationCheck() {
    const { userLogged } = useAuthContext();
    const [isFinished, setIsFinished] = useState(false);

    useEffect(() => {
        const checkIfUserLogged = async () => {
            await userLogged(true); // check if user is logged in
            setIsFinished(true);
        }
        checkIfUserLogged();
    }, []);
    return isFinished;
}