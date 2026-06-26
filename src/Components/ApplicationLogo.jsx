export default function ApplicationLogo(props) {
    return (
        <svg
            {...props}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
        >
            {/* Hospital Building Icon */}
            <path d="M13 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V9l-7-7zm0 2l5 5h-5V4zM8 12h3v3h2v-3h3v-2h-3V7h-2v3H8v2z" />
        </svg>
    );
}
