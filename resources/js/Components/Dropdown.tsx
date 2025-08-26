import { Transition } from '@headlessui/react';
import { InertiaLinkProps, Link } from '@inertiajs/react';
import {
    createContext,
    Dispatch,
    PropsWithChildren,
    SetStateAction,
    useContext,
    useRef,
    useState,
} from 'react';

const DropDownContext = createContext<{
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    toggleOpen: () => void;
    openOnHover: boolean;
}>({
    open: false,
    setOpen: () => {},
    toggleOpen: () => {},
    openOnHover: false,
});

const Dropdown = ({ children, openOnHover = false, hoverDelay = 80 }: PropsWithChildren<{ openOnHover?: boolean; hoverDelay?: number }>) => {
    const [open, setOpen] = useState(false);
    const hoverTimeoutRef = useRef<number | null>(null);

    const toggleOpen = () => {
        setOpen((previousState) => !previousState);
    };

    return (
        <DropDownContext.Provider value={{ open, setOpen, toggleOpen, openOnHover }}>
            <div
                className="relative"
                onMouseEnter={() => {
                    if (!openOnHover) return;
                    if (hoverTimeoutRef.current) window.clearTimeout(hoverTimeoutRef.current);
                    hoverTimeoutRef.current = window.setTimeout(() => setOpen(true), hoverDelay);
                }}
                onMouseLeave={() => {
                    if (!openOnHover) return;
                    if (hoverTimeoutRef.current) window.clearTimeout(hoverTimeoutRef.current);
                    hoverTimeoutRef.current = window.setTimeout(() => setOpen(false), hoverDelay);
                }}
            >
                {children}
            </div>
        </DropDownContext.Provider>
    );
};

const Trigger = ({ children }: PropsWithChildren) => {
    const { open, setOpen, toggleOpen, openOnHover } = useContext(DropDownContext);

    return (
        <>
            <div onClick={toggleOpen}>{children}</div>

            {open && !openOnHover && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setOpen(false)}
                ></div>
            )}
        </>
    );
};

const Content = ({
    align = 'right',
    width = '48',
    contentClasses = 'py-1 bg-white border border-[#e3f2fd]',
    children,
}: PropsWithChildren<{
    align?: 'left' | 'right';
    width?: '48';
    contentClasses?: string;
}>) => {
    const { open, setOpen } = useContext(DropDownContext);

    let alignmentClasses = 'origin-top';

    if (align === 'left') {
        alignmentClasses = 'ltr:origin-top-left rtl:origin-top-right start-0';
    } else if (align === 'right') {
        alignmentClasses = 'ltr:origin-top-right rtl:origin-top-left end-0';
    }

    let widthClasses = '';

    if (width === '48') {
        widthClasses = 'w-48';
    }

    const arrowPositionClasses = align === 'left' ? 'left-6' : 'right-6';

    return (
        <>
            <Transition
                show={open}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 translate-y-2"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-2"
            >
                <div
                    className={`absolute z-50 mt-3 ${alignmentClasses} ${widthClasses}`}
                    onClick={() => setOpen(false)}
                >
                    <div className={`relative rounded-xl bg-white shadow-md ring-1 ring-[#bcd6f6] ${contentClasses}`}>
                        {/* Arrow pointer */}
                        <div className={`absolute -top-2 ${arrowPositionClasses} h-3 w-3 rotate-45 bg-white ring-1 ring-[#bcd6f6]`}></div>
                        <div className="rounded-xl overflow-hidden">
                            {children}
                        </div>
                    </div>
                </div>
            </Transition>
        </>
    );
};

const DropdownLink = ({
    className = '',
    children,
    ...props
}: InertiaLinkProps) => {
    return (
        <Link
            {...props}
            className={
                'block w-full px-5 py-3 text-start text-sm leading-5 text-gray-800 transition-colors duration-200 ease-in-out hover:bg-gradient-to-r hover:from-[#f8faff] hover:to-[#e8f2ff] hover:text-[#354eab] focus:outline-none ' +
                className
            }
        >
            {children}
        </Link>
    );
};

Dropdown.Trigger = Trigger;
Dropdown.Content = Content;
Dropdown.Link = DropdownLink;

export default Dropdown;
