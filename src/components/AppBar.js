import cartIcon from '../cart.png';
import logo from '../marketplace_logo.png';
import searchIcon from '../search.png';
import userIcon from '../user.png';
import React, {Suspense, useEffect, useState, use} from 'react';
import { Link } from 'react-router-dom'
import { getAllMovies, getAllMovies2 } from '../http/api';
import { logoutTokens } from '../http/requests';
import './AppBar.css';

export default function AppBar() {

    const [searchText, setSearchText] = useState('');
    const [userMessage, setUserMessage] = useState('User Not Logged');


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
                <img src={searchIcon} alt="Search" className="search-icon" onClick={handleSearch} height="100%"/>
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

            <div className="user-section" style={
                {
                    height: '100%',
                }
            }>
                <Link to="/cart">
                    <img src={userIcon} alt="User" className="user-icon" onClick={enterUserPage} height="100%"/>
                </Link>
                <label>{userMessage}</label>
            </div>
            <button onClick={() => {logoutTokens()}}>Logout</button>
        </div>
    );
}