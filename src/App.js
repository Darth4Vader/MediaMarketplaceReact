import logo from './marketplace_logo.png';
import {BrowserRouter, Routes, Route, useNavigate, Link, Navigate, useLocation} from 'react-router-dom';
import './App.css';
import HomePage from "./components/HomePage";
import LoadMoviePage from "./components/MoviePage";
import LoadCartPage from "./components/CartPage";
import Movie from "./components/Movie";
import LoadReviewPage from "./components/ReviewPage";
import MyAppBar from "./components/MyAppBar";
import LoginPage from "./LoginPage";
import RegisterPage from "./components/RegisterPage";

import { QueryClient, QueryClientProvider } from 'react-query';
import {ErrorBoundary} from "react-error-boundary";
import {isRouteErrorResponse, Outlet} from "react-router";
import React, {useEffect, useState} from "react";
import {useApi} from "./http/api";
import {ReactQueryDevtools} from "react-query/devtools";
import UserPageTemplate from "./components/UserPage";
import UserOrdersPage from "./components/UserOrdersPage";
import UserMediaCollectionPage from "./components/UserMediaCollectionPage";
import UserInformationPage from "./components/UserInformationPage";

import Cookies from "js-cookie";
import SearchPage from "./components/SearchPage";
import {createTheme, ThemeProvider} from "@mui/material";
import {AuthProvider, useAuthenticationCheck} from "./AuthProvider";
import {apiBaseUrl} from "./http/requests";
import {SearchInputProvider} from "./SearchInputProvider";
import {DefaultErrorBoundary, DefaultErrorPage} from "./DefaultErrorPage";
import {NotFoundPage} from "./NotFoundPage";

const theme = createTheme({
    components: {
        // Name of the component
        MuiButton: {
            styleOverrides: {
                root: {
                    color: "white",
                    borderColor: "white",
                    backgroundColor: "#1e3645"
                }
            }
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    color: "white",
                    "& label": {
                        color: "white"
                    },
                    "& .MuiOutlinedInput-root": {
                        color: "white",
                        "&.Mui-focused": {
                            color: "white",
                        }
                    },
                }
            }
        },
        MuiSelect: {
            styleOverrides: {
                root: {
                    color: "white",
                    "& .MuiSvgIcon-root": {
                        color: "white",
                    },
                    '.MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgb(255, 255, 255,0.3)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'white',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'white',
                    },
                }
            }
        },
        MuiSvgIcon: {
            styleOverrides: {
                root: {
                    color: 'white'
                },
            },
        }
    },

});

const AppTemplate = () => {
    const [position, setPosition] = useState(window.scrollY);
    const [visible, setVisible] = useState(true)
    useEffect(()=> {
        const handleScroll = () => {
            let moving = window.scrollY;

            setVisible(position > moving);
            setPosition(moving)
        };
        window.addEventListener("scroll", handleScroll);
        return(() => {
            window.removeEventListener("scroll", handleScroll);
        })
    })
    return (
        <ThemeProvider theme={theme}>
            <div className={`header-${visible ? "visible" : "hidden"}`}>
                <MyAppBar/>
            </div>
            <Outlet/>
        </ThemeProvider>
    );
};

const LogTemplate = () => {
    // we first check if the user is logged
    // if so then we redirect them back
    return (
        <div>
            <div className="auth-header">
                <Link to="./">
                    <img src={logo} alt="Home" className="icon"/>
                </Link>
            </div>
            <Outlet/>
        </div>
    );
};

const DefaultTemplate = () => {
    const isFinished = useAuthenticationCheck();

    return (
        <>
            {isFinished && <Outlet/>}
        </>
    );
};

const AuthRoute = () => {
    const { checkIfUserLogged } = useApi();
    const navigate = useNavigate();

    const response = checkIfUserLogged()
        .then((response) => {
            console.log(response);

            if (response.ok) {
                //user is logged in
                // go to previous page
                // check if the previous page is at the same site
                if(document.referrer && document.referrer.length > 0 && document.referrer.startsWith(apiBaseUrl)) {
                    navigate(-1);
                }
                else {
                    navigate("/");
                }
            }
            else {
                // it's ok
                // that means user is not authenticated
            }
        })
        .catch(err => {
            // it's ok
            // that means user is not authenticated
        });

    return <LogTemplate />;
};

function AuthenticationFallback({ error }) {
    console.log("Rendering...");
    const returnTo = window.location.pathname.replace("MediaMarketplaceReact/", "");
    if (error?.status === 401) {
        return <Navigate to={`./login?return_to=${returnTo}`} replace/>;
    }
    throw error;
}

function AuthenticationBoundary({ children }) {
    const location =  useLocation();
    return (
        <ErrorBoundary key={location.pathname} fallbackRender={({ error, resetErrorBoundary }) => {
            return ( <AuthenticationFallback error={error}/> );
        }}>
            {children}
        </ErrorBoundary>
    );
}

function setupCookies() {
    Cookies.set('timezone', Intl.DateTimeFormat().resolvedOptions().timeZone, {
        expires: 365
    });
}

function App() {
    useEffect(() => {
        setupCookies();
    }, []);
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                refetchOnWindowFocus: false,
            }
        },
        onError: err => {
            console.log("This is bad bad")
            if (err.response?.status === 401) {
                // clean up session state and prompt for login
                // ex: window.location.reload();
            }
        }
    });
    return (
        <DefaultErrorBoundary>
        <AuthProvider>
        <div className="App">
            <header className="App-header">
                    <SearchInputProvider>
                    <QueryClientProvider client={queryClient}>
                        <AuthenticationBoundary>
                            <Routes>
                                <Route path="" element={<AppTemplate />}>
                                    <Route path="" element={<DefaultTemplate />}>
                                        <Route index element={<HomePage />} />
                                        <Route path="search" element={<SearchPage />} />
                                        <Route path="cart" element={<LoadCartPage />} />
                                        <Route path="movie/:id" element={<LoadMoviePage />} />
                                        <Route path="movie/:id/reviews" element={<LoadReviewPage />} />
                                    </Route>
                                    <Route path="user" element={<UserPageTemplate/>}>
                                        <Route index element={<Navigate to="orders" replace />} />
                                        <Route path="orders" element={<UserOrdersPage />} />
                                        <Route path="collection" element={<UserMediaCollectionPage />} />
                                        <Route path="information" element={<UserInformationPage />} />
                                    </Route>
                                </Route>
                                <Route path="" element={<AuthRoute />}>
                                    <Route path="login" element={<LoginPage />} />
                                    <Route path="register" element={<RegisterPage />} />
                                </Route>
                                <Route path={"errorPage"} element={<DefaultErrorPage/>}/>
                                <Route path='*' exact={true} element={<NotFoundPage />} />
                            </Routes>
                        </AuthenticationBoundary>
                        {/*<ReactQueryDevtools initialIsOpen={true} />*/}
                    </QueryClientProvider>
                    </SearchInputProvider>
            </header>
        </div>
        </AuthProvider>
        </DefaultErrorBoundary>
    );
}

export default App;
