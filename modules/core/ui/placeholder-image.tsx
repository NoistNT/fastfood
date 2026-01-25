interface PlaceholderImageProps {
  className?: string;
  width?: number;
  height?: number;
}

export function PlaceholderImage({
  className = '',
  width = 400,
  height = 300,
}: PlaceholderImageProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 400 300"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id="grad1"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop
            offset="0%"
            className="text-gray-100 dark:text-gray-800"
            style={{ stopColor: 'currentColor', stopOpacity: 0.1 }}
          />
          <stop
            offset="100%"
            className="text-gray-200 dark:text-gray-700"
            style={{ stopColor: 'currentColor', stopOpacity: 0.2 }}
          />
        </linearGradient>
      </defs>
      <rect
        width="400"
        height="300"
        fill="url(#grad1)"
      />
      <circle
        cx="200"
        cy="120"
        r="40"
        className="fill-gray-300 dark:fill-gray-600"
      />
      <rect
        x="160"
        y="180"
        width="80"
        height="8"
        rx="4"
        className="fill-gray-300 dark:fill-gray-600"
      />
      <rect
        x="180"
        y="200"
        width="40"
        height="6"
        rx="3"
        className="fill-gray-300 dark:fill-gray-600"
      />
      <rect
        x="170"
        y="220"
        width="60"
        height="6"
        rx="3"
        className="fill-gray-300 dark:fill-gray-600"
      />
      <text
        x="200"
        y="270"
        textAnchor="middle"
        className="fill-gray-500 dark:fill-gray-400"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="14"
      >
        Product Image
      </text>
    </svg>
  );
}
