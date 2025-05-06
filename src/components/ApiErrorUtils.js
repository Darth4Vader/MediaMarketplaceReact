import {Navigate, useLocation} from "react-router-dom";
import {ErrorBoundary} from "react-error-boundary";
import React from "react";

export function AuthenticationFallback({ error }) {
    console.log("Rendering...");
    const returnTo = window.location.pathname;
    if (error?.status === 401) {
        return <Navigate to={`/login?return_to=${returnTo}`} replace/>;
    }
    throw error;
}

export function AuthenticationBoundary({ children, }) {
    const location =  useLocation();
    return (
        <ErrorBoundary key={location.pathname} fallbackRender={({ error, resetErrorBoundary }) => {
            return ( <AuthenticationFallback error={error}/> );
        }}>
            {children}
        </ErrorBoundary>
    );
}

export function NotFoundErrorBoundary({ children, fallbackRender}) {
    const errorHandler = (error, info) => {
        if(error.status === 404) {}
        else {
            throw error;
        }
    };
    return (
        <ErrorBoundary onError={errorHandler} fallbackRender={fallbackRender}>
            {children}
        </ErrorBoundary>
    );
}