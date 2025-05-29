
import OrderHistotyImage from '../orders_history.png';
import MediaCollectionImage from '../media_collection.png';
import UserInformationImage from '../user_info.png';
import {Outlet} from "react-router";
import {Link} from "react-router-dom";
import './UserPage.css'

const UserPageMenuBar = () => {
    return (
        <div className="user-side-bar">
            <div className="user-side-bar-scroll">
                <Link to="./orders">
                    <div className="side-bar-item">
                        <img src={OrderHistotyImage} alt="Order histoty image" className="user-logo"/>
                        Order History
                    </div>
                </Link>
                <div className="side-bar-item">
                    <img src={MediaCollectionImage} alt="MediaCollection image" className="user-logo"/>
                    {<label>
                        Media Collection
                    </label>}
                </div>
                <div className="side-bar-item">
                    <img src={UserInformationImage} alt="User information image" className="user-logo"/>
                    <label>
                        User Information
                    </label>
                </div>
            </div>
        </div>
    );
}

const UserPageTemplate = () => {
    return (
        <div className='user-page'>
            <UserPageMenuBar />
            <div className="main-user-page">
                <Outlet/>
            </div>
        </div>
    );
};

export default UserPageTemplate;