import React from 'react';

interface AgbLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showDetails?: boolean;
  theme?: 'dark' | 'light' | 'auto';
}

/**
 * Official AGB Logo Component (AGB_LOGO_1_MODIFIE)
 * Official Creator & Software Publisher Brand Emblem for Gilles Brice Atsé
 */
export const AgbLogo: React.FC<AgbLogoProps> = ({
  className = '',
  size = 'md',
  showDetails = true,
  theme = 'auto',
}) => {
  // Sizing definitions
  const sizeMap = {
    xs: 'w-24',
    sm: 'w-36 sm:w-40',
    md: 'w-56 sm:w-64 md:w-72',
    lg: 'w-72 sm:w-84 md:w-96',
    xl: 'w-96 sm:w-[420px] md:w-[480px]',
    full: 'w-full max-w-2xl',
  };

  const selectedSizeClass = sizeMap[size] || sizeMap.md;

  const textColorHeader =
    theme === 'dark'
      ? 'text-sky-100'
      : theme === 'light'
      ? 'text-slate-900'
      : 'text-slate-900 dark:text-sky-100';

  const textColorEmail =
    theme === 'dark'
      ? 'text-sky-300'
      : theme === 'light'
      ? 'text-blue-900'
      : 'text-blue-900 dark:text-sky-300';

  const textColorPhone =
    theme === 'dark'
      ? 'text-slate-200'
      : theme === 'light'
      ? 'text-slate-800'
      : 'text-slate-800 dark:text-slate-200';

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* Official AGB High-Definition Vector Emblem (AGB_LOGO_1_MODIFIE) */}
      <svg
        viewBox="0 0 1000 480"
        className={`${selectedSizeClass} h-auto transition-transform`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Main 3D Bevel Gradients */}
          <linearGradient id="agb3dMain" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="25%" stopColor="#0284C7" />
            <stop offset="65%" stopColor="#0369A1" />
            <stop offset="100%" stopColor="#075985" />
          </linearGradient>

          <linearGradient id="agb3dHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#BAE6FD" />
            <stop offset="40%" stopColor="#38BDF8" />
            <stop offset="80%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#0369A1" />
          </linearGradient>

          <linearGradient id="agb3dDeep" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0284C7" />
            <stop offset="50%" stopColor="#0369A1" />
            <stop offset="100%" stopColor="#082F49" />
          </linearGradient>

          <linearGradient id="agbCircuit" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0284C7" />
            <stop offset="60%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#7DD3FC" />
          </linearGradient>

          {/* Soft 3D Glow / Shadow */}
          <filter id="agbDropShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#0284C7" floodOpacity="0.3" />
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#082F49" floodOpacity="0.4" />
          </filter>
        </defs>

        <g filter="url(#agbDropShadow)">
          {/* ========================================================= */}
          {/* 1. LETTER 'A' (Sweeping left leg, apex & flowing right leg) */}
          {/* ========================================================= */}
          {/* Base A contour */}
          <path
            d="M 180 370 L 60 370 C 60 370 180 180 270 40 L 370 40 L 480 200 L 410 200 L 335 90 L 195 300 L 260 300 L 305 370 Z"
            fill="url(#agb3dDeep)"
          />
          {/* Beveled Front Facet of A */}
          <path
            d="M 175 360 L 75 360 L 270 55 L 355 55 L 465 200 L 410 200 L 335 90 L 210 280 L 285 280 L 325 360 Z"
            fill="url(#agb3dHighlight)"
          />
          {/* Inner cutout of A */}
          <path
            d="M 270 120 L 320 220 L 225 220 Z"
            fill="none"
          />

          {/* Lower Swoop of A connecting continuously into G */}
          <path
            d="M 210 280 Q 300 370 420 370 C 470 370 510 355 540 330 L 515 285 C 490 305 460 315 425 315 C 340 315 280 250 210 280 Z"
            fill="url(#agb3dMain)"
          />

          {/* ========================================================= */}
          {/* 2. LETTER 'G' (Spiral circle + tech center circuit node) */}
          {/* ========================================================= */}
          {/* Outer G arc */}
          <path
            d="M 370 170 C 370 95 440 30 550 30 C 670 30 735 100 735 170 L 665 170 C 665 125 615 85 550 85 C 475 85 430 130 430 195 C 430 260 480 305 550 305 C 610 305 655 270 665 220 L 550 220 L 550 170 L 735 170 C 735 240 680 360 550 360 C 420 360 370 270 370 170 Z"
            fill="url(#agb3dMain)"
          />

          {/* Highlight ridge on G */}
          <path
            d="M 385 170 C 385 105 450 45 550 45 C 655 45 715 105 720 165 L 685 165 C 680 125 635 75 550 75 C 465 75 415 125 415 195 C 415 260 465 315 550 315 C 615 315 660 275 675 220 L 565 220 L 565 185 L 720 185 C 720 235 670 345 550 345 C 435 345 385 260 385 170 Z"
            fill="url(#agb3dHighlight)"
          />

          {/* Center Circuit Terminal / Node of G */}
          <circle cx="530" cy="195" r="28" fill="#0284C7" stroke="#BAE6FD" strokeWidth="6" />
          <circle cx="530" cy="195" r="12" fill="#FFFFFF" />

          {/* ========================================================= */}
          {/* 3. LETTER 'B' & HORIZONTAL CIRCUIT TRACES                   */}
          {/* ========================================================= */}
          {/* Top Upper Loop of B */}
          <path
            d="M 610 40 L 760 40 C 840 40 890 80 890 135 C 890 175 860 195 820 205 C 870 215 905 245 905 295 C 905 355 845 370 760 370 L 610 370 L 645 315 L 755 315 C 810 315 840 300 840 270 C 840 240 810 225 750 225 L 670 225 L 670 175 L 745 175 C 800 175 825 160 825 130 C 825 100 800 90 745 90 L 635 90 Z"
            fill="url(#agb3dMain)"
          />

          {/* 3D Highlight layer on B */}
          <path
            d="M 625 55 L 755 55 C 825 55 870 90 870 135 C 870 170 840 190 800 200 C 850 210 885 240 885 290 C 885 345 830 355 755 355 L 635 355 L 660 325 L 755 325 C 805 325 830 310 830 275 C 830 240 795 230 740 230 L 655 230 L 655 170 L 740 170 C 790 170 815 155 815 130 C 815 105 790 95 740 95 L 645 95 Z"
            fill="url(#agb3dHighlight)"
          />

          {/* Top Circuit Bus trace into B */}
          <path
            d="M 670 120 L 780 120"
            stroke="url(#agbCircuit)"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <circle cx="780" cy="120" r="16" fill="#0284C7" stroke="#BAE6FD" strokeWidth="5" />
          <circle cx="780" cy="120" r="6" fill="#FFFFFF" />

          {/* Bottom Circuit Bus trace into B */}
          <path
            d="M 670 260 L 780 260"
            stroke="url(#agbCircuit)"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <circle cx="780" cy="260" r="16" fill="#0284C7" stroke="#BAE6FD" strokeWidth="5" />
          <circle cx="780" cy="260" r="6" fill="#FFFFFF" />
        </g>
      </svg>

      {/* Official Signature Typography Block (AGB_LOGO_1_MODIFIE) */}
      {showDetails && (
        <div className="text-center mt-3 font-sans space-y-0.5 max-w-xl">
          <h2
            className={`text-xs sm:text-sm md:text-base font-black tracking-tight uppercase leading-tight ${textColorHeader}`}
          >
            CONCEPTEUR D'APPLICATIONS MOBILES
          </h2>
          <h3
            className={`text-xs sm:text-sm md:text-base font-black tracking-tight uppercase leading-tight ${textColorHeader}`}
          >
            ET SOLUTIONS WEB SUR MESURE
          </h3>
          <div className="pt-1 flex flex-col items-center justify-center text-[11px] sm:text-xs md:text-sm font-semibold">
            <a
              href="mailto:atsegillesbrice@gmail.com"
              className={`hover:underline transition-colors ${textColorEmail}`}
            >
              atsegillesbrice@gmail.com
            </a>
            <div className={`font-mono font-bold tracking-wider mt-0.5 ${textColorPhone}`}>
              0104818092 / 0797709693
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
