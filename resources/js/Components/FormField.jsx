import { forwardRef } from 'react';
import InputLabel from './InputLabel';
import TextInput from './TextInput';
import InputError from './InputError';

export default forwardRef(function FormField({ label, error, type = 'text', className = '', children, ...props }, ref) {
    return (
        <div className={className}>
            {label && <InputLabel htmlFor={props.id}>{label}</InputLabel>}
            {children ? (
                children
            ) : (
                <TextInput
                    {...props}
                    ref={ref}
                    type={type}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                />
            )}
            {error && <InputError message={error} className="mt-2" />}
        </div>
    );
});
