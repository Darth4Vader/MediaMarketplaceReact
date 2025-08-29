import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Box, Typography, Button, CircularProgress, Alert } from "@mui/material";
import { useApi } from "../http/api";
import {Turnstile} from "@marsidev/react-turnstile";
import {TURNSTILE_SITE_KEY} from "../http/requests";

const EmailVerificationPage = () => {
    const { verifyAccount } = useApi();
    const [status, setStatus] = useState("loading"); // 'loading' | 'success' | 'error'
    const [errorMessage, setErrorMessage] = useState("");
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [turnstileToken, setTurnstileToken] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        const verifyEmail = async () => {
            const token = searchParams.get("token");

            if (!token) {
                setStatus("error");
                setErrorMessage("Verification token is missing.");
                return;
            }


            if (!turnstileToken) {
                setStatus("error");
                setErrorMessage("Please complete the verification challenge.");
                return;
            }

            const response = await verifyAccount(token);
            if (response.ok) {
                const text = await response.text();
                alert(text);
                setStatus("success");
            } else {
                if (response.status === 404) {
                    // token not found
                    const err = await response.text();
                    setStatus("error");
                    setErrorMessage(err);
                } else {
                    // unkown error
                    throw response;
                }
            }
        };

        verifyEmail();
    }, [searchParams, turnstileToken]);

    const handleGoHome = () => navigate("/");
    const handleLogin = () => navigate("/login");

    return (
        <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="60vh"
            flexDirection="column"
            px={2}
        >
            {status === "loading" && (
                <>
                    <CircularProgress />
                    <Typography variant="h6" mt={2}>
                        Verifying your email...
                    </Typography>
                </>
            )}

            {status === "success" && (
                <>
                    <Alert severity="success" sx={{ mb: 2 }}>
                        🎉 Your email has been successfully verified!
                    </Alert>
                    <Button variant="contained" onClick={handleLogin}>
                        Go to Login
                    </Button>
                </>
            )}

            {status === "error" && (
                <>
                    <Alert severity="error" sx={{ mb: 2 }}>
                        ❌ {errorMessage}
                    </Alert>
                    <Button variant="outlined" onClick={handleGoHome}>
                        Go to Home
                    </Button>
                </>
            )}

            <Turnstile
                siteKey={TURNSTILE_SITE_KEY} // <-- replace with your key
                onSuccess={(token) => {
                    setTurnstileToken(token);
                    setError("");
                }}
                onExpire={() => {
                    setTurnstileToken(null);
                    setError("CAPTCHA expired, please verify again.");
                }}
                onError={() => {
                    setTurnstileToken(null);
                    setError("CAPTCHA verification failed, please try again.");
                }}
            />
        </Box>
    );
};

export default EmailVerificationPage;