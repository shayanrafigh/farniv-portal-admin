import React from 'react';

interface FarnivLogoProps {
  className?: string;
  variant?: 'dark' | 'light' | 'badge' | 'mark';
  height?: number | string;
}

export const FarnivLogo: React.FC<FarnivLogoProps> = ({
  className = '',
  variant = 'light',
  height,
}) => {
  const isBadge = variant === 'badge';
  const isLight = variant === 'light' || isBadge;
  const isMarkOnly = variant === 'mark';

  // Subtitle color: dark on light backgrounds, crisp white/slate on dark backgrounds
  const subtitleColor = isLight ? '#111827' : '#F8FAFC';
  const redColor = '#E51A22';

  const svgContent = (
    <svg
      viewBox={isMarkOnly ? '30 14 410 92' : '0 0 520 160'}
      className={`w-auto select-none ${className}`}
      style={height ? { height } : undefined}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <style>{`
          .farniv-sub-text {
            font-family: 'Montserrat', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 15.5px;
            font-weight: 500;
            letter-spacing: 0.32em;
            text-anchor: middle;
          }
        `}</style>
      </defs>

      {/* Official Farniv Red Logotype with Authentic Dynamic Forward Slant */}
      <g transform="skewX(-13.5) translate(40, 6)" fill={redColor}>
        {/* Top horizontal red wing spanning across the wordmark with slanted right cut */}
        <path d="M 68 18 
                 L 392 18 
                 L 384 33 
                 L 70 33 
                 Z" />

        {/* Letter F with smooth rounded top-left and bottom-left curves */}
        <path d="M 70 18
                 C 45 18, 32 30, 32 50
                 L 32 94
                 C 32 97, 34 98, 38 98
                 L 54 98
                 L 54 58
                 C 54 44, 59 33, 72 33
                 Z" />

        {/* Middle crossbar of F with slanted right cut */}
        <path d="M 54 54 L 92 54 L 88 68 L 54 68 Z" />

        {/* Letter A with rounded apex */}
        <path d="M 78 98 
                 L 100 36 
                 L 124 36 
                 L 146 98 
                 L 127 98 
                 L 122 80 
                 L 104 80 
                 L 98 98 
                 Z 
                 M 108 64 
                 L 118 64 
                 L 113 46 
                 Z" />

        {/* Letter R with curved upper loop and slanted diagonal leg */}
        <path d="M 152 36 
                 L 186 36 
                 C 199 36, 206 43, 206 54 
                 C 206 63, 199 69, 188 70 
                 L 209 98 
                 L 188 98 
                 L 170 75 
                 L 170 98 
                 L 152 98 
                 Z 
                 M 170 58 
                 L 184 58 
                 C 188 58, 191 56, 191 53 
                 C 191 49, 188 48, 183 48 
                 L 170 48 
                 Z" />

        {/* Letter N */}
        <path d="M 214 36 
                 L 232 36 
                 L 256 79 
                 L 256 36 
                 L 274 36 
                 L 274 98 
                 L 256 98 
                 L 232 55 
                 L 232 98 
                 L 214 98 
                 Z" />

        {/* Letter I */}
        <rect x="284" y="36" width="18" height="62" />

        {/* Letter U (Official brand letter with smooth bottom curve) */}
        <path d="M 312 36 
                 L 330 36 
                 L 330 74 
                 C 330 82, 335 86, 345 86 
                 C 355 86, 360 82, 360 74 
                 L 360 36 
                 L 378 36 
                 L 378 74 
                 C 378 91, 366 99, 345 99 
                 C 324 99, 312 91, 312 74 
                 Z" />
      </g>

      {/* Subtitle: SAFE BOX & VAULT PRODUCER */}
      {!isMarkOnly && (
        <text x="246" y="142" className="farniv-sub-text" fill={subtitleColor}>
          SAFE BOX &amp; VAULT PRODUCER
        </text>
      )}
    </svg>
  );

  if (isBadge) {
    return (
      <div className="inline-flex items-center justify-center bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-md">
        {svgContent}
      </div>
    );
  }

  return svgContent;
};
