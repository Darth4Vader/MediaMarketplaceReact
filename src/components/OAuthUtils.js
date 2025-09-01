import {apiBaseUrl} from "../http/requests";

export const doGoogleLogin = (returnTo, navigate) => {
    let redirectUri = "";
    if(returnTo) {
        redirectUri = window.location.origin + returnTo;
    }
    else {
        redirectUri = window.location.origin;
    }

    const googleOAuthUrl = `/oauth2/authorization/google?returnUrl=${redirectUri}`;
    if(apiBaseUrl === "http://localhost:8080") {
        window.location.href = apiBaseUrl + googleOAuthUrl;
    }
    else {
        navigate(googleOAuthUrl);
    }
}