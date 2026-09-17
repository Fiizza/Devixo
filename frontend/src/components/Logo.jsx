import { motion } from "framer-motion";

// Neural-node network mark for Devixo, in black/gray to match the title text.
// Static (no pulsing) with only a subtle 3D tilt on hover.
//
// Colors here are hardcoded light-mode values via inline SVG fill/stroke
// (not Tailwind classes), so the app-wide dark mode CSS (which only
// targets Tailwind classes) can't reach them. The <style> tag below
// inverts/brightens the mark in dark mode via a plain CSS filter — kept
// inline in this same file (not in index.css) so this component is fully
// self-contained: there's nothing else to deploy alongside it.

export default function Logo({ size = 40, withText = true, textClassName = "" }) {
  const nodes = [
    { cx: 50, cy: 26, r: 7, color: "#111827" }, // gray-900, matches "Dev"
    { cx: 76, cy: 68, r: 7, color: "#6B7280" }, // gray-500
    { cx: 24, cy: 68, r: 7, color: "#9CA3AF" }, // gray-400, matches "ixo"
  ];

  return (
    <div className="flex shrink-0 items-center gap-1">
      <style>{`html.dark .devixo-logo-mark { filter: invert(1) brightness(1.8); }`}</style>
      <motion.div
        className="relative flex shrink-0 items-center justify-center"
        style={{ width: size, height: size, perspective: 400 }}
        whileHover={{ rotateY: 18, rotateX: -8, scale: 1.12 }}
      >
        <svg
          className="devixo-logo-mark"
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ overflow: "visible" }}
        >
          {/* connections */}
          {nodes.map((n, i) => (
            <line
              key={i}
              x1="50"
              y1="50"
              x2={n.cx}
              y2={n.cy}
              stroke="#374151"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.6"
              style={{ filter: "drop-shadow(0 0 2px #374151)" }}
            />
          ))}

          {/* hub */}
          <circle
            cx="50"
            cy="50"
            r="10"
            fill="#111827"
            style={{
              filter: "drop-shadow(0 0 4px #111827)",
            }}
          />

          {/* satellite nodes */}
          {nodes.map((n, i) => (
            <circle
              key={i}
              cx={n.cx}
              cy={n.cy}
              r={n.r}
              fill={n.color}
              style={{
                filter: `drop-shadow(0 0 3px ${n.color}66)`,
              }}
            />
          ))}
        </svg>
      </motion.div>

      {withText && (
        <span
          className={`whitespace-nowrap font-semibold tracking-tight text-gray-900 ${textClassName}`}
        >
          Dev<span className="font-normal text-gray-400">ixo</span>
        </span>
      )}
    </div>
  );
}