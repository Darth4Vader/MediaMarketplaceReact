import cartIcon from '../cart.png';
import logo from '../marketplace_logo.png';
import searchIcon from '../search.png';
import userIcon from '../user.png';
import React, {Suspense, useEffect, useState, use} from 'react';
import { Link } from 'react-router-dom'
import { useApi } from '../http/api';
import { logoutTokens } from '../http/requests';
import './AppBar.css';
import { useAuthContext } from "../AuthProvider";

export default function AppBar() {

    const { userMessage, userLogged } = useAuthContext();

    const { logout } = useApi();

    const [searchText, setSearchText] = useState('');


    const handleSearch = () => {
        //App.getApplicationInstance().enterSearchPage(searchText);
    };

    const enterCart = () => {
        //App.getApplicationInstance().enterCartOrAddMovies();
    };

    const enterHome = () => {
        //App.getApplicationInstance().changeAppPanel(HomePageController.PATH);
    };

    const enterUserPage = () => {
        //App.getApplicationInstance().changeAppPanel(UserPageController.PATH);
    };

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
        <div className="app-bar">
            <Link to="/cart">
                <img src={cartIcon} alt="Cart" className="icon" onClick={enterCart} height='100%'/>
            </Link>
            <div style={{height: "100%"}}>
                <Link to="/">
                    <img src={logo} alt="Home" className="icon" onClick={enterHome} height="100%"/>
                </Link>
            </div>

            <div className="search-bar">
                <div style={{height: "100%"}}>
                    <Link to="/search">
                        <img src={searchIcon} alt="Search" className="search-icon" onClick={handleSearch} height="100%"/>
                    </Link>
                </div>
                <input
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Search..."
                    style={
                        {
                            height: '100%',
                            //fontSize: '5cqw'
                        }
                    }
                />
            </div>

            <div className="user-section">
                <Link to="/user">
                    <img src={userIcon} alt="User" className="user-icon" onClick={enterUserPage} />
                </Link>
                <label className="user-message">{userMessage}</label>
            </div>
            <button onClick={() => { logoutButton(); }}>Logout</button>
        </div>
    );
}