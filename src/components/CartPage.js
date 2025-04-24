import React, {Suspense,use, useEffect, useState} from 'react';
import {getCurrentUserCart} from '../http/api';
import {useNavigate} from 'react-router';
import {ErrorBoundary} from "react-error-boundary";

export default function LoadCartPage() {
    const navigate = useNavigate();
    return (
        <ErrorBoundary onError={"hello"} >
        <Suspense fallback={<div>Loading...</div>}>
            <CartPage cartPromise={getCurrentUserCart(navigate)} />
        </Suspense>
        </ErrorBoundary>
    );
}

const CartPage = ({ cartPromise }) => {

    const [cartProducts, setCartProducts] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [loading, setLoading] = useState(true);

    /*
    useEffect(() => {
        refreshCart();
    }, []);
    */

    /*
    const refreshCart = async () => {
        try {
            const cart = await AppClient.getCart();
            setCartProducts(cart.cartProducts || []);
            setTotalPrice(cart.totalPrice || 0);
        } catch (e) {
            console.error("Cart not found or error:", e);
            setCartProducts([]);
        } finally {
            setLoading(false);
        }
    };
     */

    const removeProductFromCart = async (productId) => {
        /*try {
            await AppClient.removeProductFromCart(productId);
            setCartProducts(prev => prev.filter(p => p.product.id !== productId));
        } catch (e) {
            console.warn("Failed to remove, but updating UI anyway.", e);
            setCartProducts(prev => prev.filter(p => p.product.id !== productId));
        }
        refreshCart();
         */
    };

    const purchaseCart = async () => {
        /*
        try {
            const orderId = await AppClient.placeOrder();
            alert(`Purchase successful! Order number: ${orderId}`);
            refreshCart();
        } catch (e) {
            alert("Problem with Purchasing Products: " + e.message);
        }
         */
    };

    const reviews = use(cartPromise);

    return (
        <div className="cart-page" style={{ textAlign: 'center', padding: '20px' }}>
            {loading ? (
                <p>Loading...</p>
            ) : cartProducts.length === 0 ? (
                <h1 style={{ fontSize: '50px' }}>The Cart is empty.</h1>
            ) : (
                <>
                    <div style={{ textAlign: 'right', fontSize: '19px', marginBottom: '10px' }}>
                        Price:
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {cartProducts.map((product, index) => (
                            <li key={index}>
                                <CartProductItem
                                    product={product}
                                    onRemove={() => removeProductFromCart(product.product.id)}
                                />
                            </li>
                        ))}
                    </ul>
                    <div style={{ textAlign: 'right', fontSize: '19px', marginTop: '10px' }}>
                        <span>Total Price ({cartProducts.length} items): </span>
                        <strong>{totalPrice}</strong>
                    </div>
                    <button onClick={purchaseCart} style={{ marginTop: '20px', padding: '10px 20px' }}>
                        Purchase
                    </button>
                </>
            )}
        </div>
    );
};

const CartProductItem = ({ product, onRemove }) => {
    const { product: p, isBuying, price } = product;
    const movie = p.movie;

    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
            <div style={{ display: 'flex' }}>
                <img src={movie.posterUrl} alt={movie.name} style={{ width: '100px', marginRight: '15px' }} />
                <div>
                    <div style={{ fontWeight: 'bold' }}>{movie.name}</div>
                    <div style={{ color: 'green', fontSize: '19px' }}>{isBuying ? 'Buy' : 'Rent'}</div>
                    <button onClick={onRemove} style={{ marginTop: '10px' }}>Delete</button>
                </div>
            </div>
            <div style={{ fontWeight: 'bold', fontSize: '19px' }}>{price}</div>
        </div>
    );
};