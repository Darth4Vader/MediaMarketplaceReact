
import OrderHistotyImage from '../orders_history.png';
import MediaCollectionImage from '../media_collection.png';
import UserInformationImage from '../user_info.png';
import {Outlet} from "react-router";
import {Link} from "react-router-dom";
import './UserPage.css'

const UserPageMenuBar = () => {
    return (
        <div className="user-side-bar">
            <Link to="./orders">
                <div>
                    <img src={OrderHistotyImage} alt="Order histoty image" className="user-logo"/>
                    Order History
                </div>
            </Link>
            <div>
                <img src={MediaCollectionImage} alt="MediaCollection image" className="user-logo"/>
                <label>
                    Media Collection
                </label>
            </div>
            <div>
                <img src={UserInformationImage} alt="User information image" className="user-logo"/>
                <label>
                    User Information
                </label>
            </div>
        </div>
    );
}

const UserPageTemplate = () => {
    return (
        <div className='user-page'>
            <UserPageMenuBar />
            <Outlet/>
        </div>
    );
};

export default UserPageTemplate;