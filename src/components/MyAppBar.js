import cartIcon from '../cart.png';
import logo from '../marketplace_logo.png';
import searchIcon from '../search.png';
import userIcon from '../user.png';
import {Link, useNavigate} from 'react-router-dom'
import { useApi } from '../http/api';
import './MyAppBar.css';
import { useAuthContext } from "../AuthProvider";
import {useSearchInputContext} from "../SearchInputProvider";
import {
    AppBar, Autocomplete, Avatar, Box,
    createTheme, CssBaseline,
    IconButton, InputAdornment,
    InputBase,
    Slide,
    Toolbar,
    Typography, useScrollTrigger
} from "@mui/material";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SearchIcon from '@mui/icons-material/Search';
import AccountCircle from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import PropTypes from "prop-types";
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import {useEffect, useState} from "react";
import React from "react";
import TextField from "@mui/material/TextField";
import {useMutation} from "react-query";
import {useEffectAfterPageRendered} from "./UseEffectAfterPageRendered";

export function HideOnScroll(props) {
    const { children, window } = props;
    // Note that you normally won't need to set the window ref as useScrollTrigger
    // will default to window.
    // This is only being set here because the demo is in an iframe.
    const trigger = useScrollTrigger({
        target: window ? window() : undefined,
    });

    return (
        <Slide appear={false} direction="down" in={!trigger}>
            {children ?? <div />}
        </Slide>
    );
}

HideOnScroll.propTypes = {
    children: PropTypes.element,
    /**
     * Injected by the documentation to work in an iframe.
     * You won't need it on your project.
     */
    window: PropTypes.func,
};

export function MyAppBar(props) {
    const { logout } = useApi();
    const { userInfo, userLogged, isLogged } = useAuthContext();
    const { searchInput, setSearchInput, setIsSearching } = useSearchInputContext();

    console.log(userInfo)

    const [anchorEl, setAnchorEl] = useState(null);

    const navigate = useNavigate();

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const loginButton = () => {
        logout()
            .then(() => {
                setAnchorEl(null);
                navigate('/login');
            })
            .catch((error) => {
                console.error("Logout failed:", error);
            });
    };

    const logoutButton = () => {
        logout()
            .then(() => {
                userLogged(false);
                setAnchorEl(null)
                navigate("/");
            })
            .catch((error) => {
                console.error("Logout failed:", error);
            });
    };

    return (
        <React.Fragment>
            <CssBaseline />
            <HideOnScroll {...props}>
            <AppBar
                position="sticky"
                sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
            >
                <Toolbar variant="dense" className="app-bar">
                    <Link to="/cart" className="icon-wrapper">
                        <IconButton>
                            <ShoppingCartIcon className="mui-icon"/>
                        </IconButton>
                    </Link>
                    <Link to="/" className="icon">
                        <IconButton className="icon">
                            <img src={logo} alt="Home" className="icon"/>
                        </IconButton>
                    </Link>

                    <div className="search-bar">
                        <div style={{height: "100%"}}>
                            <Link to="/search" style={{userSelect: "none"}}>
                                <IconButton style={{height: "100%"}} onClick={() => {
                                    setIsSearching(Date.now());
                                    console.log("WGatttt");
                                }}>
                                    <SearchIcon className="search-icon" height="100%" style={{userSelect: "none"}}/>
                                </IconButton>
                            </Link>
                        </div>
                        <InputBase
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Search..."
                            className="search-input"
                        />
                    </div>
                    <CurrencySelector />
                    <Box sx={{ flexGrow: 1 }} />
                        <IconButton
                            onClick={handleMenu}
                            color="inherit"
                            className="icon-wrapper"
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                        >
                            {userInfo !== null && userInfo?.profilePicture ?
                                <Avatar alt={userInfo?.name} src={userInfo?.profilePicture} />
                                : <AccountCircle className="mui-icon" height="100%"/>
                            }
                        </IconButton>
                    <Menu
                        id="menu-appbar"
                        anchorEl={anchorEl}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        keepMounted
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        open={Boolean(anchorEl)}
                        onClose={handleClose}
                        className="user-menu-popup"
                    >
                        {isLogged ? (
                            <Box>
                                <MenuItem component={Link} to="/user" onClick={handleClose}>
                                    <ListItemIcon>
                                        <AccountCircle fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText>View Account</ListItemText>
                                </MenuItem>
                                <MenuItem onClick={() => { logoutButton(); }}>
                                    <ListItemIcon>
                                        <LogoutIcon fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText>Logout</ListItemText>
                                </MenuItem>
                            </Box>
                        ) : (
                            <Box>
                                <MenuItem onClick={() => { loginButton(); }}>
                                    <ListItemIcon>
                                        <LoginIcon fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText>Login</ListItemText>
                                </MenuItem>
                            </Box>
                        )}
                    </Menu>
                    <Typography
                        variant="h6"
                        noWrap
                        component="div"
                        sx={{ display: { xs: 'none', sm: 'block' } }}
                    >
                        {userInfo !== null ?
                            userInfo?.name
                            : "User Not Logged"
                        }
                    </Typography>
                </Toolbar>
            </AppBar>
            </HideOnScroll>
        </React.Fragment>
    );
}

const PLACEHOLDER_FLAG = "https://upload.wikimedia.org/wikipedia/commons/6/6a/A_blank_flag.png";

function CurrencySelector() {
    const { getAllCurrencies, getSessionCurrency, saveCurrencyInSession } = useApi();
    const [currencies, setCurrencies] = useState([]);
    const [value, setValue] = useState(null);
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {

        const fetchCurrencies = async () => {
            try {
                const response = await getAllCurrencies();
                const data = await response.json();
                setCurrencies(data);
            } catch (error) {
                console.error("Failed to fetch currencies:", error);
            }
        };

        fetchCurrencies();
    }, [])

    const handleBlur = () => {
        // Trim + lowercase input
        const input = inputValue.trim().toLowerCase();

        // Case 1: empty input → restore selected
        if (input === '' && value) {
            setInputValue(value.currencyName);
            return;
        }

        // Case 2: typed input doesn't match any known currency
        const matched = currencies.find(
            (c) => c.currencyName.toLowerCase() === input
        );

        if (!matched && value) {
            // User typed something invalid or cleared input
            // → restore input to selected value's name
            setInputValue(value.currencyName);
        }
    };

    const filterOptions = (options, { inputValue }) => {
        const search = inputValue.trim().toLowerCase();
        return options.filter((option) => {
            const matches = [
                option.currencyName,
                option.currencyCode,
                option.mainCountry?.name,
                ...(option.countries?.map(c => c.name) || [])
            ];
            return matches.some(field => field?.toLowerCase().includes(search));
        });
    };

    const { mutate: saveCurrencyToSessionRequest } = useMutation({
        mutationFn: async ({ currencyCode }) => {
            return await saveCurrencyInSession(currencyCode);
        },
        onSuccess: async (response) => {
            /*setOpenAlert(true);
            console.log(response);
            if (!response.ok) {
                setMessage(await response.text());
                setSeverity('error');
            } else {
                setMessage("Added Successfully");
                setSeverity('success');
            }*/
        },
        useErrorBoundary: true,
        throwOnError: true,
    });

    const saveCurrencyToSessionAction = async (currencyCode) => {
        const response = await saveCurrencyToSessionRequest({ currencyCode });
    };

    useEffectAfterPageRendered(() => {
        const fetchSessionCurrency = async () => {
            try {
                const response = await getSessionCurrency();
                const selectedCurrency = await response.json(); // e.g. { currencyCode: "USD", currencyName: "US Dollar", ... }

                // Make sure the object exists in your currencies array
                const matched = currencies.find(c => c.currencyCode === selectedCurrency.currencyCode);
                if (matched) {
                    setValue(matched); // Set the actual selected object
                    setInputValue(matched.currencyName); // Reflect it in the input
                }
            } catch (error) {
                console.error("Failed to fetch session currency:", error);
            }
        }
        fetchSessionCurrency();
    }, [currencies])

    return (
        <Autocomplete
            sx={{ width: 300 }}
            options={currencies}
            value={value}
            inputValue={inputValue}
            onChange={(event, newValue) => {
                if(newValue) {
                    setValue(newValue);
                    setInputValue(newValue?.currencyName || '');
                    saveCurrencyToSessionAction(newValue.currencyCode);
                }
            }}
            onInputChange={(event, newInputValue) => {
                setInputValue(newInputValue);
            }}
            onBlur={handleBlur}
            autoHighlight
            filterOptions={filterOptions}
            getOptionLabel={(option) => option.currencyName}
            isOptionEqualToValue={(option, value) => option.currencyCode === value.currencyCode}
            renderOption={(props, option) => {
                const countryCode = option?.mainCountry?.code?.toLowerCase();
                const flagSrc = `https://flagcdn.com/w20/${countryCode}.png`;
                const flagSrcSet = `https://flagcdn.com/w40/${countryCode}.png 2x`;
                const { key, ...optionProps } = props;
                return (
                    <Box
                        key={key}
                        component="li"
                        sx={{ '& > img': { mr: 2, flexShrink: 0 } }}
                        //sx={{ display: 'flex', alignItems: 'center' }}
                        {...optionProps}
                    >
                        <img
                            loading="lazy"
                            width="20"
                            src={flagSrc}
                            srcSet={flagSrcSet}
                            alt=""
                            style={{ marginRight: 8, flexShrink: 0 }}
                        />
                        {option.currencyName} ({option.currencySymbol})
                    </Box>
                );
            }}
            renderInput={(params) => {
                const userIsTyping = (!value || value.currencyName !== inputValue);
                const countryCode = value?.mainCountry?.code?.toLowerCase();

                const flagSrc = userIsTyping
                    ? PLACEHOLDER_FLAG
                    : countryCode
                        ? `https://flagcdn.com/w20/${countryCode}.png`
                        : PLACEHOLDER_FLAG;

                const flagSrcSet = userIsTyping
                    ? PLACEHOLDER_FLAG
                    : countryCode
                        ? `https://flagcdn.com/w40/${countryCode}.png 2x`
                        : PLACEHOLDER_FLAG;

                return (
                    <TextField
                        {...params}
                        label="Choose a currency"
                        slotProps={{
                            input: {
                                ...params.InputProps,
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <img
                                            src={flagSrc}
                                            srcSet={flagSrcSet}
                                            alt=""
                                            width={20}
                                            style={{ marginRight: 8 }}
                                        />
                                        {userIsTyping ? "?" : value?.currencySymbol}
                                    </InputAdornment>
                                ),
                            },
                            htmlInput: {
                                ...params.inputProps,
                                autoComplete: 'none', // disable autocomplete and autofill
                            }
                        }}
                    />
                );
            }}
        />
    );
}