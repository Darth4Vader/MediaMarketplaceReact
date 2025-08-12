import { ReactComponent as OrderHistoryImage} from '../orders_history.svg';
import { ReactComponent as MediaCollectionImage} from '../media_collection.svg';
import { ReactComponent as UserInformationImage} from '../user_info.svg';
import {Outlet} from "react-router";
import {Link} from "react-router-dom";
import './UserPage.css'
import {useAuthenticationCheck} from "../AuthProvider";
import {
    Box,
    Drawer,
    ListItem,
    ListItemButton,
    SvgIcon,
    Toolbar
} from "@mui/material";
import List from '@mui/material/List';
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";

const UserPageMenuBar = () => {
    return (
            <Drawer
                variant="permanent"
                sx={{
                    width: 240,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: 240,
                        boxSizing: 'border-box',
                    },
                }}
            >
                <Toolbar className="app-bar" />
                <Box sx={{ overflow: 'auto' }}>
                    <List>
                        <UserPageListItem to={'./orders'} text="Order History">
                            <OrderHistoryImage/>
                        </UserPageListItem>
                        <UserPageListItem to={'./collection'} text="Media Collection">
                            <MediaCollectionImage/>
                        </UserPageListItem>
                        <UserPageListItem to={'./information'} text="User Information">
                            <UserInformationImage/>
                        </UserPageListItem>
                    </List>
                </Box>
            </Drawer>
    );
}

const UserPageListItem = ({ to, text, children }) => {
    const subPath = window.location.pathname.replace('/user','');
    return (
        <ListItemButton component={Link} to={to} selected={subPath.startsWith(to.replace('.',''))}>
            <ListItem key="text">
                <ListItemIcon>
                    <SvgIcon color="primary">
                        {children}
                    </SvgIcon>
                </ListItemIcon>
                <ListItemText primary={text} />
            </ListItem>
        </ListItemButton>
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