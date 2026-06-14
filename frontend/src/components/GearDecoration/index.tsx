import React from 'react';

interface GearDecorationProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  reverse?: boolean;
  teeth?: number;
}

export const GearDecoration: React.FC<GearDecorationProps> = ({
  size = 80,
  className = '',
  style = {},
  reverse = false,
  teeth = 12,
}) => {
  const innerRadius = size * 0.35;
  const outerRadius = size * 0.45;
  const toothHeight = size * 0.08;
  const centerRadius = size * 0.12;
  const holeRadius = size * 0.06;
  const holeDistance = size * 0.25;

  const teethPoints: string[] = [];
  for (let i = 0; i < teeth; i++) {
    const angle = (i * 360) / teeth - 90;
    const nextAngle = ((i + 0.5) * 360) / teeth - 90;
    const toothAngle = ((i + 0.25) * 360) / teeth - 90;
    const toothEndAngle = ((i + 0.75) * 360) / teeth - 90;

    const x1 = Math.cos((angle * Math.PI) / 180) * outerRadius + size / 2;
    const y1 = Math.sin((angle * Math.PI) / 180) * outerRadius + size / 2;

    const x2 = Math.cos((toothAngle * Math.PI) / 180) * (outerRadius + toothHeight) + size / 2;
    const y2 = Math.sin((toothAngle * Math.PI) / 180) * (outerRadius + toothHeight) + size / 2;

    const x3 = Math.cos((toothEndAngle * Math.PI) / 180) * (outerRadius + toothHeight) + size / 2;
    const y3 = Math.sin((toothEndAngle * Math.PI) / 180) * (outerRadius + toothHeight) + size / 2;

    const x4 = Math.cos((nextAngle * Math.PI) / 180) * outerRadius + size / 2;
    const y4 = Math.sin((nextAngle * Math.PI) / 180) * outerRadius + size / 2;

    teethPoints.push(`${x1},${y1} ${x2},${y2} ${x3},${y3} ${x4},${y4}`);
  }

  const holes = [];
  for (let i = 0; i < 6; i++) {
    const angle = (i * 60 - 90) * (Math.PI / 180);
    holes.push({
      cx: Math.cos(angle) * holeDistance + size / 2,
      cy: Math.sin(angle) * holeDistance + size / 2,
    });
  }

  return (
    <svg
      width={size}
      height={size}
      className={`gear-decoration ${reverse ? 'reverse' : ''} ${className}`}
      style={style}
      viewBox={`0 0 ${size} ${size}`}
    >
      <defs>
        <linearGradient id={`gearGrad-${size}-${teeth}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D4AF37" />
          <stop offset="50%" stopColor="#B8860B" />
          <stop offset="100%" stopColor="#8B6914" />
        </linearGradient>
        <radialGradient id={`gearCenter-${size}-${teeth}`} cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#8B6914" />
        </radialGradient>
      </defs>
      <polygon
        points={teethPoints.join(' ')}
        fill={`url(#gearGrad-${size}-${teeth})`}
        stroke="#8B6914"
        strokeWidth="2"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={innerRadius}
        fill="none"
        stroke="#8B6914"
        strokeWidth="3"
      />
      {holes.map((hole, i) => (
        <circle
          key={i}
          cx={hole.cx}
          cy={hole.cy}
          r={holeRadius}
          fill="#2C2C2C"
          stroke="#8B6914"
          strokeWidth="2"
        />
      ))}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={centerRadius}
        fill={`url(#gearCenter-${size}-${teeth})`}
        stroke="#8B6914"
        strokeWidth="2"
      />
    </svg>
  );
};
