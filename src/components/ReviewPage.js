import {useParams, useSearchParams} from "react-router-dom";
import React, {Suspense, use, useEffect} from "react";
import AppBar from "./AppBar";
import {getActorsMovie, getDirectorsMovie, getMovie, getReviewsOfMovie} from "../http/api";
import Pagination from "./Pagination";

export default function LoadReviewPage() {
    const { id } = useParams();
    console.log("Load Review Page");
    console.log(id);
    const [searchParams, setSearchParams] = useSearchParams();
    console.log(searchParams);
    const page = Number(searchParams.get("page")) || 1;

    console.log("Page: " + page);
    console.log("Page: " + (Number(page)+1));
    console.log("Page: " + (page+1));
    return (
        <Suspense key={page} fallback={<div>Loading Reviews...</div>}>
            <ReviewsList reviewsPromise={getReviewsOfMovie(id, page-1)} />
        </Suspense>
    );
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

const ReviewsList = ({ reviewsPromise }) => {
    const reviews = use(reviewsPromise);
    console.log(reviews);
    return (
        <div>
            {reviews?.content?.length > 0 ? (
                reviews?.content?.map((review) => (
                    <div key={review.id} className="review">
                        <h3>{review.title}</h3>
                        <p>{review.content}</p>
                        <p><strong>Rating:</strong> {review.rating}/100</p>
                    </div>
                ))
            ) : (
                <p>No reviews yet.</p>
            )}
            <div className="pagination">
                <Pagination paginationResult={reviews} />
            </div>
        </div>
);
};