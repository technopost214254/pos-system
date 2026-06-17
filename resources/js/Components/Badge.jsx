export default function Badge({ children, variant = 'blue', size = 'md' }) {
    const variants = {
        blue: 'bg-blue-100 text-blue-800',
        green: 'bg-green-100 text-green-800',
        red: 'bg-red-100 text-red-800',
        yellow: 'bg-yellow-100 text-yellow-800',
        purple: 'bg-purple-100 text-purple-800',
        gray: 'bg-gray-100 text-gray-800',
        teal: 'bg-teal-100 text-teal-800',
    };

    const sizes = {
        sm: 'px-2 py-1 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-2 text-base',
    };

    return (
        <span className={`inline-block rounded-full font-medium ${variants[variant] || variants.blue} ${sizes[size] || sizes.md}`}>
            {children}
        </span>
    );
}
