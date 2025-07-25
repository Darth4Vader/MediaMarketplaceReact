import {Navigate, useLocation} from "react-router-dom";
import {ErrorBoundary} from "react-error-boundary";
import React from "react";
import './DefaultErrorPage.css'
import {apiBaseUrl} from "./http/requests";

const debugMode = true; // Set to true for development mode

export function DefaultErrorBoundary({ children }) {
    const location =  useLocation();
    return (
        <ErrorBoundary key={location.pathname} fallbackRender={({ error, resetErrorBoundary }) => {
            resetErrorBoundary(error);
            return ( <Navigate to={'/errorPage'}/> );
        }}>
            {children}
        </ErrorBoundary>
    );
}

function isPreviousPage(relativePath) {
    return document.referrer && document.referrer.length > 0 && document.referrer.startsWith(apiBaseUrl) && document.referrer.includes(relativePath);
}

function useCanNavigateFromError() {
    const navType = window.performance.getEntriesByType("navigation")[0]?.type;
    const canNavigate = sessionStorage.getItem("customNavType");
    console.log("Navigation type:", navType, "Can navigate:", canNavigate);
    console.log(window.performance.getEntries())

    if (navType === "reload") {
        sessionStorage.setItem("customNavType", "false");
        if (canNavigate === "true") {
            console.log("Navigateeeeed")
            return true;
        }
    }
    else {
        sessionStorage.setItem("customNavType", "true");
    }
    return false;
}

export function DefaultErrorPage({ error }) {
    const navigate = useCanNavigateFromError();
    if(navigate) {
        return <Navigate to={'/'} replace/>;
    }
    return (
            <div style={{
                textAlign: 'center',
                marginTop: '50px',
            }}
                 className={debugMode && "debug-error-page"}>
                <h1>Oops! Something went wrong.</h1>
                <text className="error-image">{'\u{1F622}'}</text>
                <p>{error?.message || "An unexpected error occurred."}</p>
                <p>Please try again later.</p>
            </div>
    );
}