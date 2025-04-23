import { useSearchParams } from "react-router-dom";
import './Pagination.css';

function getPageNumber(searchParams) {
    return Number(searchParams.get("page")) || 1;
}

const ChangePage = ({page}) => {
    return page ? (
        <ChangePageButton page={page} text={`${page}`}/>
    ) : null;
};

const ChangePageButton = ({page, text}) => {
    const [searchParams, setSearchParams] = useSearchParams({});
    const searchObject = Object.fromEntries(searchParams.entries());

    return page ? (
        <a className="page-number" onClick={(e) => {
            e.preventDefault();
            console.log("Page: " + page);
            console.log(searchObject)
            console.log({...searchObject, page: `${page}`});
            const currentPageNumber = getPageNumber(searchParams);
            // prevent reloading current page
            if(currentPageNumber === page) {
                return;
            }
            setSearchParams({...searchObject, page: `${page}`});
        }}>
            {text}
        </a>
    ) : null;
};

const Pagination = ({ paginationResult }) => {
    const page = paginationResult?.number != null ? paginationResult.number + 1 : null;
    return (
        <div className="pagination-bar">
            {!paginationResult?.first ? (
                <>
                    <ChangePageButton page={page-1} text="Previous"/>
                    <ChangePage page={1}/>
                </>
            ) : null}
            {paginationResult?.number != null ? (
                <div className="current-page-number">
                    <ChangePage page={page}/>
                </div>
                ) : null}
            {!paginationResult?.last ? (
                <>
                    <ChangePage page={paginationResult?.totalPages}/>
                    <ChangePageButton page={page+1} text="Next"/>
                </>
            ) : null}
        </div>
    );
};

export default Pagination;