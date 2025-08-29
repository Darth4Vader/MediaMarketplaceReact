import React, {useEffect, useRef, useState} from "react";
import { motion } from "framer-motion"; // fixed incorrect import
import {saveTokens, useFetchRequests} from '../http/requests';
import {Link, useNavigate} from "react-router-dom";
import './RegisterPage.css'
import {AuthLink, ShowHidePassword, useReturnToParam} from "./UtilsComponents";
import {
    Box, Button,
    Card, CircularProgress,
    FormControl,
    FormHelperText,
    IconButton, Link as LinkBase,
    styled,
    SvgIcon,
    TextField,
    Typography
} from "@mui/material";
import {SwitchTransition, CSSTransition} from "react-transition-group";
import {useAuthContext} from "../AuthProvider";
import {useApi} from "../http/api";
import { ReactComponent as MarketplaceLogo} from '../marketplace_logo.svg';
import Divider from '@mui/material/Divider';
import { ReactComponent as GoogleIcon} from '../google_logo.svg';
import {LoginCard} from "./UserLogUtils";
import {Turnstile} from "@marsidev/react-turnstile";
import {TURNSTILE_SITE_KEY} from "../http/requests";

function importAll(r) {
    return r.keys().map(r);
}

const images = importAll(require.context('../assets/register-page', false, /\.(png|jpe?g|svg)$/));

const RegisterPage = () => {
    const { register } = useApi();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [passwordConfirmError, setPasswordConfirmError] = useState("");
    const [error, setError] = useState("");
    const [turnstileToken, setTurnstileToken] = useState(null);
    const navigate = useNavigate();
    const [currentIndex, setCurrentIndex] = useState(0);
    const nodeRef = useRef(null);
    const [loaded, setLoaded] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const returnTo = useReturnToParam();

    const { userLogged } = useAuthContext();

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
        setSubmitted(true); // Lock button
        const response = await register(email, password, passwordConfirm, window.location.origin + "/verifyAccount?token=");
        console.log(response);
        if (response.ok) {
            const text = await response.text();
            setSubmitted(false);
            alert(text);
            // Redirect to the returnTo URL
            navigate(returnTo);
        } else {
            if(response.status === 400) {
                // problem with input fields
                const vals = await response.json();
                console.log(vals);
                setError(vals.error);
                if(vals?.fields) {
                    if(vals.fields.email) {
                        setEmailError(vals.fields.email);
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
            else if(response.status === 409) {
                // email already registered
                const err = await response.text();
                setEmailError(err);
            }
            else if(response.status === 500) {
                // verification email not sent
                const err = await response.text();
                setError(err);
            }
            else {
                // unkown error
                throw response;
            }
            setSubmitted(false);
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
                    Register
                </Typography>
                <Box
                    component="form"
                    onSubmit={handleRegister}
                    noValidate
                    sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 2 }}
                >
                    <FormControl>
                        <TextField
                            type={"text"}
                            autoComplete="off"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setEmailError("");
                            }}
                            required
                            label="Email"
                            variant="outlined"
                            error={!!emailError}
                            helperText={emailError ? emailError : ""}
                        />
                    </FormControl>
                    <FormControl>
                        <ShowHidePassword
                            name="password"
                            value={password}
                            placeholder="Password"
                            onChange={(e) => setPassword(e.target.value)}
                            autocomplete="new-password"
                            errorMessage={passwordError}
                            setErrorMessage={setPasswordError}
                        />
                    </FormControl>
                    <FormControl>
                        <ShowHidePassword
                            name="password-confirm"
                            placeholder="Confirm Password"
                            value={passwordConfirm}
                            onChange={(e) => setPasswordConfirm(e.target.value)}
                            autocomplete="new-password"
                            errorMessage={passwordConfirmError}
                            setErrorMessage={setPasswordConfirmError}
                        />
                    </FormControl>

                    {/* Turnstile CAPTCHA */}
                    <FormControl>
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
                    </FormControl>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={!turnstileToken || submitted} // disable submit until CAPTCHA is solved
                        startIcon={submitted ? <CircularProgress size={20} color="inherit" /> : null}
                    >
                        Register
                    </Button>
                    {error && (
                        <FormHelperText error>
                            {error}
                        </FormHelperText>
                    )}
                    <Typography sx={{ textAlign: 'center' }}>
                        Already have an account?{' '}
                        <span>
                        <LinkBase
                            component={AuthLink}
                            to='/login'
                            variant="body2"
                            sx={{ alignSelf: 'center' }}
                        >
                            Sign in
                        </LinkBase>
                    </span>
                    </Typography>
                    <Divider>or</Divider>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={() => alert('Sign in with Google')}
                            startIcon={<SvgIcon color="primary"> <GoogleIcon /> </SvgIcon>}
                        >
                            Sign in with Google
                        </Button>
                    </Box>
                </Box>
            </LoginCard>
        </div>
        </motion.div>
    );
};


export default RegisterPage;