import React, {Fragment, Suspense, use, useEffect, useState} from 'react';
import {useApi} from '../http/api';
import {ErrorBoundary, useErrorBoundary} from "react-error-boundary";
import {useMutation, useQuery} from "react-query";
import {useFetchRequests} from "../http/requests";
import './CartPage.css';
import {NotFoundErrorBoundary} from "./ApiErrorUtils";
import {Box, Button, Checkbox, Fade, IconButton, MenuItem, Paper, Select, Skeleton, Typography} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import {Pagination, usePagination} from "./Pagination";
import {Link, useNavigate, useNavigation, useSearchParams} from "react-router-dom";
import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import {useCurrencyContext} from "../CurrencyProvider";
import GooglePayButton from "@google-pay/button-react";
import {CustomSuspenseOnlyInFirstLoad} from "./CustomSuspense";

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

const defaultCurrency = {code: "USD", symbol: "$"};
const defaultCountry = {code: "US", name: "United States"};

const CartPage = () => {
    console.log("Hellllllllll")
    const { getCurrentUserCart, updateProductInCart, purchaseCart } = useApi();
    const [cartProducts, setCartProducts] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [currency, setCurrency] = useState(defaultCurrency);
    const [country, setCountry] = useState(defaultCountry);
    const [totalItems, setTotalItems] = useState(0);
    const { pagination, setPaginationResult, paginationLoaded, setPaginationLoaded } = usePagination();
    const [page, setPage] = useState(0);
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
                    setCurrency(cart?.totalPrice?.currency || defaultCurrency);
                    setCountry(cart?.country || defaultCountry);
                    setTotalItems(cart?.totalItems || 0);

                    console.log(cart?.totalPrice?.amount)

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
            setCurrency(data?.totalPrice?.currency || defaultCurrency);
            setCountry(data?.countryCode || defaultCountry);
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

    return (
        <Fragment>
            <CartPageWrapper paginationLoaded={paginationLoaded} cartProducts={cartProducts}>
                <Box>
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
                                    paginationLoaded={paginationLoaded}
                                    setPaginationLoaded={setPaginationLoaded}
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
                        {paginationLoaded ?
                            <strong>{totalItems}</strong> :
                            <Skeleton variant="text" width={15}/>
                        }
                        &nbsp;items):&nbsp;
                        {paginationLoaded ?
                            <strong>{totalPrice} {currency?.symbol}</strong> :
                            <Skeleton variant="text" width={15} />
                        }
                    </div>
                    {paginationLoaded && <GooglePayButton
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
                                totalPrice: totalPrice,
                                currencyCode: currency?.code,
                                countryCode: country?.code,
                            },
                        }}
                        onLoadPaymentData={paymentRequest => {
                            console.log('load payment data', paymentRequest);
                            purchaseCartAction();
                        }}
                        className="purchase-button"
                    />
                    }
                </Box>
            </CartPageWrapper>
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
        </Fragment>
    );
};

const CartProductItem = ({ cartProduct, onRemove, onPurchaseTypeChange, onProductSelectionChange, paginationLoaded, setPaginationLoaded }) => {
    const [loaded, setLoaded] = useState(true);
    const product = cartProduct?.product;
    const movie = product?.movie;
    console.log(cartProduct?.purchaseType);

    useEffect(() => {
        setPaginationLoaded(loaded);
    }, [loaded]);

    if(!loaded || !paginationLoaded) return <CartProductItemSkeleton/>;

    return (
        <Paper className="cart-product-main">
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
                        {cartProduct?.purchaseType === 'buy' ? 'Buy for:' : 'Rent for:'} {cartProduct?.price?.amount} {cartProduct?.price?.currency?.symbol}
                    </div>
                </div>
            </div>
            <div className="remove-product-button-container">
                <IconButton aria-label="delete" size="large" className="remove-product-button" onClick={onRemove} >
                    <DeleteIcon />
                </IconButton>
            </div>
        </Paper>
    );
};

const CartPageWrapper = ({children, paginationLoaded, cartProducts}) => {
    return (
        <Box
            sx={{
                minHeight: '400px', // fixed height to prevent jumps; adjust as needed
                display: 'flex',
                alignItems: 'center',
                px: 2,
            }}
        >
            <CustomSuspenseOnlyInFirstLoad fallbackComponent={
                <Box sx={{ width: '100%'}}>
                    <CartSkeleton />
                </Box>
            } isPageLoaded={paginationLoaded}>
                <Box sx={{ width: '100%' }}>
                    {cartProducts.length === 0 ? (
                        <Box
                            sx={{
                                height: '60vh',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textAlign: 'center',
                                px: 2,
                            }}
                        >
                            <Box>
                                <Typography variant="h4" component="h1" gutterBottom>
                                    Your Cart is Empty
                                </Typography>
                                <Typography
                                    variant="body1"
                                    color="text.secondary"
                                    sx={{ maxWidth: 400 }}
                                >
                                    You haven’t added any items to your cart yet. Start exploring our products to find something you like!
                                </Typography>
                            </Box>
                        </Box>
                    ) : (
                        <Fade in timeout={600} unmountOnExit>
                            {children}
                        </Fade>
                    )}
                </Box>
            </CustomSuspenseOnlyInFirstLoad>
        </Box>
    );
}

const CartSkeleton = () => {
    return (
        <div>
            <CartProductItemSkeleton />
            <CartProductItemSkeleton />
        </div>
    )
}

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