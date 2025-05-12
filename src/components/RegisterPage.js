import React, {useEffect, useRef, useState} from "react";
import { motion } from "framer-motion"; // fixed incorrect import
import {saveTokens, useFetchRequests} from '../http/requests';
import {Link, useNavigate} from "react-router-dom";
import './RegisterPage.css'
import {AuthLink, ShowHidePassword, useReturnToParam} from "./UtilsComponents";
import {FormHelperText, TextField} from "@mui/material";
import {SwitchTransition, CSSTransition} from "react-transition-group";

function importAll(r) {
    return r.keys().map(r);
}

const images = importAll(require.context('../assets/register-page', false, /\.(png|jpe?g|svg)$/));

const RegisterPage = () => {
    const { register } = useFetchRequests();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [usernameError, setUsernameError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [passwordConfirmError, setPasswordConfirmError] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const [currentIndex, setCurrentIndex] = useState(0);
    const nodeRef = useRef(null);
    const [loaded, setLoaded] = useState(false);
    const returnTo = useReturnToParam();

    useEffect(() => {
        setLoaded(true);
    }, []);

    const switchIndex = () => {
        if(currentIndex === images.length - 1) {
            setCurrentIndex(0);
        }
        else {
            setCurrentIndex(currentIndex + 1);
        }
    }

    const handleRegister = async (e) => {
        e.preventDefault();
        const response = await register(username, password, passwordConfirm);
        if (response.ok) {
            alert("Registration successful!");
            // Redirect to the returnTo URL
            navigate(returnTo);
        } else {
            if(response.status === 400) {
                // problem with input fields
                const vals = await response.json();
                console.log(vals);
                setError(vals.error);
                if(vals?.fields) {
                    if(vals.fields.username) {
                        setUsernameError(vals.fields.username);
                    }
                    if(vals.fields.password) {
                        setPasswordError(vals.fields.password);
                    }
                    if(vals.fields.passwordConfirm) {
                        setPasswordConfirmError(vals.fields.passwordConfirm);
                    }
                }
            }
            else if(response.status === 401) {
                // Password incorrect
                const err = await response.text();
                setPasswordError(err);
                setPasswordConfirmError(err);
            }
            else {
                // unkown error
                throw response;
            }
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
        <div className="register-page">
            <SwitchTransition>
                <CSSTransition classNames="register-image-swapper-fade"
                    nodeRef={nodeRef}
                    timeout={9000}
                    in={loaded}
                    unmountOnExit
                    onExited={() => switchIndex()}
                >
                    <div className="register-image-swapper-div">
                        <img className="register-image-swapper"
                            ref={nodeRef}
                            src={images[currentIndex]}
                            alt="logo"
                        />
                    </div>
                </CSSTransition>
            </SwitchTransition>
            <div className="register-panel">
                <h2>Register</h2>
                <div className="signIn-link">
                    <span>
                        <span>Already have an account? </span>
                        <AuthLink to="/login">
                            Sign in
                        </AuthLink>
                    </span>
                </div>
                <form onSubmit={handleRegister} className="register-form">
                    <TextField
                        type={"text"}
                        autoComplete="off"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        label="Username"
                        variant="outlined"
                    />
                    <ShowHidePassword
                        name="password"
                        value={password}
                        placeholder="Password"
                        onChange={(e) => setPassword(e.target.value)}
                        autocomplete="new-password"
                        errorMessage={passwordError}
                        setErrorMessage={setPasswordError}
                    />
                    <ShowHidePassword
                        name="password-confirm"
                        placeholder="Confirm Password"
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                        autocomplete="new-password"
                        errorMessage={passwordConfirmError}
                        setErrorMessage={setPasswordConfirmError}
                    />
                    <button type="submit" className="w-full">
                        Register
                    </button>
                    {error && (
                        <FormHelperText error>
                            {error}
                        </FormHelperText>
                    )}
                </form>
            </div>
        </div>
        </motion.div>
    );
};

export default RegisterPage;