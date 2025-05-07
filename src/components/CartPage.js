import React, {Suspense,use, useEffect, useState} from 'react';
import {useApi} from '../http/api';
import {ErrorBoundary, useErrorBoundary} from "react-error-boundary";
import {useMutation, useQuery} from "react-query";
import {useFetchRequests} from "../http/requests";
import './CartPage.css';
import {NotFoundErrorBoundary} from "./ApiErrorUtils";
import {IconButton, Skeleton} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';

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
    const { getCurrentUserCart, updateProductInCart } = useApi();
    const [cartProducts, setCartProducts] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const requests = useFetchRequests();
    console.log("Helol eloeleo");
    const errorBoundary = useErrorBoundary();
    useEffect(() => {
        const fetching = async () => {
            try {
                const cart = await getCurrentUserCart();
                setCartProducts(cart?.cartProducts || []);
                setTotalPrice(cart?.totalPrice || 0);
                setTotalItems(cart?.totalItems || 0);
            }
            catch (error) {
                errorBoundary.showBoundary(error);
            }
        }
        fetching();
    }, []);

    const { data: updateProductResponse, mutate: updateProductPurchaseType, isSuccess: updateProductSuccess } = useMutation({
        mutationFn: async ({index, productId, purchaseType, setLoaded}) => {
            return await updateProductInCart(productId, purchaseType);
        },
        onSuccess: async (data, variables) => {
            const index = variables.index;
            console.log("Update Product Purchase Type");
            console.log(data);
            console.log("Response");
            setCartProducts(cartProducts => {
                const newCartProducts = [...cartProducts];
                newCartProducts[index] = data?.cartProduct || cartProducts[index];
                return newCartProducts;
            });
            setTotalPrice(data?.totalPrice || 0);
            setTotalItems(data?.totalItems || 0);
            variables.setLoaded(true);
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

    const productPurchaseTypeChange = async (index, productId, purchaseType, setLoaded) => {
        setLoaded(false);
        updateProductPurchaseType({index, productId, purchaseType, setLoaded});
    }

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
                                    onPurchaseTypeChange={(type, setLoaded) => productPurchaseTypeChange(index, cartProduct.product.id, type, setLoaded)}
                                />
                            </li>
                        ))}
                    </ul>
                    <div style={{ textAlign: 'right', fontSize: '19px', marginTop: '10px' }}>
                        <span>Total Price ({totalItems} items): </span>
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

const CartProductItem = ({ cartProduct, onRemove, onPurchaseTypeChange}) => {
    const [loaded, setLoaded] = useState(true);
    const product = cartProduct?.product;
    const movie = product?.movie;

    return loaded ? (
        <div className="cart-product">
            <img src={movie?.posterPath} alt={movie?.name} className="product-poster"/>
            <div>
                <div className="product-name">{movie?.name}</div>
                <div className="product-purchase-panel">
                    <text>Purchase Type:</text>
                    <select id="purchase-option" defaultValue={cartProduct?.purchaseType} onChange={(e) => onPurchaseTypeChange(e.target.value, setLoaded)}>
                        <option value="buy">Buy</option>
                        <option value="rent">Rent</option>
                    </select>
                </div>
                <IconButton aria-label="delete" size="large" className="remove-product-button" onClick={onRemove} >
                    <DeleteIcon />
                </IconButton>
                <div style={{ fontSize: '14px', color: 'gray' }}>
                    {cartProduct?.purchaseType === 'buy' ? 'Buy for:' : 'Rent for:'} {cartProduct?.price}
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