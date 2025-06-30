import cartIcon from '../cart.png';
import logo from '../marketplace_logo.png';
import searchIcon from '../search.png';
import userIcon from '../user.png';
import { Link } from 'react-router-dom'
import { useApi } from '../http/api';
import './AppBar.css';
import { useAuthContext } from "../AuthProvider";
import {useSearchInputContext} from "../SearchInputProvider";
import {Button, createTheme, IconButton, InputBase, Paper, ThemeProvider} from "@mui/material";

const theme = createTheme({
    components: {
        // Name of the component
        MuiButton: {
            styleOverrides: {
                root: {
                    color: "black",
                    borderColor: "black",
                    backgroundColor: "white"
                }
            }
        }
    },

});

export default function AppBar() {
    const { logout } = useApi();
    const { userMessage, userLogged } = useAuthContext();
    const { searchInput, setSearchInput, setIsSearching } = useSearchInputContext();

    const logoutButton = () => {
        logout()
            .then(() => {
                userLogged(false);
            })
            .catch((error) => {
                console.error("Logout failed:", error);
            });
    };

    return (
        <ThemeProvider theme={theme}>
        <Paper className="app-bar">
            <Link to="/cart">
                <IconButton>
                    <img src={cartIcon} alt="Cart" className="icon" height='100%'/>
                </IconButton>
            </Link>
            <Link to="/">
                <IconButton>
                    <img src={logo} alt="Home" className="icon" height="100%"/>
                </IconButton>
            </Link>

            <div className="search-bar">
                <div style={{height: "100%"}}>
                    <Link to="/search" style={{userSelect: "none"}}>
                        <IconButton style={{height: "100%"}} onClick={() => {
                            setIsSearching(Date.now());
                            console.log("WGatttt");
                        }}>
                            <img src={searchIcon} alt="Search" className="search-icon" height="100%" style={{userSelect: "none"}}/>
                        </IconButton>
                    </Link>
                </div>
                <InputBase
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search..."
                />
            </div>
            <Link to="/user">
                <IconButton>
                    <img src={userIcon} alt="User" className="icon" height="100%"/>
                </IconButton>
            </Link>
            <label className="user-message">{userMessage}</label>
            <Button variant="outlined" onClick={() => { logoutButton(); }}>Logout</Button>
        </Paper>
        </ThemeProvider>
    );
}