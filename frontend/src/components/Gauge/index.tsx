import React from 'react';

interface GaugeProps {
  value: number;
  max: number;
  label: string;
  size?: number;
  color?: string;
}

export const Gauge: React.FC<GaugeProps> = ({
  value,
  max,
  label,
  size = 150,
  color = '#CD5C5C',
}) => {
  const percentage = Math.min(value / max, 1);
  const angle = -120 + percentage * 240;
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.4;

  const tickMarks = [];
  for (let i = 0; i <= 10; i++) {
    const tickAngle = -120 + i * 24;
    const rad = (tickAngle * Math.PI) / 180;
    const isMajor = i % 2 === 0;
    const innerR = radius - (isMajor ? 8 : 12);
    tickMarks.push({
      x1: centerX + Math.cos(rad) * innerR,
      y1: centerY + Math.sin(rad) * innerR,
      x2: centerX + Math.cos(rad) * radius,
      y2: centerY + Math.sin(rad) * radius,
      major: isMajor,
    });
  }

  const needleLength = radius - 15;
  const needleRad = (angle * Math.PI) / 180;
  const needleX = centerX + Math.cos(needleRad) * needleLength;
  const needleY = centerY + Math.sin(needleRad) * needleLength;

  return (
    <div className="gauge-container" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <radialGradient id="gaugeFaceGrad" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#3D3D3D" />
            <stop offset="100%" stopColor="#1A1A1A" />
          </radialGradient>
          <linearGradient id="gaugeBrassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D4AF37" />
            <stop offset="50%" stopColor="#B8860B" />
            <stop offset="100%" stopColor="#8B6914" />
          </linearGradient>
        </defs>

        <circle
          cx={centerX}
          cy={centerY}
          r={radius + 12}
          fill="url(#gaugeFaceGrad)"
          stroke="url(#gaugeBrassGrad)"
          strokeWidth="4"
        />
        <circle
          cx={centerX}
          cy={centerY}
          r={radius + 6}
          fill="none"
          stroke="#8B4513"
          strokeWidth="1"
        />

        {tickMarks.map((tick, i) => (
          <line
            key={i}
            x1={tick.x1}
            y1={tick.y1}
            x2={tick.x2}
            y2={tick.y2}
            stroke={tick.major ? '#D4AF37' : '#B8860B'}
            strokeWidth={tick.major ? 2 : 1}
          />
        ))}

        <text
          x={centerX}
          y={centerY + radius - 25}
          textAnchor="middle"
          fill="#8B8B8B"
          fontSize="10"
          fontFamily="Georgia, serif"
        >
          {label}
        </text>

        <text
          x={centerX}
          y={centerY + 10}
          textAnchor="middle"
          fill="#D4AF37"
          fontSize="18"
          fontFamily="Georgia, serif"
          fontWeight="bold"
        >
          {value}
        </text>

        <line
          x1={centerX}
          y1={centerY}
          x2={needleX}
          y2={needleY}
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx={centerX} cy={centerY} r="8" fill="url(#gaugeBrassGrad)" stroke="#8B6914" strokeWidth="2" />
        <circle cx={centerX - 2} cy={centerY - 2} r="3" fill="#D4AF37" opacity="0.6" />
      </svg>
    </div>
  );
};
