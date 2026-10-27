import { useEffect, useRef, useState } from 'react';

// Becomes true the first time any part of the element enters the viewport, then stops observing.
export const useInView = () => {
    const ref = useRef(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element || inView) return;

        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setInView(true);
                observer.disconnect();
            }
        });
        observer.observe(element);
        return () => observer.disconnect();
    }, [inView]);

    return [ref, inView];
};
