import React, {Suspense,use, useEffect, useState} from 'react';
import {useApi} from '../http/api';
import {ErrorBoundary, useErrorBoundary} from "react-error-boundary";
import {useMutation, useQuery} from "react-query";
import {useFetchRequests} from "../http/requests";
import './CartPage.css';
import {NotFoundErrorBoundary} from "./ApiErrorUtils";
import {Button, Checkbox, Fade, IconButton, MenuItem, Select, Skeleton} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import {Pagination, usePagination} from "./Pagination";
import {Link, useNavigate, useNavigation, useSearchParams} from "react-router-dom";
import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import {useCurrencyContext} from "../CurrencyProvider";
import GooglePayButton from "@google-pay/button-react";

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
    const { getCurrentUserCart, updateProductInCart, purchaseCart } = useApi();
    const [cartProducts, setCartProducts] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [currency, setCurrency] = useState("USD");
    const [totalItems, setTotalItems] = useState(0);
    const { pagination, setPaginationResult, paginationLoaded, setPaginationLoaded } = usePagination();
    const [page, setPage] = useState(0);
    const [pageLoaded, setPageLoaded] = useState(false);
    const requests = useFetchRequests();
    const errorBoundary = useErrorBoundary();
    const [message, setMessage] = useState(null);
    const [openAlert, setOpenAlert] = useState(false);
    const [severity, setSeverity] = useState("error");

    // For sorting options
    //const [searchParams, setSearchParams] = useSearchParams();
    const [sortOption, setSortOption] = useState("");

    const [isCartChanged, setIsCartChanged] = useState(false);

    const { currentCurrency } = useCurrencyContext();

    useEffect(() => {
        if(isCartChanged) {
            setIsCartChanged(false);
            return;
        }
        const fetching = async (pageToFetch) => {
            try {
                if(!paginationLoaded) return;
                setPaginationLoaded(false);
                let searchParams = "";
                if(sortOption) {
                    searchParams = searchParams + `&sort=${sortOption}`;
                }
                const cart = await getCurrentUserCart(pageToFetch, 2, searchParams);
                // Only update if this is the latest request
                if (page === pageToFetch) {
                    setCartProducts(cart?.cartProducts?.content || []);
                    setTotalPrice(cart?.totalPrice?.amount || 0);
                    setCurrency(cart?.totalPrice?.currency || "USD");
                    setTotalItems(cart?.totalItems || 0);
                    setPaginationResult(cart?.cartProducts);
                }
            }
            catch (error) {
                errorBoundary.showBoundary(error);
            }
        }
        fetching(page);
    }, [page, sortOption, isCartChanged, currentCurrency]);

    const { mutate: updateProductInCartMutate } = useMutation({
        mutationFn: async ({index, productId, purchaseType, isSelected, setLoaded}) => {
            return await updateProductInCart(productId, purchaseType, isSelected);
        },
        onSuccess: async (data, variables) => {
            const index = variables.index;
            console.log("Update Product Purchase Type");
            console.log(data);
            console.log("Response");
            setCartProducts(cartProducts => {
                const newCartProducts = [...cartProducts];
                console.log("New Boy");
                newCartProducts[index] = data?.cartProduct || cartProducts[index];
                return newCartProducts;
            });
            setTotalPrice(data?.totalPrice?.amount || 0);
            setCurrency(data?.totalPrice?.currency || "USD");
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
                // after removing the product, fetch the cart at the same page again
                setIsCartChanged(true);
                setPage(0);
            }
        },
        useErrorBoundary: true,
        throwOnError: true,
    });

    const { mutate: purchaseCartMutate } = useMutation({
        mutationFn: async () => {
            return await purchaseCart(); /*requests.postWithAuth(`/api/users/current/orders/place-order`);*/
        },
        onSuccess: async (response, variables) => {
            setSeverity("success");
            setMessage("Purchase Successful");
            setOpenAlert(true);
            // after the purchase, fetch the cart again at page 0
            setPage(0);
            setIsCartChanged(true);
        },
        onError: async (error) => {
            if(error?.status === 404) {
                setMessage(await error.text());
                setSeverity("error");
                setOpenAlert(true);
            }
            else if(error?.status === 422) {
                // unprocessable entity - maybe cart is empty or no selected products
                setMessage(await error.text());
                setSeverity("warning");
                setOpenAlert(true);
            }
            else {
                // unexpected error
                errorBoundary.showBoundary(error);
            }
        },
        useErrorBoundary: false,
        throwOnError: false,
    });

    const removeProductFromCartAction = async (index, productId) => {
        removeProductFromCart({ index, productId });
    };

    const purchaseCartAction = async () => {
        purchaseCartMutate();
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

    const updateProductAction = async (index, productId, purchaseType, isSelected, setLoaded) => {
        setLoaded(false);
        updateProductInCartMutate({index, productId, purchaseType, setLoaded, isSelected});
    }

    /*useEffect(() => {
        navigation({ search: `?sort=${sortOption}` });
    }, [sortOption]);*/

    return (
        <div className="cart-page">
            {cartProducts.length === 0 ? (
                <h1 style={{ fontSize: '50px' }}>The Cart is empty.</h1>
            ) : (
                <div className="cart">
                    <Select
                        value={sortOption}
                        onChange={(e) => {
                            console.log("Fast", e.target.value);
                            setSortOption(e.target.value);
                        }}

                    >
                        <MenuItem value={"price,ASC"}>Price: Low to High</MenuItem>
                        <MenuItem value={"price,DESC"}>Price: High to Low</MenuItem>
                        <MenuItem value={"purchaseType,ASC"}>Purchase Type: Low to High</MenuItem>
                        <MenuItem value={"purchaseType,DESC"}>Purchase Type: High to Low</MenuItem>
                        <MenuItem value={"discount,ASC"}>Discount: Low to High</MenuItem>
                        <MenuItem value={"discount,DESC"}>Discount: High to Low</MenuItem>

                    </Select>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {cartProducts.map((cartProduct, index) => (
                            <li key={index}>
                                <Divider/>
                                <CartProductItem
                                    cartProduct={cartProduct}
                                    setPageLoaded={setPageLoaded}
                                    onRemove={() => removeProductFromCartAction(index, cartProduct.product.id)}
                                    onPurchaseTypeChange={(type, setLoaded) => updateProductAction(index, cartProduct.product.id, type, null, setLoaded)}
                                    onProductSelectionChange={(isSelected, setLoaded) => updateProductAction(index, cartProduct.product.id, null, isSelected, setLoaded)}
                                />
                            </li>
                        ))}
                    </ul>
                    <div className="pagination">
                        <Pagination paginationResult={pagination} changePageAction={(e, newPage) => {
                            e.preventDefault();
                            setPage(newPage);
                        }} paginationLoaded={paginationLoaded} />
                    </div>
                    <div className="cart-info">
                        Total Price (
                        {pageLoaded ?
                            <strong>{totalItems}</strong> :
                            <Skeleton variant="text" width={15}/>
                        }
                        &nbsp;items):&nbsp;
                        {pageLoaded ?
                            <strong>{totalPrice} {currency}</strong> :
                            <Skeleton variant="text" width={15} />
                        }
                    </div>
                    <GooglePayButton
                        environment="TEST"
                        paymentRequest={{
                            apiVersion: 2,
                            apiVersionMinor: 0,
                            allowedPaymentMethods: [{
                                type: 'CARD',
                                parameters: {
                                    allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                                    allowedCardNetworks: ['AMEX', 'DISCOVER', 'MASTERCARD', 'VISA'],
                                },
                                tokenizationSpecification: {
                                    type: 'PAYMENT_GATEWAY',
                                    parameters: {
                                        gateway: 'example', // replace with real gateway like 'stripe' or 'adyen'
                                        gatewayMerchantId: 'exampleMerchantId',
                                    },
                                },
                            }],
                            merchantInfo: {
                                merchantId: '01234567890123456789', // for TEST env, this can be dummy
                                merchantName: 'Demo Merchant',
                            },
                            transactionInfo: {
                                totalPriceStatus: 'FINAL',
                                totalPriceLabel: 'Total',
                                totalPrice: '3.00',
                                currencyCode: 'USD',
                                countryCode: 'US',
                            },
                        }}
                        onLoadPaymentData={paymentRequest => {
                            console.log('load payment data', paymentRequest);
                        }}
                        className="purchase-button"
                    />
                    <Button variant="contained" className="purchase-button" onClick={purchaseCartAction}>
                        Purchase
                    </Button>
                </div>
            )}
            <Fade
                in={openAlert}
                //timeout={{ enter: 500, exit: 200 }}
                timeout={1000}
                addEndListener={() => {
                    setTimeout(() => {
                        setOpenAlert(false)
                    }, 1000);
                }}
            >
                <Alert severity={severity} onClose={() => setOpenAlert(false)} >{message}</Alert>
            </Fade>
        </div>
    );
};

const CartProductItem = ({ cartProduct, setPageLoaded, onRemove, onPurchaseTypeChange, onProductSelectionChange }) => {
    const [loaded, setLoaded] = useState(true);
    const product = cartProduct?.product;
    const movie = product?.movie;
    console.log(cartProduct?.purchaseType);

    useEffect(() => {
        setPageLoaded(loaded);
    }, [loaded]);

    if(!loaded) return <CartProductItemSkeleton/>;

    return (
        <div className="cart-product-main">
            <div className="cart-product">
                <div className="select-product-button-container">
                    <Checkbox
                        checked={(cartProduct?.isSelected) || false}
                        onChange={(e) => onProductSelectionChange(e.target.checked, setLoaded)}
                    />
                </div>
                <Link to={"/movie/" + movie?.id} className="product-link">
                    <img src={movie?.posterPath} alt={movie?.name} className="product-poster"/>
                </Link>
                <div>
                    <Link to={"/movie/" + movie?.id} className="product-link">
                        <div className="product-name">{movie?.name}</div>
                    </Link>
                    <div className="product-purchase-panel">
                        Purchase Type:
                        <Select
                            id="purchase-option"
                            value={cartProduct?.purchaseType || 'buy'}
                            onChange={(e) => onPurchaseTypeChange(e.target.value, setLoaded)}
                            style={{ marginLeft: '10px', width: '100px' }}
                        >
                            <MenuItem value="buy">Buy</MenuItem>
                            <MenuItem value="rent">Rent</MenuItem>
                        </Select>
                    </div>
                    <div style={{ fontSize: '14px', color: 'gray' }}>
                        {cartProduct?.purchaseType === 'buy' ? 'Buy for:' : 'Rent for:'} {cartProduct?.price?.amount} {cartProduct?.price?.currency}
                    </div>
                </div>
            </div>
            <div className="remove-product-button-container">
                <IconButton aria-label="delete" size="large" className="remove-product-button" onClick={onRemove} >
                    <DeleteIcon />
                </IconButton>
            </div>
        </div>
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