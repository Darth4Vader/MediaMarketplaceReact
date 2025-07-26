import OrderHistoryImage from '../orders_history.png';
import MediaCollectionImage from '../media_collection.png';
import UserInformationImage from '../user_info.png';
import {Outlet} from "react-router";
import {Link} from "react-router-dom";
import './UserPage.css'
import {useAuthenticationCheck} from "../AuthProvider";
import {Button, createTheme, Paper, ThemeProvider} from "@mui/material";

const theme = createTheme({
    components: {
        // Name of the component
        MuiButton: {
            styleOverrides: {
                root: {
                    color: "black",
                    borderColor: "black",
                    backgroundColor: "white",
                    "& label": {
                        //display: 'flex',
                        //flexDirection: 'column',
                    },
                }
            }
        }
    },

});

const UserPageMenuBar = () => {
    return (
        <ThemeProvider theme={theme}>
            <div className="user-side-bar">
                <Paper className="user-side-bar-scroll">
                    <ImageTextLink to="./orders" imageSrc={OrderHistoryImage} text="Order History"/>
                    <ImageTextLink to="./collection" imageSrc={MediaCollectionImage} text="Media Collection"/>
                    <ImageTextLink to="./information" imageSrc={UserInformationImage} text="User Information"/>
                </Paper>
            </div>
        </ThemeProvider>
    );
}

const ImageTextLink = ({ to, imageSrc, text }) => {
    return (
        <Link to={to}>
            <Button
                sx={{ /*borderRadius: 10*/ }}
                variant="contained"
            >
                <div className="side-bar-item">
                    <img src={imageSrc} alt={text} className="user-logo"/>
                        {text}
                </div>
            </Button>
        </Link>
    );
}

const UserPageTemplate = () => {
    const isFinished = useAuthenticationCheck();

    return (
        <div className='user-page'>
            <UserPageMenuBar />
            <div className="main-user-page">
                {isFinished && <Outlet/>}
            </div>
        </div>
    );
};

export default UserPageTemplate;