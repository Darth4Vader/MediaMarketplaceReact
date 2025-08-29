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
    AppBar, Avatar, Box,
    createTheme, CssBaseline,
    IconButton,
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
import {useState} from "react";
import React from "react";

function HideOnScroll(props) {
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

export default function MyAppBar(props) {
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