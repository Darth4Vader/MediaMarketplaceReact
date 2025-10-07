import {useApi} from "../http/api";
import {Link, useParams, useSearchParams} from "react-router-dom";
import {ErrorBoundary, useErrorBoundary} from "react-error-boundary";
import React, {Suspense, use, useEffect, useState} from "react";
import {PaginationNavigatePage, useCurrentPage, usePagination} from "./Pagination";
import './UserOrdersPage.css';
import {Skeleton} from "@mui/material";
import {useCurrencyContext} from "../CurrencyProvider";

function formatDate(dateArray) {
    if (!dateArray) return '';
    return `${dateArray[2]}/${dateArray[1]}/${dateArray[0]}, ${dateArray[3]}:${dateArray[4]}:${dateArray[5]}`;
}

const UserOrdersPage = () => {
    const { getCurrentUserOrders } = useApi();
    const page = useCurrentPage();
    const [orders, setOrders] = useState(null);
    const [pageLoaded, setPageLoaded] = useState(false);
    const { pagination, setPaginationResult } = usePagination();

    const errorBoundary = useErrorBoundary();

    const { currentCurrency } = useCurrencyContext();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const orders = await getCurrentUserOrders(page - 1, 10);
                setPaginationResult(orders);
                setOrders(orders?.content);
            } catch (error) {
                errorBoundary.showBoundary(error);
            }
        }
        fetchOrders();
    }, [page, currentCurrency]);
    return (
        <div key="orders">
            {orders?.length > 0 ? (
                orders?.map((order) => (
                    <Order order={order} setPageLoaded={setPageLoaded} />
            ))) : (
                <p>No products yet.</p>
            )}
            <div className="pagination">
                <PaginationNavigatePage paginationResult={pagination} />
            </div>
        </div>
    );
};

const Order = ({ order, setPageLoaded }) => {
    console.log("Order:", order);
    return (
        <div key={order?.id} className="order">
            <div>
                Order: {order?.id}
                {' - Date: '}
                {formatDate(order?.purchasedDate)}
            </div>
            <div>
                <strong>Products:</strong>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {order?.purchasedItems.map((purchasedItem, index) => (
                        <li key={index}>
                            <PurchasedProductItem
                                purchasedItem={purchasedItem}
                                setPageLoaded={setPageLoaded}
                            />
                        </li>
                    ))}
                </ul>
            </div>
            <span>Total Price: {order?.totalPrice?.amount} {order?.totalPrice?.currency}</span>
        </div>
    )
}

const PurchasedProductItem = ({ purchasedItem, setPageLoaded }) => {
    const [loaded, setLoaded] = useState(true);
    const movie = purchasedItem?.movie;
    console.log(purchasedItem);

    useEffect(() => {
        setPageLoaded(loaded);
    }, [loaded]);

    return loaded ? (
        <div className="purchased-item">
            <Link to={"/movie/" + movie?.id} className="product-link">
                <img src={movie?.posterPath} alt={movie?.name} className="product-poster"/>
            </Link>
            <div>
                <Link to={"/movie/" + movie?.id} className="product-link">
                    <div className="product-name">{movie?.name}</div>
                </Link>
                <div className="product-purchase-panel">
                    {purchasedItem.isRented ? 'Rented' : 'Bought'}
                    {" "}
                    (
                    {purchasedItem.isUseable ?
                        <span style={{color: 'green'}}>Active</span>
                        : <span style = {{color: 'red'}}>Expired</span>
                    }
                    )
                </div>
                <div style={{ color: 'gray' }}>
                    Price: {purchasedItem.purchasePrice?.amount} {purchasedItem.purchasePrice?.currency}
                </div>
            </div>
        </div>
    ): (
        <CartProductItemSkeleton/>
    );
};

const CartProductItemSkeleton = () => {
    return (
        <div className="cart-product">
            <Skeleton variant="rectangular" className="product-poster"/>
            <div>
                <Skeleton variant="text" width={200} height={30} />
                <Skeleton variant="text" width={100} height={30} />
                <Skeleton variant="text" width={100} height={30} />
                <Skeleton variant="text" width={100} height={30} />
            </div>
        </div>
    );
}

export default UserOrdersPage;