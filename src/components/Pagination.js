import { useSearchParams } from "react-router-dom";
import './Pagination.css';

function getPageNumber(searchParams) {
    return Number(searchParams.get("page")) || 1;
}

const ChangePage = ({page, changePageAction}) => {
    return page ? (
        <ChangePageButton page={page} text={`${page}`} changePageAction={changePageAction} />
    ) : null;
};

const ChangePageButton = ({page, text, changePageAction}) => {
    const [searchParams, setSearchParams] = useSearchParams({});
    const searchObject = Object.fromEntries(searchParams.entries());

    return page ? (
        <a className="page-number" onClick={(e) => changePageAction(e, page-1)}>
            {text}
        </a>
    ) : null;
};

export const Pagination = ({ paginationResult, changePageAction }) => {
    const page = paginationResult?.number != null ? paginationResult.number + 1 : null;
    return (
        <div className="pagination-bar">
            {!paginationResult?.first ? (
                <>
                    <ChangePageButton page={page-1} text="Previous" changePageAction={changePageAction} />
                    <ChangePage page={1} changePageAction={changePageAction} />
                </>
            ) : null}
            {paginationResult?.number != null ? (
                <div className="current-page-number">
                    <ChangePage page={page} changePageAction={changePageAction} />
                </div>
                ) : null}
            {!paginationResult?.last ? (
                <>
                    <ChangePage page={paginationResult?.totalPages} changePageAction={changePageAction} />
                    <ChangePageButton page={page+1} text="Next" changePageAction={changePageAction} />
                </>
            ) : null}
        </div>
    );
};

export const PaginationNavigatePage = ({ paginationResult }) => {
    const [searchParams, setSearchParams] = useSearchParams({});
    const searchObject = Object.fromEntries(searchParams.entries());
    const changePageAction = (e, page) => {
        e.preventDefault();
        const urlPage = page + 1;
        console.log("Page: " + page);
        console.log(searchObject)
        console.log({...searchObject, page: `${page}`});
        const currentPageNumber = getPageNumber(searchParams);
        // prevent reloading current page
        if(currentPageNumber === urlPage) {
            return;
        }
        setSearchParams({...searchObject, page: `${urlPage}`});
    };
    return <Pagination paginationResult={paginationResult} changePageAction={changePageAction} />
};