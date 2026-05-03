
"use client";

export function Logo({ useAnimation = false }: { useAnimation?: boolean }) {
  const pathStyle: React.CSSProperties = useAnimation
    ? {
        strokeDasharray: 300,
        strokeDashoffset: 300,
        animation: 'draw-logo 2s ease-in-out forwards',
      }
    : {};
  
  const gradientId = "logo-gradient";

  return (
    <>
      {useAnimation && (
        <style>{`
          @keyframes draw-logo {
            to {
              stroke-dashoffset: 0;
            }
          }
        `}</style>
      )}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient
            id={gradientId}
            x1="0"
            y1="0"
            x2="40"
            y2="40"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="hsl(var(--primary))" />
            <stop offset="1" stopColor="hsl(var(--accent))" />
          </linearGradient>
        </defs>
        <path
          style={pathStyle}
          d="M12 30V10H17.5C20.5376 10 23 12.4624 23 15.5V15.5C23 18.5376 20.5376 21 17.5 21H12"
          stroke={`url(#${gradientId})`}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          style={{ ...pathStyle, animationDelay: '0.3s' }}
          d="M28 30L20 10"
          stroke={`url(#${gradientId})`}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </>
  );
}
