import React, { useState } from "react";
import { motion } from "motion/react";
import { useFetchRequests, saveTokens } from './http/requests'
import {useNavigate} from "react-router-dom";
import {AuthLink, ShowHidePassword, useReturnToParam} from "./components/UtilsComponents";
import "./components/RegisterPage.css";
import TextField from "@mui/material/TextField";
import {FormHelperText} from "@mui/material";
import {useApi} from "./http/api";
import {useAuthContext} from "./AuthProvider";

const LoginPage = () => {
    const { login } = useApi();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [usernameError, setUsernameError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const returnTo = useReturnToParam();

    const { userLogged } = useAuthContext();

    const handleLogin = async (e) => {
        e.preventDefault();
        const response = await login(username, password);
        if (response.ok) {
            console.log("Login successful");
            await userLogged(true);
            // Redirect to the returnTo URL
            navigate(returnTo);

        } else {
            if(response.status === 400) {
                // problem with input fields
                const vals = await response.json();
                setError(vals.error);
                if(vals?.fields) {
                    if(vals.fields.username) {
                        setUsernameError(vals.fields.username);
                    }
                    if(vals.fields.password) {
                        setPasswordError(vals.fields.password);
                    }
                }
            }
            else if(response.status === 401) {
                // Password incorrect
                const err = await response.text();
                setPasswordError(err);
            }
            else if(response.status === 404) {
                //user was not found
                const err = await response.text();
                setUsernameError(err);
                setError("Problem with siging in");
            }
            else {
                // unkown error
                throw response;
            }
        }
    };

    return (
        <motion.div
            className="min-h-screen flex items-center justify-center bg-gray-100"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div>
                <div>
                    <div className="register-panel">
                        <h2>Login</h2>
                        <div className="signIn-link">
                            <span>
                                <span>New User? </span>
                                <AuthLink to='/register'>
                                    Create an Account
                                </AuthLink>
                            </span>
                        </div>
                        <form onSubmit={handleLogin} className="register-form">
                            <TextField
                                type="text"
                                autoComplete="username"
                                value={username}
                                onChange={(e) => {
                                    setUsername(e.target.value);
                                    setUsernameError("");
                                }}
                                label={"Username"}
                                variant="outlined"
                                error={!!usernameError}
                                helperText={usernameError ? usernameError : ""}
                            />
                            <ShowHidePassword
                                name="current-password"
                                value={password}
                                placeholder="Password"
                                onChange={(e) => setPassword(e.target.value)}
                                autocomplete="current-password"
                                errorMessage={passwordError}
                                setErrorMessage={setPasswordError}
                            />
                            <button type="submit">
                                Login
                            </button>
                            {error && (
                                <FormHelperText error>
                                    {error}
                                </FormHelperText>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default LoginPage;