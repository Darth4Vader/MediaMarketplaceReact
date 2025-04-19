import React, {use} from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";

const ChangePage = ({page}) => {
    const location = useLocation();
    const [searchParams] = useSearchParams();

    // Clone current query string
    /*const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page); // update or add the `page` param*/

    const createPageLink = (page) => {
        const newParams = new URLSearchParams(searchParams.toString());
        newParams.set('page', page);
        return `${location.pathname}?${newParams.toString()}`;
    };

    return page ? (
        <Link key={page} to="../movie/2/reviews?page=1">
            {page}
        </Link>
    ) : null;

/*
    return page ? (
        <Link key={page} to={".."+createPageLink(page)}>
            {page}
        </Link>
    ) : null;
    */
};

const Pagination = ({ paginationResult }) => {
    const page = paginationResult?.number != null ? paginationResult.number + 1 : null;
    console.log(paginationResult);
    console.log(page);
    console.log(paginationResult?.number != null ? paginationResult.number + 1 : null)

    const location = useLocation();

    console.log("Location: " + location)

    return (
        <div>
            {!paginationResult?.first ? (
                <div>
                    <ChangePage page={1}/>
                    <Link to={{
                        pathname: location.pathname,
                        search: `?page=${page-1}`,
                    }}>
                        Previous
                    </Link>
                </div>
            ) : null}
            {!paginationResult?.number ? (
                <ChangePage page={page}/>
                ) : null}
            {!paginationResult?.last ? (
                <div>
                    <ChangePage page={paginationResult?.totalPages}/>
                    <Link to={{
                        pathname: location.pathname,
                        search: `?page=${page+1}`,
                    }}>
                        Next
                    </Link>
                </div>
            ) : null}
        </div>
    );
};

export default Pagination;