import logo from './marketplace_logo.png';
import {BrowserRouter, Routes, Route, useNavigate, Link} from 'react-router-dom';
import './App.css';
import HomePage from "./components/HomePage";
import LoadMoviePage from "./components/MoviePage";
import LoadCartPage from "./components/CartPage";
import Movie from "./components/Movie";
import LoadReviewPage from "./components/ReviewPage";
import AppBar from "./components/AppBar";
import LoginPage from "./LoginPage";
import RegisterPage from "./components/RegisterPage";

import { QueryClient, QueryClientProvider } from 'react-query';
import {ErrorBoundary} from "react-error-boundary";
import {Outlet} from "react-router";
import React from "react";

const HomeTemplate = () => {
    return (
        <div>
            <AppBar/>
            <Outlet/>
        </div>
    );
};

const LogTemplate = () => {
    return (
        <div>
            <div className="auth-header">
                <Link to="/">
                    <img src={logo} alt="Home" className="icon"/>
                </Link>
            </div>
            <Outlet/>
        </div>
    );
};

function App() {
    const navigate = useNavigate();
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
    const errorHandler = (error, info) => {
        console.log("GOODODOODOOD");
        console.log(error);
        if (error?.status === 401) {
            console.log("Good to see you");
            navigate("/login?return_to=" + window.location.pathname);
            // clean up session state and prompt for login
            // ex: window.location.reload();
        }
        else
            throw error;
    };
    return (
      <div className="App">
        <header className="App-header">
            <QueryClientProvider client={queryClient}>
                <ErrorBoundary onError={errorHandler} fallbackRender={({ error, resetErrorBoundary }) => {
                    resetErrorBoundary();
                    return (
                        <div>
                            <h2>Something went wrong:</h2>
                            <pre>{error.message}</pre>
                            <button onClick={() => resetErrorBoundary()}>Try again</button>
                        </div>
                    );
                }}>
            <Routes>
                <Route path="" element={<HomeTemplate />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/cart" element={<LoadCartPage />} />
                    <Route path="/movie/:id" element={<LoadMoviePage />} />
                    <Route path="/movie/:id/reviews" element={<LoadReviewPage />} />
                </Route>
                <Route path="" element={<LogTemplate />}>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                </Route>
            </Routes>
                </ErrorBoundary>
            </QueryClientProvider>
        </header>
      </div>
  );
}

/*
function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
          <HomePage></HomePage>
      </header>
    </div>
  );
}
*/

export default App;
