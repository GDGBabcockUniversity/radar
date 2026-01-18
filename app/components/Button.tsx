interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "outlined" | "ghost";
  size?: "sm" | "md" | "lg";
  href?: string;
  onClick?: () => void;
  className?: string;
  showArrow?: boolean;
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  href,
  onClick,
  className = "",
  showArrow = false,
}: ButtonProps) {
  const baseStyles = `
    inline-flex items-center justify-center gap-2
    font-medium rounded-full
    transition-all duration-200 ease-out
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)]
  `;

  const variants = {
    primary: `
      bg-white text-[var(--color-text-dark)]
      hover:bg-gray-100 hover:scale-[1.02]
      active:scale-[0.98]
    `,
    outlined: `
      border-2 border-white text-white
      hover:bg-white hover:text-[var(--color-text-dark)]
      active:scale-[0.98]
    `,
    ghost: `
      text-[var(--color-text-muted)] uppercase tracking-wider text-sm
      hover:text-white
    `,
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const classes =
    `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`.trim();

  const content = (
    <>
      {children}
      {showArrow && (
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform group-hover:translate-x-1"
        >
          <path
            d="M3 8H13M13 8L9 4M13 8L9 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </>
  );

  if (href) {
    return (
      <a href={href} className={`group ${classes}`}>
        {content}
      </a>
    );
  }

  return (
    <button onClick={onClick} className={`group ${classes}`}>
      {content}
    </button>
  );
}
