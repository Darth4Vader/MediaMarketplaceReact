import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Box, Button, Card, FormControl, FormHelperText, IconButton, styled,
    SvgIcon, TextField, Typography
} from '@mui/material';
import { motion } from 'framer-motion';
import { useApi } from '../http/api';
import { AuthLink, ShowHidePassword } from './UtilsComponents';
import { ReactComponent as MarketplaceLogo } from '../marketplace_logo.svg';
import './RegisterPage.css';
import {LoginCard} from "./UserLogUtils";

const ResetPasswordPage = () => {
    const { resetPassword } = useApi();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordConfirmError, setPasswordConfirmError] = useState('');
    const [error, setError] = useState('');

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordConfirmError('');

        const response = await resetPassword(token, password, passwordConfirm);
        console.log(response);
        if (response.ok) {
            const msg = await response.text();
            alert(msg);
            // Redirect to the login page
            navigate('/login');
        } else {
            if(response.status === 400) {
                // problem with input fields
                const vals = await response.json();
                console.log(vals);
                setError(vals.error);
                if(vals?.fields) {
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
            else if(response.status === 404) {
                // token not found
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
                <Box sx={{ display: 'flex' }}>
                    <IconButton component={AuthLink} to='/'>
                        <SvgIcon fontSize="large"><MarketplaceLogo /></SvgIcon>
                    </IconButton>
                </Box>

                <Typography component="h1" variant="h4">Reset Password</Typography>

                <Box component="form" onSubmit={handleResetPassword} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <FormControl>
                        <ShowHidePassword
                            name="password"
                            value={password}
                            placeholder="New Password"
                            onChange={(e) => setPassword(e.target.value)}
                            autocomplete="new-password"
                            errorMessage={passwordError}
                            setErrorMessage={setPasswordError}
                        />
                    </FormControl>
                    <FormControl>
                        <ShowHidePassword
                            name="passwordConfirm"
                            value={passwordConfirm}
                            placeholder="Confirm New Password"
                            onChange={(e) => setPasswordConfirm(e.target.value)}
                            autocomplete="new-password"
                            errorMessage={passwordConfirmError}
                            setErrorMessage={setPasswordConfirmError}
                        />
                    </FormControl>

                    <Button type="submit" variant="contained">Reset Password</Button>

                    {error && <FormHelperText error>{error}</FormHelperText>}
                </Box>
            </LoginCard>
    );
};

export default ResetPasswordPage;