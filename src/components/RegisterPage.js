import React, { useState } from "react";
import { motion } from "framer-motion"; // fixed incorrect import
import { saveTokens } from '../http/requests';
import { useNavigate } from "react-router-dom";
import './RegisterPage.css'
import {EyeInvisibleOutlined, EyeOutlined} from "@ant-design/icons";
import {ShowHidePassword} from "./UtilsComponents";

const Card = ({ className = "", children }) => (
    <div className={`bg-white p-6 rounded-2xl shadow ${className}`}>{children}</div>
);

/*const CardContent = ({ children }) => (
    <div className="space-y-4">{children}</div>
);*/

const RegisterPage = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

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
            className="min-h-screen flex items-center justify-center bg-gray-100"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <Card className="w-full max-w-sm shadow-lg rounded-2xl">
                <div>
                    <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>
                    <form onSubmit={handleRegister} className="register-form">
                            <input
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
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
            </Card>
        </motion.div>
    );
};

export default RegisterPage;