import React, {Suspense,use, useEffect, useState} from 'react';
import {useApi} from '../http/api';
import {ErrorBoundary, useErrorBoundary} from "react-error-boundary";
import {useMutation, useQuery} from "react-query";
import {useFetchRequests} from "../http/requests";
import './CartPage.css';
import {NotFoundErrorBoundary} from "./ApiErrorUtils";
import {Fade, IconButton, MenuItem, Select, Skeleton} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import {Pagination, usePagination} from "./Pagination";
import {Link, useNavigate, useNavigation, useSearchParams} from "react-router-dom";
import Alert from "@mui/material/Alert";

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
    const [totalItems, setTotalItems] = useState(0);
    const { pagination, setPaginationResult } = usePagination();
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

    useEffect(() => {
        const fetching = async () => {
            try {
                let searchParams = "";
                if(sortOption) {
                    searchParams = searchParams + `&sort=${sortOption}`;
                }
                const cart = await getCurrentUserCart(page, 1, searchParams);
                setCartProducts(cart?.cartProducts?.content || []);
                setTotalPrice(cart?.totalPrice || 0);
                setTotalItems(cart?.totalItems || 0);
                setPaginationResult(cart?.cartProducts);
            }
            catch (error) {
                errorBoundary.showBoundary(error);
            }
        }
        fetching();
    }, [page, sortOption]);

    const { mutate: updateProductPurchaseType } = useMutation({
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
                console.log("New Boy");
                newCartProducts[index] = data?.cartProduct?.content || cartProducts[index];
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
            setCartProducts([]);
        },
        onError: async (error) => {
            if(error?.status === 404) {
                setMessage(await error.text());
                setSeverity("error");
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

    const productPurchaseTypeChange = async (index, productId, purchaseType, setLoaded) => {
        setLoaded(false);
        updateProductPurchaseType({index, productId, purchaseType, setLoaded});
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
                                <CartProductItem
                                    cartProduct={cartProduct}
                                    setPageLoaded={setPageLoaded}
                                    onRemove={() => removeProductFromCartAction(index, cartProduct.product.id)}
                                    onPurchaseTypeChange={(type, setLoaded) => productPurchaseTypeChange(index, cartProduct.product.id, type, setLoaded)}
                                />
                            </li>
                        ))}
                    </ul>
                    <div className="pagination">
                        <Pagination paginationResult={pagination} changePageAction={(e, newPage) => {
                            e.preventDefault();
                            setPage(newPage);
                        }}/>
                    </div>
                    <div className="cart-info">
                        Total Price (
                        {pageLoaded ?
                            <strong>{totalItems}</strong> :
                            <Skeleton variant="text" width={15}/>
                        }
                        &nbsp;items):&nbsp;
                        {pageLoaded ?
                            <strong>{totalPrice}</strong> :
                            <Skeleton variant="text" width={15} />
                        }
                    </div>
                    <button className="purchase-button" onClick={purchaseCartAction}>
                        Purchase
                    </button>
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

const CartProductItem = ({ cartProduct, setPageLoaded, onRemove, onPurchaseTypeChange}) => {
    const [loaded, setLoaded] = useState(true);
    const product = cartProduct?.product;
    const movie = product?.movie;
    console.log(cartProduct?.purchaseType);

    useEffect(() => {
        setPageLoaded(loaded);
    }, [loaded]);

    return loaded ? (
        <div className="cart-product">
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