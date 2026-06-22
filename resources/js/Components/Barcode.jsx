import { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

export default function Barcode({ value, width = 1.5, height = 30, fontSize = 10 }) {
    const ref = useRef(null);

    useEffect(() => {
        if (ref.current && value) {
            JsBarcode(ref.current, value, {
                format: 'CODE128',
                width,
                height,
                displayValue: true,
                fontSize,
                margin: 0,
            });
        }
    }, [value, width, height, fontSize]);

    return <svg ref={ref} />;
}
