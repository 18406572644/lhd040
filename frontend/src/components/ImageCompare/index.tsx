import React, { useState, useRef } from 'react';

interface ImageCompareProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  height?: number;
}

export const ImageCompare: React.FC<ImageCompareProps> = ({
  beforeImage,
  afterImage,
  beforeLabel = '维修前',
  afterLabel = '维修后',
  height = 300,
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, percentage)));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, percentage)));
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleTouchMove}
      style={{
        position: 'relative',
        width: '100%',
        height: height,
        overflow: 'hidden',
        borderRadius: '8px',
        border: '2px solid var(--color-border)',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
      }}
    >
      <img
        src={afterImage}
        alt={afterLabel}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
        draggable={false}
      />

      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: `${sliderPosition}%`,
          height: '100%',
          overflow: 'hidden',
        }}
      >
        <img
          src={beforeImage}
          alt={beforeLabel}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: `${100 * (100 / sliderPosition)}%`,
            height: '100%',
            objectFit: 'cover',
            maxWidth: 'none',
          }}
          draggable={false}
        />
      </div>

      <div
        onMouseDown={handleMouseDown}
        onTouchStart={() => setIsDragging(true)}
        style={{
          position: 'absolute',
          top: 0,
          left: `${sliderPosition}%`,
          width: '4px',
          height: '100%',
          background: 'linear-gradient(180deg, var(--color-brass-light), var(--color-brass-dark))',
          transform: 'translateX(-50%)',
          cursor: 'ew-resize',
          boxShadow: '0 0 10px rgba(212, 175, 55, 0.5)',
          zIndex: 10,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--color-brass-light), var(--color-brass-dark))',
            border: '2px solid var(--color-brass-gold)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            color: 'var(--color-gray-dark)',
          }}
        >
          ⇔
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          padding: '4px 12px',
          background: 'rgba(0, 0, 0, 0.7)',
          color: 'var(--color-brass-light)',
          borderRadius: '4px',
          fontSize: '12px',
          fontFamily: 'Georgia, serif',
          border: '1px solid var(--color-brass-dark)',
        }}
      >
        {beforeLabel}
      </div>
      <div
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          padding: '4px 12px',
          background: 'rgba(0, 0, 0, 0.7)',
          color: 'var(--color-brass-light)',
          borderRadius: '4px',
          fontSize: '12px',
          fontFamily: 'Georgia, serif',
          border: '1px solid var(--color-brass-dark)',
        }}
      >
        {afterLabel}
      </div>
    </div>
  );
};
