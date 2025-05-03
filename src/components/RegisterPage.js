import React, {useRef, useState} from "react";
import { motion } from "framer-motion"; // fixed incorrect import
import { saveTokens } from '../http/requests';
import {Link, useNavigate} from "react-router-dom";
import './RegisterPage.css'
import {ShowHidePassword} from "./UtilsComponents";
import {TextField} from "@mui/material";
import {SwitchTransition, CSSTransition} from "react-transition-group";

function importAll(r) {
    return r.keys().map(r);
}

const images = importAll(require.context('../assets/register-page', false, /\.(png|jpe?g|svg)$/));

const RegisterPage = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const [currentIndex, setCurrentIndex] = useState(0);
    const nodeRef = useRef(null);

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

        /*
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
         */

        try {
            const response = await fetch("http://localhost:8080/api/users/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            });
            if (response.ok) {
                const data = await response.json();
                alert("Registration successful!");
                saveTokens(data.accessToken, data.refreshToken);
                navigate("/login");
            } else {
                const err = await response.text();
                setError(err || "Registration failed.");
            }
        } catch (err) {
            console.error(err);
            setError("An error occurred during registration.");
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
                        <Link to="/login">Sign in</Link>
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
                    />
                    <ShowHidePassword
                        name="password-confirm"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        autocomplete="new-password"
                    />
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <button type="submit" className="w-full">
                        Register
                    </button>
                </form>
            </div>
        </div>
        </motion.div>
    );
};

export default RegisterPage;