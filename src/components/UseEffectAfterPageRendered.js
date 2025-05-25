import {useEffect, useRef} from "react";

export function useEffectAfterPageRendered(effect, dependencies?: any[]) {
    const hasPageRendered = useRef(false);

    useEffect(() => {
        if (hasPageRendered.current) {
            effect();
        } else {
            hasPageRendered.current = true;
        }
    }, dependencies);
}