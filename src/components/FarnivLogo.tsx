import React from 'react';

interface FarnivLogoProps {
  className?: string;
  variant?: 'dark' | 'light' | 'badge' | 'mark';
  height?: number | string;
}

export const FarnivLogo: React.FC<FarnivLogoProps> = ({
  className = '',
  variant = 'dark',
  height,
}) => {
  const isBadge = variant === 'badge';
  const isLight = variant === 'light' || isBadge;
  const isMarkOnly = variant === 'mark';

  const subtitleColor = isLight ? '#1e293b' : '#f1f5f9';
  const redColor = '#E31E24';

  const svgContent = (
    <svg
      viewBox={isMarkOnly ? '0 10 420 85' : '0 10 460 125'}
      className={`w-auto select-none ${className}`}
      style={height ? { height } : undefined}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <style>{`
          .farniv-sub {
            font-family: 'Montserrat', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 15.5px;
            font-weight: 600;
            letter-spacing: 0.36em;
            text-anchor: middle;
          }
        `}</style>
      </defs>

      {/* Farniv Red Logotype with authentic forward dynamic slant matching official brand */}
      <g transform="skewX(-14) translate(38, 0)" fill={redColor}>
        {/* Top horizontal red wing spanning across the wordmark */}
        <path d="M 68 20 L 348 20 L 342 35 L 70 35 Z" />

        {/* Letter F with smooth rounded top-left curve connecting to the top wing */}
        <path d="M 70 20 C 48 20, 36 32, 36 50 L 36 90 L 54 90 L 54 55 C 54 44, 60 35, 72 35 Z" />

        {/* Middle crossbar of F connecting towards A */}
        <rect x="54" y="52" width="34" height="15" />

        {/* Letter A */}
        <path d="M 78 90 L 100 35 L 124 35 L 146 90 L 127 90 L 121 73 L 102 73 L 96 90 Z M 106 58 L 117 58 L 111 44 Z" />

        {/* Letter R */}
        <path d="M 152 35 L 186 35 C 198 35, 204 42, 204 53 C 204 62, 197 68, 186 69 L 207 90 L 187 90 L 170 70 L 169 70 L 169 90 L 152 90 Z M 169 57 L 183 57 C 188 57, 191 55, 191 52 C 191 48, 188 47, 183 47 L 169 47 Z" />

        {/* Letter N */}
        <path d="M 213 35 L 230 35 L 253 73 L 253 35 L 270 35 L 270 90 L 252 90 L 230 52 L 230 90 L 213 90 Z" />

        {/* Letter I */}
        <path d="M 280 35 L 297 35 L 297 90 L 280 90 Z" />

        {/* Letter V */}
        <path d="M 307 35 L 325 35 L 338 74 L 351 35 L 369 35 L 348 90 L 328 90 Z" />
      </g>

      {/* Subtitle: SAFE BOX & VAULT PRODUCER */}
      {!isMarkOnly && (
        <text x="232" y="122" className="farniv-sub" fill={subtitleColor}>
          SAFE BOX &amp; VAULT PRODUCER
        </text>
      )}
    </svg>
  );

  if (isBadge) {
    return (
      <div className="inline-flex items-center justify-center bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-md">
        {svgContent}
      </div>
    );
  }

  return svgContent;
};
