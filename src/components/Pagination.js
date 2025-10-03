import { useSearchParams } from "react-router-dom";
import './Pagination.css';
import {useState} from "react";
import {ToggleButton, ToggleButtonGroup} from "@mui/material";


/*
export const CustomToggleButton = styled(ToggleButton)(({ theme }) => ({
    "&.Mui-selected": {
        color: "#fff",
        "&:hover": {
            color: "#fff",
        },
    },
    "&:hover": {
        color: "#fff",
    },
}));
*/

export function useCurrentPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    return getPageNumber(searchParams);
}

function getPageNumber(searchParams) {
    return Number(searchParams.get("page")) || 1;
}

const ChangePage = ({page, changePageAction, isCurrentPage}) => {
    return page ? (
        <ChangePageButton page={page} text={`${page}`} changePageAction={changePageAction} isCurrentPage={isCurrentPage} />
    ) : null;
};

const ChangePageButton = ({page, text, changePageAction}) => {
    return page ? (
        <ToggleButton value={text} onClick={(e) => changePageAction(e, page-1)}>
            {text}
        </ToggleButton>
    ) : null;
};

export function usePagination() {
    const [pagination, setPagination] = useState(null);
    const setPaginationResult = (result) => {
        const paginationResult = {};
        paginationResult.number = result?.number;
        paginationResult.totalPages = result?.totalPages;
        paginationResult.first = result?.first;
        paginationResult.last = result?.last;
        setPagination(paginationResult);
    }
    return { pagination, setPaginationResult };
}

export const Pagination = ({ paginationResult, changePageAction }) => {
    const page = paginationResult?.number != null ? paginationResult.number + 1 : null;
    return (
        <ToggleButtonGroup
            className="pagination-bar"
            exclusive
            defaultValue={`${page}`}
            value={`${page}`}
        >
            {!paginationResult?.first && (
                <>
                    <ChangePageButton page={page-1} text="Previous" changePageAction={changePageAction} />
                    <ChangePage page={1} changePageAction={changePageAction} />
                </>
            )}
            {paginationResult?.number != null && (
                <ChangePage page={page} changePageAction={changePageAction} />
            )}
            {!paginationResult?.last && (
                <>
                    <ChangePage page={paginationResult?.totalPages} changePageAction={changePageAction} />
                    <ChangePageButton page={page+1} text="Next" changePageAction={changePageAction} />
                </>
            )}
        </ToggleButtonGroup>
    );
};

export const PaginationNavigatePage = ({ paginationResult }) => {
    const [searchParams, setSearchParams] = useSearchParams({});
    const searchObject = Object.fromEntries(searchParams.entries());
    const changePageAction = (e, page) => {
        e.preventDefault();
        const urlPage = page + 1;
        const currentPageNumber = getPageNumber(searchParams);
        // prevent reloading current page
        if(currentPageNumber === urlPage) {
            return;
        }
        setSearchParams({...searchObject, page: `${urlPage}`});
    };
    return <Pagination paginationResult={paginationResult} changePageAction={changePageAction} />
};