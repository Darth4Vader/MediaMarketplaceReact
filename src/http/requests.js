import Cookies  from "js-cookie";
import { useNavigate} from "react-router";
import {Alert} from 'react-native';


const apiBaseUrl = 'http://192.168.1.237:8080';

export async function getData(uri) {
    const settings = {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        }
    };
    console.log(`${apiBaseUrl}${uri}`);
    return await fetch(`${apiBaseUrl}${uri}`, settings)
        .catch((err) => {
            console.log("Error in fetch:");
            return Promise.reject(err);
        });
}

export async function getDataWithAuth(uri, navigation) {
    const settings = {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
    };
    /*
    if(jsonData) {
        settings.headers.body = jsonData;
    }
     */
    return await fetchWithAuth(uri, settings, navigation);
}

export async function postDataWithAuth(uri, jsonData, navigation) {
    const settings = {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: jsonData
    };
    return await fetchWithAuth(uri, settings, navigation);
}

export async function putDataWithAuth(uri, jsonData, navigation) {
    const settings = {
        method: 'PUT',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: jsonData
    };
    return await fetchWithAuth(uri, settings, navigation);
}

async function fetchWithAuth(uri, settings, navigation) {
    console.log("get cookie: " + Cookies.get('accessToken'));
    settings.headers.Authorization = `Bearer ${Cookies.get('accessToken')}`;
    console.log(`${apiBaseUrl}${uri}`);
    //try {
    return await fetch(`${apiBaseUrl}${uri}`, settings)
        .then(async function(response) {
            console.log("Catched");
            if (!response.ok) {
                if (response.status === 401) {
                    console.log("401 Unauthorized");
                    // try to refresh token
                    console.log("Try to refresh token");
                    const refreshTokenResponse = await refreshToken();
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
                        if (!response.ok) {
                            if(response.status === 401) {
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
                                //return null;
                            }
                        }
                        console.log("Post failed");
                    }
                }
            }
            return response;
        });
    /*}
    catch (error) {
        console.log("Error fetching data:");
        //window.alert();
        //return Promise.reject(error);
        //throw error;
    }*/
}

async function refreshToken() {
    const refreshToken = Cookies.get('refreshToken');
    //Cookies.remove('refreshToken');
    //Cookies.remove('accessToken');
    console.log("jjjj " + refreshToken);
    const settings = {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
    };
    return await fetch(`${apiBaseUrl}/api/users/refresh`, settings)
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

export function saveTokens(accessToken, refreshToken) {
    Cookies.set('accessToken', accessToken, { expires: 1 });
    Cookies.set('refreshToken', refreshToken, { expires: 1 });

    console.log("Tokens saved");
    console.log("Access Token: " + Cookies.get('accessToken'));
}