import React from 'react';

/**
 * Scholar v4 icon set — ported from design/templates/Scholar-v4.jsx (`Ic` map).
 * Single-stroke editorial style. All icons accept `size` (defaults to 18) and
 * `color` (defaults to `currentColor`) so they integrate with text color.
 *
 * Usage:
 *   import { S4Icons } from '@/components/Scholar/icons/ScholarV4Icons';
 *   <S4Icons.Dash size={20} className="text-accent-gold" />
 */

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

const make = (path: React.ReactNode, defaultSize = 18, strokeWidth = 1.6) =>
  function Icon({ size = defaultSize, color = 'currentColor', className }: IconProps) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden
      >
        {path}
      </svg>
    );
  };

export const S4Icons = {
  Dash:   make(<><path d="M5 4h10l4 4v12H5z" /><path d="M15 4v4h4" /><path d="M9 13l2 2 4-4" /></>),
  Lib:    make(<><path d="M4 4h4a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4z" /><path d="M20 4h-4a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h4z" /><path d="M12 6v14" /></>),
  Quiz:   make(<><path d="M5 4h11l4 4v12H5z" /><path d="M16 4v4h4" /><path d="M9 12h6M9 15h4" /></>),
  Play:   make(<><rect x="3" y="7" width="18" height="12" rx="3" /><path d="M7 12h2M8 11v2" /><circle cx="15" cy="11" r=".7" fill="currentColor" /><circle cx="17" cy="13" r=".7" fill="currentColor" /></>),
  Room:   make(<><rect x="3" y="6" width="14" height="10" rx="1.5" /><path d="M17 9l4-2v10l-4-2z" /></>),
  Aca:    make(<><path d="M4 6l8-3 8 3-8 3z" /><path d="M8 8v7M16 8v7M4 6v9M20 6v9" /><path d="M4 15h16" /></>),
  Hist:   make(<><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" /><path d="M12 8v5l3 2" /></>),
  About:  make(<><circle cx="12" cy="12" r="9" /><path d="M12 11v5" /><circle cx="12" cy="8" r=".7" fill="currentColor" /></>),
  Feedback: make(<><path d="M4 4h16v9H10l-4 4v-4H4z" /><path d="M8 8h8M8 11h5" /></>),
  Bell:   make(<><path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2H4.5z" /><path d="M10 20a2 2 0 0 0 4 0" /></>, 16),
  Spark:  make(<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" />, 16, 1.7),
  Search: make(<><circle cx="11" cy="11" r="6" /><path d="m20 20-4.3-4.3" /></>, 16, 1.7),
  Upload: make(<><path d="M12 16V4m0 0-4 4m4-4 4 4" /><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" /></>, 20),
  Doc:    make(<><path d="M6 3h9l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" /><path d="M14 3v5h5" /></>, 14, 1.7),
  Paste:  make(<><path d="M9 4h6v3H9z" /><path d="M5 7h14v13H5z" /><path d="M8 12h8M8 15h6" /></>, 14, 1.7),
  Ocr:    make(<><path d="M4 8V5a1 1 0 0 1 1-1h3M20 8V5a1 1 0 0 0-1-1h-3M4 16v3a1 1 0 0 0 1 1h3M20 16v3a1 1 0 0 1-1 1h-3" /><path d="M8 12h8" /></>, 14, 1.7),
  Plus:   make(<path d="M12 5v14M5 12h14" />, 14, 2),
  Arrow:  make(<path d="M5 12h14m-5-5 5 5-5 5" />, 14, 2),
  Globe:  make(<><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></>, 14, 1.7),
  User:   make(<><circle cx="12" cy="8" r="4" /><path d="M4 21c1-4 4.5-6 8-6s7 2 8 6" /></>, 14, 1.7),
  Heart:  make(<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" />, 14, 1.7),
  Group:  make(<><circle cx="9" cy="9" r="3" /><circle cx="17" cy="10" r="2.2" /><path d="M3 19c.5-3 3-5 6-5s5.5 2 6 5" /></>, 14, 1.7),
  Bulb:   make(<><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10c1 1 1.5 2 1.5 3h5c0-1 .5-2 1.5-3a6 6 0 0 0-4-10z" /></>, 14, 1.7),
  Chat:   make(<path d="M4 5h16v11H8l-4 4z" />, 14, 1.7),
  Trend:  make(<><path d="M3 17l6-6 4 4 8-8" /><path d="M14 7h7v7" /></>, 14, 1.7),
  Target: make(<><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" fill="currentColor" /></>, 14, 1.7),
  Folder: make(<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />, 14, 1.7),
  Mail:   make(<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>, 14, 1.7),
} as const;

export type S4IconName = keyof typeof S4Icons;
export default S4Icons;
