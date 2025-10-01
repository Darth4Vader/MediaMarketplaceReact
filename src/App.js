import logo from './marketplace_logo.png';
import {BrowserRouter, Routes, Route, useNavigate, Link, Navigate, useLocation} from 'react-router-dom';
import './App.css';
import HomePage from "./components/HomePage";
import LoadMoviePage from "./components/MoviePage";
import LoadCartPage from "./components/CartPage";
import Movie from "./components/Movie";
import LoadReviewPage from "./components/ReviewPage";
import {MyAppBar} from "./components/MyAppBar";
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
import {createTheme, CssBaseline, Stack, styled, ThemeProvider} from "@mui/material";
import {AuthProvider, useAuthenticationCheck} from "./AuthProvider";
import {apiBaseUrl} from "./http/requests";
import {SearchInputProvider} from "./SearchInputProvider";
import {DefaultErrorBoundary, DefaultErrorPage} from "./DefaultErrorPage";
import {NotFoundPage} from "./NotFoundPage";
import ResetPasswordPage from "./components/ResetPasswordPage";
import EmailVerificationPage from "./components/EmailVerificationPage";
import {AuthenticationBoundary} from "./components/ApiErrorUtils";

const theme = createTheme({
    palette: {
        mode: 'dark',
    },
});

const AppTemplate = () => {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline enableColorScheme/>
            <MyAppBar/>
            <Outlet/>
        </ThemeProvider>
    );
};

const SignUpContainer = styled(Stack)(({ theme }) => ({
    height: 'calc((1 - var(--template-frame-height, 0)) * 100dvh)',
    minHeight: '100%',
    padding: theme.spacing(2),
    [theme.breakpoints.up('sm')]: {
        padding: theme.spacing(4),
    },
    '&::before': {
        content: '""',
        display: 'block',
        position: 'absolute',
        zIndex: -1,
        inset: 0,
        backgroundImage:
            'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
        backgroundRepeat: 'no-repeat',
        ...theme.applyStyles('dark', {
            backgroundImage:
                'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
        }),
    },
}));



const LogTemplate = () => {
    // we first check if the user is logged
    // if so then we redirect them back
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline enableColorScheme />
            <SignUpContainer direction="column" justifyContent="center">
                <Outlet/>
            </SignUpContainer>
        </ThemeProvider>
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
                                    <Route path="verifyAccount" element={<EmailVerificationPage />}></Route>
                                </Route>
                                <Route path="resetPassword" element={<ResetPasswordPage />} />
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
