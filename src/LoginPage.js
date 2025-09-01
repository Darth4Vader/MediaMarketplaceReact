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
    Checkbox, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
    FormControl,
    FormControlLabel,
    FormHelperText, IconButton, OutlinedInput, styled,
    SvgIcon,
    Typography
} from "@mui/material";
import {useApi} from "./http/api";
import {useAuthContext} from "./AuthProvider";
import { ReactComponent as MarketplaceLogo} from './marketplace_logo.svg';
import Divider from '@mui/material/Divider';
import { ReactComponent as GoogleIcon} from './google_logo.svg';
import { Link as LinkBase } from '@mui/material';
import Alert from "@mui/material/Alert";
import {LoginCard} from "./components/UserLogUtils";
import {doGoogleLogin} from "./components/OAuthUtils";

const LoginPage = () => {
    const { login } = useApi();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const returnTo = useReturnToParam();
    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

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
            else if(response.status === 403) {
                // user not verified
                const err = await response.text();
                setError(err);
            }
            else if(response.status === 500) {
                // email not sent
                const err = await response.text();
                setError(err);
            }
            else {
                // unkown error
                throw response;
            }
        }
    };

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
                        type="email"
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
                    <LinkBase
                        component="button"
                        type="button"
                        onClick={handleClickOpen}
                        variant="body2"
                        sx={{ alignSelf: 'baseline', mb: 1 }}
                    >
                        Forgot your password?
                    </LinkBase>
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
                <ForgotPasswordDialog open={open} handleClose={handleClose} />
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
                        onClick={(e) => {
                            e.preventDefault();
                            doGoogleLogin(returnTo, navigate)
                        }}
                        startIcon={<SvgIcon color="primary"> <GoogleIcon /> </SvgIcon>}
                    >
                        Sign in with Google
                    </Button>
                </Box>
            </Box>
        </LoginCard>
    );
};

const ForgotPasswordDialog = ({ open, handleClose }) => {
    const { requestResetPassword } = useApi();
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");
    const [openAlert, setOpenAlert] = useState(false);
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState('info');

    const handleResetPasswordRequest = async (e) => {
        e.preventDefault();
        const response = await requestResetPassword(email, window.location.origin + "/resetPassword?token=");
        if (response.ok) {
            const msg = await response.text();
            setSeverity("success");
            setMessage(msg);
            setOpenAlert(true);
        } else {
            if(response.status === 400) {
                // problem with input fields
                const vals = await response.json();
                if(vals?.fields) {
                    if(vals.fields.email) {
                        setEmailError(vals.fields.email);
                    }
                }
            }
            else if(response.status === 404) {
                //user was not found
                const err = await response.text();
                setEmailError(err);
            }
            else if(response.status === 403) {
                // user not verified
                const err = await response.text();
                setSeverity("error");
                setMessage(err);
                setOpenAlert(true);
            }
            else if(response.status === 429) {
                // cooldown period
                const err = await response.text();
                setSeverity("error");
                setMessage(err);
                setOpenAlert(true);
            }
            else if(response.status === 500) {
                // server error, like problem sending email
                const err = await response.text();
                setSeverity("error");
                setMessage(err);
                setOpenAlert(true);
            }
            else {
                // unkown error
                throw response;
            }
        }
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            slotProps={{
                paper: {
                    component: 'form',
                    onSubmit: (event) => {
                        event.preventDefault();
                        handleClose();
                    },
                    sx: { backgroundImage: 'none' },
                },
            }}
        >
            <DialogTitle>Reset password</DialogTitle>
            <DialogContent
                sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}
            >
                <DialogContentText>
                    Enter your account&apos;s email address, and we&apos;ll send you a link to
                    reset your password.
                </DialogContentText>
                <TextField
                    autoFocus
                    required
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailError("");
                        setOpenAlert(false);
                        setMessage("")
                    }}
                    label={"Email"}
                    variant="outlined"
                    error={!!emailError}
                    helperText={emailError ? emailError : ""}
                />
            </DialogContent>
            <DialogActions sx={{ pb: 3, px: 3 }}>
                <Button onClick={handleClose}>Cancel</Button>
                <Button
                    variant="contained" type="submit"
                    onClick={handleResetPasswordRequest}
                    disabled={!email || !!emailError}
                >
                    Continue
                </Button>
            </DialogActions>
            {openAlert && (
                <Alert severity={severity} sx={{ m: 2 }}>
                    {message}
                </Alert>
            )}
        </Dialog>
    );
}

export default LoginPage;