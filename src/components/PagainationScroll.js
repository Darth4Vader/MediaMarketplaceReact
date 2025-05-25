import React, {useCallback, useEffect, useRef, useState} from "react";

export async function infiniteScrollFetchWrapper(fetchFunction, pageNumber, loading, setLoading, setHasMore) {
    if (loading) return;
    setLoading(true);
    try {
        await fetchFunction(pageNumber);
    }
    catch (error) {
        setHasMore(false);
        throw error;
    }
    finally {
        setLoading(false);
    }
}

export function useInfiniteScrollRefPage(setPage, loading, hasMore) {
    return useInfiniteScrollRef(() => setPage((prevPage) => prevPage + 1), loading, hasMore);
}

function useInfiniteScrollRef(pageCallback, loading, hasMore) {
    const observer = useRef(null);

    const lastPostElementRef = useCallback(
        (node: HTMLDivElement) => {
            console.log("Hola", loading, hasMore);
            console.log(observer.current);
            if (loading) return;
            if (observer.current) observer.current.disconnect();
            observer.current = new IntersectionObserver(
                (entries) => {
                    if (entries[0].isIntersecting && hasMore) {
                        pageCallback();
                    }
                },
                { threshold: 1.0 }
            );
            if (node) observer.current.observe(node);
        },
        [loading, hasMore, pageCallback]
    );

    return lastPostElementRef;
}

export function InfiniteScrollItem({idx, length, infiniteScrollRef, className, children}) {
    if(length === idx + 1) {
        console.log("last");
        return (
            <div ref={infiniteScrollRef} className={className}>
                {children}
            </div>
        );
    } else {
        return (
            <div className={className}>
                {children}
            </div>
        );
    }
}