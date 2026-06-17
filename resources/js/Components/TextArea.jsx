import { forwardRef, useRef } from 'react';

export default forwardRef(function TextArea(
    { className = '', ...props },
    ref,
) {
    const localRef = useRef(null);

    return (
        <textarea
            {...props}
            className={'rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ' + className}
            ref={ref || localRef}
        />
    );
});
