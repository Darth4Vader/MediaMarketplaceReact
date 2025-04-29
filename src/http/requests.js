import Cookies  from "js-cookie";
import { useNavigate} from "react-router";
import {Alert} from 'react-native';


const apiBaseUrl = 'http://192.168.1.237:8080';

export function useFetchRequests() {
    return {
        get: request('GET'),
        post: request('POST'),
        getWithAuth: requestWithAuth('GET'),
        putWithAuth: requestWithAuth('PUT'),
        postWithAuth: requestWithAuth('POST'),
        deleteWithAuth: requestWithAuth('DELETE'),
    };

    function createSettings(method, body) {
        const settings = {
            method: method,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        };
        if (body) {
            settings.body = JSON.stringify(body);
        }
        return settings;
    }

    function request(method) {
        return (uri, body, navigation) => {
            console.log(uri, body);
            const settings = createSettings(method, body);
            return fetch(`${apiBaseUrl}${uri}`, settings)
                .catch((err) => {
                    console.log("Error in fetch:");
                    return Promise.reject(err);
                });
        };
    }

    function requestWithAuth(method) {
        return async (uri, body, navigation) => {
            const settings = createSettings(method, body);
            const accessToken = Cookies.get('accessToken');
            if (!accessToken) {
                if(!Cookies.get('refreshToken')) {
                }
            }
            else {
                settings.headers.Authorization = `Bearer ${accessToken}`;
            }
            console.log(`${apiBaseUrl}${uri}`);
            return await fetch(`${apiBaseUrl}${uri}`, settings)
                .then(async function(response) {
                    console.log("Catched");
                    if (!response.ok) {
                        if (response.status === 401) {
                            console.log("401 Unauthorized");
                            // try to refresh token
                            console.log("Try to refresh token");
                            const refreshTokenResponse = await RefreshToken();
                            if (refreshTokenResponse == null) {
                                console.log("Attempt Request Second Time")
                                settings.headers.Authorization = `Bearer ${Cookies.get('accessToken')}`;
                                return await fetch(`${apiBaseUrl}${uri}`, settings)
                                    .then((response2) => {
                                        console.log("Second Attempt Response: ");
                                        console.log(response2);
                                        if (!response.ok) {
                                            if (response.status === 401) {
                                                // not authorized again. send to login page
                                                console.log("Failed again")
                                                Alert.alert("All Done!",
                                                    "You have successfully registered.",
                                                    [
                                                        {text: "OK",
                                                            onPress: () => {
                                                                navigation('/login', { replace: true });
                                                            }}
                                                    ]
                                                );
                                            }
                                        }
                                        return response2;
                                    })
                                    .catch((err) => {
                                        console.log("Error in fetch:");
                                        return Promise.reject(err);
                                        //throw err;
                                    });
                            }
                            else {
                                if (!refreshTokenResponse.ok) {
                                    if(refreshTokenResponse.status === 401) {
                                        console.log("401 Unauthorized Again Again");
                                        Alert.alert("All Done!",
                                            "You have successfully registered.",
                                            [
                                                {text: "OK",
                                                    onPress: () => {
                                                        navigation('/login', { replace: true });
                                                    }}
                                            ]
                                        );
                                        throw refreshTokenResponse;
                                        //return Promise.reject(refreshTokenResponse);
                                        //return null;
                                    }
                                }
                                console.log("Post failed");
                            }
                        }
                    }
                    return response;
                });
        }
    }

    async function RefreshToken() {
        const request = useFetchRequests();
        const refreshToken = Cookies.get('refreshToken');
        return await request.post(`/api/users/refresh`, { refreshToken })
            .then(async function(response) {
                console.log("Post ended");
                if (!response.ok) {
                    if(response.status === 401) {
                        console.log("401 Unauthorized Again");
                        // try to refresh token
                    }
                    return response;
                }
                const data = await response.json();
                saveTokens(data.accessToken, data.refreshToken);
                console.log("Token Refreshed Successfully");
                return null;
            })
            .catch((err) => {
                console.log("Error in fetch:");
                return Promise.reject(err);
                //throw err;
            });
    }
}

export function saveTokens(accessToken, refreshToken) {
    Cookies.set('accessToken', accessToken, { expires: 1 });
    Cookies.set('refreshToken', refreshToken, { expires: 1 });

    console.log("Tokens saved");
    console.log("Access Token: " + Cookies.get('accessToken'));
}