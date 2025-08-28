import React, { useState } from "react";
import { motion } from "motion/react";
import { useFetchRequests, saveTokens } from './http/requests'
import {useNavigate} from "react-router-dom";
import {AuthLink, ShowHidePassword, useReturnToParam} from "./components/UtilsComponents";
import "./components/RegisterPage.css";
import TextField from "@mui/material/TextField";
import {apiBaseUrl} from "./http/requests";

import {
    Box,
    Button,
    Card,
    Checkbox,
    FormControl,
    FormControlLabel,
    FormHelperText, IconButton, styled,
    SvgIcon,
    Typography
} from "@mui/material";
import {useApi} from "./http/api";
import {useAuthContext} from "./AuthProvider";
import { ReactComponent as MarketplaceLogo} from './marketplace_logo.svg';
import Divider from '@mui/material/Divider';
import { ReactComponent as GoogleIcon} from './google_logo.svg';
import { Link as LinkBase } from '@mui/material';

const LoginCard = styled(Card)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignSelf: 'center',
    width: '100%',
    padding: theme.spacing(4),
    gap: theme.spacing(2),
    boxShadow:
        'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
    [theme.breakpoints.up('sm')]: {
        width: '450px',
    },
    ...theme.applyStyles('dark', {
        boxShadow:
            'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
    }),
}));

const LoginPage = () => {
    const { login } = useApi();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const returnTo = useReturnToParam();

    const { userLogged } = useAuthContext();

    const handleLogin = async (e) => {
        e.preventDefault();
        const response = await login(email, password);
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
                    if(vals.fields.email) {
                        setEmailError(vals.fields.email);
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
                setEmailError(err);
                setError("Problem with siging in");
            }
            else {
                // unkown error
                throw response;
            }
        }
    };

    const googleLogin = () => {
        const googleOAuthUrl = `/oauth2/authorization/google?redirect_uri=${window.location.origin}`;
        if(apiBaseUrl === "http://localhost:8080") {
            window.location.href = apiBaseUrl + googleOAuthUrl;
        }
        else {
            navigate(googleOAuthUrl);
        }
    }

    return (
        <LoginCard variant="outlined">
            <Box sx={{ display: { xs: 'flex', md: 'flex'} }}>
                <IconButton component={AuthLink} to='/'>
                    <SvgIcon fontSize="large">
                        <MarketplaceLogo />
                    </SvgIcon>
                </IconButton>
            </Box>
            <Typography
                component="h1"
                variant="h4"
                sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
            >
                Sign in
            </Typography>
            <Box
                component="form"
                onSubmit={handleLogin}
                noValidate
                sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 2 }}
            >
                <FormControl>
                    <TextField
                        type="text"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            setEmailError("");
                        }}
                        label={"Email"}
                        variant="outlined"
                        error={!!emailError}
                        helperText={emailError ? emailError : ""}
                    />
                </FormControl>
                <FormControl>
                    <ShowHidePassword
                        name="current-password"
                        value={password}
                        placeholder="Password"
                        onChange={(e) => setPassword(e.target.value)}
                        autocomplete="current-password"
                        errorMessage={passwordError}
                        setErrorMessage={setPasswordError}
                    />
                </FormControl>
                <FormControlLabel
                    control={<Checkbox value="remember" color="primary" />}
                    label="Remember me"
                />
                <Button
                    type="submit"
                    variant="contained"
                >
                    Login
                </Button>
                {error && (
                    <FormHelperText error>
                        {error}
                    </FormHelperText>
                )}
                <Typography sx={{ textAlign: 'center' }}>
                    Don't have an account?{' '}
                    <span>
                        <LinkBase
                            component={AuthLink}
                            to='/register'
                            variant="body2"
                            sx={{ alignSelf: 'center' }}
                        >
                            Create an Account
                        </LinkBase>
                    </span>
                </Typography>
                <Divider>or</Divider>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Button
                        fullWidth
                        variant="outlined"
                        onClick={googleLogin}
                        startIcon={<SvgIcon color="primary"> <GoogleIcon /> </SvgIcon>}
                    >
                        Sign in with Google
                    </Button>
                </Box>
            </Box>
        </LoginCard>
    );
};

export default LoginPage;