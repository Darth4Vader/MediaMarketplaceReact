import {useEffect, useState} from "react";


export const PaginationScroll = ({ page, setPage, lastPage, children }) => {
    //const firstPage = paginationResult?.number != null ? paginationResult.number + 1 : 1;
    //const [page, setPage] = useState(firstPage);

    const handleScroll = () => {
        const bottom =
            Math.ceil(window.innerHeight + window.scrollY) >=
            document.documentElement.scrollHeight - 200;
        console.log(bottom);
        console.log(lastPage);
        console.log(page);
        if (bottom && !lastPage) {
            setPage((prevPage) => {
                const nextPage = prevPage + 1;
                //changePageAction(page-1);
                return nextPage;
            });
        }
    };

    /*
    useEffect(() => {
        if(!lastPage) {
            window.addEventListener("scroll", handleScroll);
            return () => {
                window.removeEventListener("scroll", handleScroll);
            };
        }
        else {
            window.removeEventListener("scroll", handleScroll);
        }
    }, [lastPage]);
     */

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);


    return children;
};

export const PaginationScroll2 = ({ page, setPage, lastPage, children }) => {
    //const firstPage = paginationResult?.number != null ? paginationResult.number + 1 : 1;
    //const [page, setPage] = useState(firstPage);

    const handleScroll = () => {
        const bottom =
            Math.ceil(window.innerHeight + window.scrollY) >=
            document.documentElement.scrollHeight - 200;
        console.log(bottom);
        console.log(lastPage);
        console.log(page);
        if (bottom && !lastPage) {
            setPage((prevPage) => {
                const nextPage = prevPage + 1;
                //changePageAction(page-1);
                return nextPage;
            });
        }
    };

    /*
    useEffect(() => {
        if(!lastPage) {
            window.addEventListener("scroll", handleScroll);
            return () => {
                window.removeEventListener("scroll", handleScroll);
            };
        }
        else {
            window.removeEventListener("scroll", handleScroll);
        }
    }, [lastPage]);
     */

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);


    return children;
};


/*
export const PaginationScroll = ({ page, changePageAction, children }) => {
    const firstPage = paginationResult?.number != null ? paginationResult.number + 1 : 1;
    const [page, setPage] = useState(firstPage);

    const handleScroll = () => {
        const bottom =
            Math.ceil(window.innerHeight + window.scrollY) >=
            document.documentElement.scrollHeight - 200;
        if (bottom) {
            setPage((prevPage) => {
                const nextPage = prevPage + 1;
                changePageAction(page-1);
                return nextPage;
            });
        }
    };

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);



    return (
        {
            children
        }
    );
};
 */