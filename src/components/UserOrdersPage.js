import {useApi} from "../http/api";
import {useParams, useSearchParams} from "react-router-dom";
import {ErrorBoundary} from "react-error-boundary";
import React, {Suspense, use} from "react";
import {PaginationNavigatePage} from "./Pagination";

export default function LoadUserOrdersPage() {
    const { getCurrentUserOrders } = useApi();
    const { id } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const page = Number(searchParams.get("page")) || 1;
    return (
            <Suspense key={page} fallback={<div>Loading Orders...</div>}>
                <UserOrdersPage ordersPromise={getCurrentUserOrders(id, page-1)} />
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
    const orders = use(ordersPromise);
    console.log(orders);
    return (
        <div>
            {orders?.content?.length > 0 ? (
                orders?.content?.map((order) => (
                    <div key={order.id} className="order">
                        <div>
                            Order Number:
                            {order.id}
                            {' - Date: '}
                            {formatDate(order.purchasedDate)}
                        </div>
                        <div>
                            <strong>Products:</strong>
                            {order.purchasedItems.map((purchasedItem) => (
                                <PurchasedProductItem key={purchasedItem.id} purchasedItem={purchasedItem} />
                            ))}
                        </div>
                        <text>{order.price}</text>
                    </div>
                ))
            ) : (
                <p>No reviews yet.</p>
            )}
            <div className="pagination">
                <PaginationNavigatePage paginationResult={orders.content} />
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
                <label>
                    {movie.name}
                </label>
                -
                {purchasedItem.purchaseType === 'RENT' ? 'Rented' : 'Bought'}
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