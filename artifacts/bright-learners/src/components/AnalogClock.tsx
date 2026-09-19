interface AnalogClockProps {
  /** Hour hand position, 1-12 (12 for twelve o'clock) */
  hour: number;
  /** Minutes, 0-59 */
  minute: number;
  /** Pixel size of the clock (width & height). Defaults to 240. */
  size?: number;
  className?: string;
}

const CENTER = 120;
const FACE_RADIUS = 110;
const NUMBER_RADIUS = 88;

function polarToCartesian(angleDeg: number, radius: number) {
  // 0 degrees = 12 o'clock position, clockwise
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: CENTER + radius * Math.cos(angleRad),
    y: CENTER + radius * Math.sin(angleRad),
  };
}

/**
 * Renders an analog clock face with numbers 1-12 and hour/minute hands
 * positioned to show the given time. Used for math "Time" lesson questions
 * so learners practice reading a real clock face rather than digital text.
 */
export function AnalogClock({ hour, minute, size = 240, className }: AnalogClockProps) {
  const normalizedHour = hour % 12;
  const minuteAngle = minute * 6; // 360 / 60
  const hourAngle = normalizedHour * 30 + minute * 0.5; // 360 / 12, plus drift from minutes

  const minuteHandEnd = polarToCartesian(minuteAngle, FACE_RADIUS * 0.78);
  const hourHandEnd = polarToCartesian(hourAngle, FACE_RADIUS * 0.52);

  const numbers = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <svg
      viewBox="0 0 240 240"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={`Analog clock showing ${hour}:${minute.toString().padStart(2, '0')}`}
    >
      {/* Face */}
      <circle cx={CENTER} cy={CENTER} r={FACE_RADIUS} fill="white" stroke="#4b3f72" strokeWidth={6} />

      {/* Minute tick marks */}
      {Array.from({ length: 60 }, (_, i) => {
        const isHourMark = i % 5 === 0;
        const outer = polarToCartesian(i * 6, FACE_RADIUS - 4);
        const inner = polarToCartesian(i * 6, FACE_RADIUS - (isHourMark ? 16 : 9));
        return (
          <line
            key={`tick-${i}`}
            x1={outer.x}
            y1={outer.y}
            x2={inner.x}
            y2={inner.y}
            stroke="#4b3f72"
            strokeWidth={isHourMark ? 3 : 1.5}
            strokeLinecap="round"
          />
        );
      })}

      {/* Numbers 1-12 */}
      {numbers.map((n) => {
        const pos = polarToCartesian(n * 30, NUMBER_RADIUS);
        return (
          <text
            key={`num-${n}`}
            x={pos.x}
            y={pos.y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={24}
            fontWeight={800}
            fill="#4b3f72"
            fontFamily="system-ui, sans-serif"
          >
            {n}
          </text>
        );
      })}

      {/* Hour hand */}
      <line
        x1={CENTER}
        y1={CENTER}
        x2={hourHandEnd.x}
        y2={hourHandEnd.y}
        stroke="#4b3f72"
        strokeWidth={8}
        strokeLinecap="round"
      />

      {/* Minute hand */}
      <line
        x1={CENTER}
        y1={CENTER}
        x2={minuteHandEnd.x}
        y2={minuteHandEnd.y}
        stroke="#7c3aed"
        strokeWidth={5}
        strokeLinecap="round"
      />

      {/* Center pin */}
      <circle cx={CENTER} cy={CENTER} r={7} fill="#ef4444" />
    </svg>
  );
}
