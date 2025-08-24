import { InertiaLinkProps, Link } from '@inertiajs/react';

export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}: InertiaLinkProps & { active: boolean }) {
    return (
        <Link
            {...props}
            className={
                'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium leading-5 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#354eab] focus:ring-offset-2 rounded-t-lg ' +
                (active
                    ? 'border-[#354eab] text-[#354eab] bg-[#f8faff] px-3 py-2 -mx-2 -mt-2'
                    : 'border-transparent text-gray-600 hover:border-[#4a5fc7] hover:text-[#354eab] hover:bg-[#f8faff] px-3 py-2 -mx-2 -mt-2') +
                className
            }
        >
            {children}
        </Link>
    );
}
