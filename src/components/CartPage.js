import React, {Suspense,use, useEffect, useState} from 'react';
import {useApi} from '../http/api';
import {ErrorBoundary, useErrorBoundary} from "react-error-boundary";
import {useMutation, useQuery} from "react-query";
import {useFetchRequests} from "../http/requests";
import './CartPage.css';
import {NotFoundErrorBoundary} from "./ApiErrorUtils";

export default function LoadCartPage() {
    return (
        <NotFoundErrorBoundary
            fallbackRender={({ error, resetErrorBoundary  }) => {
            //resetErrorBoundary();
            return (
                <div>
                    <div>Empty Cart</div>
                    {/*<button onClick={() => {showBoundary(error);}}>Reset</button>*/}
                </div>
            );}}>
        <Suspense key="cart" fallback={<div>Loading...</div>}>
            <CartPage key="cart"/>
        </Suspense>
        </NotFoundErrorBoundary>
    );
}

const CartPage = () => {
    console.log("Hellllllllll")
    const { getCurrentUserCart } = useApi();
    const [cartProducts, setCartProducts] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const requests = useFetchRequests();
    console.log("Helol eloeleo");
    const { data: userPurchaseInfoResponse, isSuccess } = useQuery(['getCurrentUserCart'], async () => {
        return await getCurrentUserCart();
    }, {
        suspense: true,
        retry: false,
        useErrorBoundary: true,
    });
    console.log("THis is Working Good");
    useEffect(() => {
        console.log("Loading...", isSuccess, userPurchaseInfoResponse);
        if(isSuccess) {
            console.log("Parsed");
            console.log(userPurchaseInfoResponse);
            setCartProducts(userPurchaseInfoResponse?.cartProducts || []);
            setTotalPrice(userPurchaseInfoResponse?.totalPrice || 0);
        }
    }, [isSuccess, userPurchaseInfoResponse]);
    const { mutate: updateProductPurchaseType } = useMutation({
        mutationFn: async ({productId, purchaseType}) => {
            return await requests.putWithAuth(`/api/users/carts/${productId}`,
                {purchaseType});
        },
        onSuccess: async (response) => {
            /*setOpenAlert(true);
            if (!response.ok) {
                setMessage(await response.text());
                setSeverity('error');
            } else {
                setMessage("Added Successfully");
                setSeverity('success');
            }*/
        },
        useErrorBoundary: true,
        throwOnError: true,
    });

    const { mutate: removeProductFromCart } = useMutation({
        mutationFn: ({index, productId}) => {
            return requests.deleteWithAuth(`/api/users/carts/${productId}`);
        },
        onSuccess: async (response, variables) => {
            if(response.ok) {
                setCartProducts(cartProducts => cartProducts.filter((_, i) => i !== variables.index));
            }
        },
        useErrorBoundary: true,
        throwOnError: true,
    });

    const removeProductFromCartAction = async (index, productId) => {
        removeProductFromCart({ index, productId });
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

    const productPurchaseTypeChange = async (productId, purchaseType) => {
        await updateProductPurchaseType({productId, purchaseType});
    }

    //return Object.values(userWalletIncomes).reduce((total, value) => total + value, 0);

    const totalPrice2 = cartProducts.reduce((total, cartProduct) => cartProduct.price, 0);

    return (
        <div className="cart-page" style={{ textAlign: 'center', padding: '20px' }}>
            {cartProducts.length === 0 ? (
                <h1 style={{ fontSize: '50px' }}>The Cart is empty.</h1>
            ) : (
                <>
                    <div style={{ textAlign: 'right', fontSize: '19px', marginBottom: '10px' }}>
                        Price:
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {cartProducts.map((cartProduct, index) => (
                            <li key={index}>
                                <CartProductItem
                                    cartProduct={cartProduct}
                                    onRemove={() => removeProductFromCartAction(index, cartProduct.product.id)}
                                    onPurchaseTypeChange={(type) => productPurchaseTypeChange(cartProduct.product.id, type)}
                                />
                            </li>
                        ))}
                    </ul>
                    <div style={{ textAlign: 'right', fontSize: '19px', marginTop: '10px' }}>
                        <span>Total Price ({cartProducts.length} items): </span>
                        <strong>{totalPrice2}</strong>
                    </div>
                    <button onClick={purchaseCart} style={{ marginTop: '20px', padding: '10px 20px' }}>
                        Purchase
                    </button>
                </>
            )}
        </div>
    );
};

const CartProductItem = ({ cartProduct, onRemove, onPurchaseTypeChange}) => {
    const product = cartProduct?.product;
    const movie = product?.movie;

    return (
        <div className="cart-product" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
            <div style={{ display: 'flex' }}>
                <img src={movie?.posterPath} alt={movie?.name} style={{ width: '100px', marginRight: '15px' }} />
                <div>
                    <div style={{ fontWeight: 'bold' }}>{movie?.name}</div>
                    <select id="purchase-option" defaultValue={cartProduct?.purchaseType} onChange={(e) => onPurchaseTypeChange(e.target.value)}>
                        <option value="buy">Buy</option>
                        <option value="rent">Rent</option>
                    </select>
                    <button onClick={onRemove} style={{ marginTop: '10px' }}>Delete</button>
                </div>
            </div>
            <div style={{ fontWeight: 'bold', fontSize: '19px' }}>{cartProduct?.totalPrice}</div>
        </div>
    );
};