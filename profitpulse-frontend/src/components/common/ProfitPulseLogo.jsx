// Shared ProfitPulse Logo Component — used in Sidebar and LoginPage
// Icon: bar chart with upward trending arrow (matches brand image)

export default function ProfitPulseLogo({ size = 36, showText = true, collapsed = false, dark = false }) {
    const textColor = dark ? '#FFFFFF' : 'var(--color-text-on-dark, #FFFFFF)';

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* SVG Icon */}
            <svg
                width={size}
                height={size}
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ flexShrink: 0 }}
            >
                {/* Dark background circle */}
                <rect width="40" height="40" rx="8" fill="#0F1E3C" />

                {/* Bar 1 (short) */}
                <rect x="6" y="26" width="5" height="8" rx="1.5" fill="#2EA87E" opacity="0.85" />
                {/* Bar 2 (medium) */}
                <rect x="13" y="20" width="5" height="14" rx="1.5" fill="#2EA87E" />
                {/* Bar 3 (tall) */}
                <rect x="20" y="14" width="5" height="20" rx="1.5" fill="#3DB891" />

                {/* Trending arrow line */}
                <polyline
                    points="7,24 14,18 21,12 28,7"
                    stroke="#4ECFA0"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                />
                {/* Arrow head */}
                <polyline
                    points="24,6 28,7 27,11"
                    stroke="#4ECFA0"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                />
            </svg>

            {/* Text */}
            {showText && !collapsed && (
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                    <span style={{ fontSize: 17, fontWeight: 700, color: textColor, letterSpacing: '-0.01em' }}>
                        ProfitPulse
                    </span>
                    <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.45)', fontWeight: 400, marginTop: 1 }}>
                        Profitability Intelligence
                    </span>
                </div>
            )}
        </div>
    );
}
