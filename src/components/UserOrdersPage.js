import {useApi} from "../http/api";
import {Link, useParams, useSearchParams} from "react-router-dom";
import {ErrorBoundary, useErrorBoundary} from "react-error-boundary";
import React, {Suspense, use, useEffect, useState} from "react";
import {PaginationNavigatePage, useCurrentPage} from "./Pagination";
import './UserOrdersPage.css';

export default function LoadUserOrdersPage() {
    const { getCurrentUserOrders } = useApi();
    const { id } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const page = Number(searchParams.get("page")) || 1;
    return (
            <Suspense key="orders" fallback={<div>Loading Orders...</div>}>
                <UserOrdersPage /*ordersPromise={getCurrentUserOrders(page-1)}*/ />
            </Suspense>
    );
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

const UserOrdersPage = ({ ordersPromise }) => {
    const { getCurrentUserOrders } = useApi();
    const page = useCurrentPage();
    const [orders, setOrders] = useState(null);

    const errorBoundary = useErrorBoundary();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const orders = await getCurrentUserOrders(page - 1);
                setOrders(orders);
            } catch (error) {
                errorBoundary.showBoundary(error);
            }
        }
        fetchOrders();
    }, [page]);
    return (
        <div key="orders">
            {orders?.content?.length > 0 ? (
                orders?.content?.map((order) => (
                    <div key={order?.id} className="order">
                        <div>
                            Order Number:
                            {order?.id}
                            {' - Date: '}
                            {formatDate(order?.purchasedDate)}
                        </div>
                        <div>
                            <strong>Products:</strong>
                            {order?.purchasedItems.map((purchasedItem) => (
                                <PurchasedProductItem key={purchasedItem.id} purchasedItem={purchasedItem} />
                            ))}
                        </div>
                        <text>{order?.price}</text>
                    </div>
                ))
            ) : (
                <p>No reviews yet.</p>
            )}
            <div className="pagination">
                <PaginationNavigatePage paginationResult={orders} />
            </div>
        </div>
    );
};

const PurchasedProductItem = ({ purchasedItem }) => {
    const movie = purchasedItem.movie;
    console.log(purchasedItem);
    return (
        <div className="purchased-item">
            <div>
                <Link to={"/movie/" + movie?.id} className="product-link">
                    <div className="product-name">{movie?.name}</div>
                </Link>
                -
                {purchasedItem.purchaseType === 'RENT' ? 'Rented' : 'Bought'}
                {" "}
                (
                {purchasedItem.isUsable ?
                    <p style={{color: 'green'}}>Active</p>
                    : <p style = {{color: 'red'}}>Expired</p>
                }
                )
            </div>
            <div>
                {purchasedItem.purchasePrice}
            </div>
        </div>
    );
}