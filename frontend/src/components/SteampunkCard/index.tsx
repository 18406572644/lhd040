import React from 'react';

interface SteampunkCardProps {
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  extra?: React.ReactNode;
  showRivets?: boolean;
}

export const SteampunkCard: React.FC<SteampunkCardProps> = ({
  title,
  children,
  className = '',
  style = {},
  extra,
  showRivets = true,
}) => {
  return (
    <div className={`steampunk-card ${className}`} style={style}>
      {showRivets && (
        <>
          <div className="rivet rivet-tl"></div>
          <div className="rivet rivet-tr"></div>
          <div className="rivet rivet-bl"></div>
          <div className="rivet rivet-br"></div>
        </>
      )}
      {(title || extra) && (
        <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(180deg, rgba(139, 69, 19, 0.2) 0%, transparent 100%)',
        }}
      >
        {title && (
          <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--color-brass-light)' }}>
            {title}
          </h3>
        )}
        {extra}
      </div>
      )}
      <div style={{ padding: '20px' }}>{children}</div>
    </div>
  );
};
