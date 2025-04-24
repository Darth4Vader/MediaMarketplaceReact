import { reject } from "react";
import Cookies  from "js-cookie";


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
    try {
        const response = await fetch(`${apiBaseUrl}${uri}`, settings)
            .catch((err) => {
                console.log("Error in fetch:");
                return Promise.reject(err);
                //throw err;
            });

        /*if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        const data = await response.json();
        return data;*/
        //console.log(response.json());
        return response;
    }
    catch (error) {
        console.log("Error fetching data:");
        //window.alert();
        //return Promise.reject(error);
        //throw error;
    }
}

export async function getDataWithAuth(uri) {
    const settings = {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        }
    };
    return fetchWithAuth(uri, settings);
}

async function fetchWithAuth(uri, settings) {
    console.log("get cookie: " + Cookies.get('accessToken'));
    settings.headers.Authorization = `Bearer ${Cookies.get('accessToken')}`;
    console.log(`${apiBaseUrl}${uri}`);
    try {
        let response = await fetch(`${apiBaseUrl}${uri}`, settings)
            .catch((err) => {
                console.log("Error in fetch:");
                return Promise.reject(err);
                //throw err;
            });
        if (!response.ok) {
            if(response.status === 401) {
                console.log("401 Unauthorized");
                // try to refresh token
                if(refreshToken()) {
                    settings.headers.Authorization = `Bearer ${Cookies.get('accessToken')}`;
                    response = await fetch(`${apiBaseUrl}${uri}`, settings)
                        .catch((err) => {
                            console.log("Error in fetch:");
                            return Promise.reject(err);
                            //throw err;
                        });
                }
            }
        }
        return response;
    }
    catch (error) {
        console.log("Error fetching data:");
        //window.alert();
        //return Promise.reject(error);
        //throw error;
    }
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
    try {
        const response = await fetch(`${apiBaseUrl}/api/users/refresh`, settings)
            .catch((err) => {
                console.log("Error in fetch:");
                return Promise.reject(err);
                //throw err;
            });

        if (!response.ok) {
            if(response.status == 401) {
                console.log("401 Unauthorized Again");
                // try to refresh token
            }
            return false;
        }
        const data = await response.json();
        saveTokens(data.accessToken, data.refreshToken);
        return true;
    }
    catch (error) {
        console.log("Error fetching data: ");
        console.error(error);
        //window.alert();
        //return Promise.reject(error);
        //throw error;
    }
}

export function saveTokens(accessToken, refreshToken) {
    Cookies.set('accessToken', accessToken, { expires: 1 });
    Cookies.set('refreshToken', refreshToken, { expires: 1 });

    console.log("Tokens saved");
    console.log("Access Token: " + Cookies.get('accessToken'));
}

export async function get(uri) {
    const settings = {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        }
    };
    console.log(`${apiBaseUrl}${uri}`);
    try {
        const response = await fetch(`${apiBaseUrl}${uri}`, settings)
            .catch((err) => {
                console.log("Error in fetch:");
                return Promise.reject(err);
                //throw err;
            });

        /*if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        const data = await response.json();
        return data;*/
        //console.log(response.json());
        return response;
    }
    catch (error) {
        console.log("Error fetching data:");
        //return Promise.reject(error);
        //throw error;
    }
}


