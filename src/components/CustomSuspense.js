import React, {Fragment, useEffect} from "react";
import {Fade} from "@mui/material";

export const CustomSuspense = ({ fallbackComponent, isPageLoaded, children }) => {
    const [showSkeleton, setShowSkeleton] = React.useState(false);
    const [showContent, setShowContent] = React.useState(false);

    useEffect(() => {
        // first chek if page loaded
        if (!isPageLoaded) {
            // if not loaded, show skeleton (only if content not showing)
            if(!showContent)
                setShowSkeleton(true);
            else {
                // otherwise don't show content
                setShowContent(false);
            }
            //setShowContent(false); // reset when loading
        }
        else {
            // if showing then check if skeleton is showing
            if(showSkeleton) {
                // if showing then fade out
                setShowSkeleton(false);
            }
            else {
                // if not showing then show content directly
                //setShowContent(true);
            }
        }
    }, [isPageLoaded]);

    return (
        <Fragment>
            {/* Fade skeleton out when loaded */}
            <Fade in={showSkeleton} unmountOnExit
                  onExited={() => {
                      setShowContent(true);
                  }} // trigger fade-in after fade-out
            >
                {fallbackComponent}
            </Fade>

            {/* Only render content when paginationLoaded is true */}
            <Fade in={showContent} unmountOnExit
                  onExited={() => {
                      setShowSkeleton(true);
                  }}
            >
                {children}
            </Fade>
        </Fragment>
    );
}

export const CustomSuspenseOnlyInFirstLoad = ({ fallbackComponent, isPageLoaded, children }) => {
    const [showSkeleton, setShowSkeleton] = React.useState(false);
    const [showContent, setShowContent] = React.useState(false);
    const [firstLoad, setFirstLoad] = React.useState(true);

    useEffect(() => {
        if(firstLoad) {
            if (!isPageLoaded) {
                setShowContent(false); // reset when loading
            }
            setShowSkeleton(!isPageLoaded);
        }
    }, [isPageLoaded]);

    useEffect(() => {
        if(showContent) {
            setFirstLoad(false);
        }
    }, [showContent])

    return (
        <Fragment>
            {/* Fade skeleton out when loaded */}
            <Fade in={showSkeleton} unmountOnExit
                  onExited={() => setShowContent(true)} // trigger fade-in after fade-out
            >
                {fallbackComponent}
            </Fade>

            {/* Only render content when paginationLoaded is true */}
            <Fade in={showContent} timeout={600} unmountOnExit>
                {children}
            </Fade>
        </Fragment>
    );
}