import React from 'react';

interface CelebrationBurstProps {
  active: boolean;
  variant?: 'stars' | 'confetti';
}

interface ParticleSpec {
  id: number;
  tx: string;
  ty: string;
  rot: string;
  color: string;
  shape: 'star' | 'ribbon';
  delayMs: number;
}

const PARTICLES: ParticleSpec[] = [
  { id: 1, tx: '-76px', ty: '-54px', rot: '-140deg', color: '#F59E0B', shape: 'star', delayMs: 0 },
  { id: 2, tx: '-42px', ty: '-78px', rot: '110deg', color: '#10B981', shape: 'ribbon', delayMs: 30 },
  { id: 3, tx: '0px', ty: '-86px', rot: '180deg', color: '#0EA5E9', shape: 'star', delayMs: 20 },
  { id: 4, tx: '48px', ty: '-74px', rot: '-120deg', color: '#F43F5E', shape: 'ribbon', delayMs: 40 },
  { id: 5, tx: '78px', ty: '-50px', rot: '160deg', color: '#FBBF24', shape: 'star', delayMs: 15 },
  { id: 6, tx: '-64px', ty: '-18px', rot: '95deg', color: '#38BDF8', shape: 'ribbon', delayMs: 50 },
  { id: 7, tx: '68px', ty: '-14px', rot: '-95deg', color: '#34D399', shape: 'ribbon', delayMs: 45 },
  { id: 8, tx: '-24px', ty: '-62px', rot: '200deg', color: '#A855F7', shape: 'star', delayMs: 60 },
  { id: 9, tx: '26px', ty: '-64px', rot: '-190deg', color: '#F59E0B', shape: 'star', delayMs: 35 },
];

export const CelebrationBurst: React.FC<CelebrationBurstProps> = ({
  active,
  variant = 'stars',
}) => {
  if (!active) return null;

  return (
    <div
      data-testid="celebration-burst"
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-6 z-20 flex justify-center overflow-visible"
    >
      <div className="relative h-4 w-4">
        {PARTICLES.map((p) => (
          <span
            key={p.id}
            style={
              {
                '--tx': p.tx,
                '--ty': p.ty,
                '--rot': p.rot,
                animationDelay: `${p.delayMs}ms`,
              } as React.CSSProperties
            }
            className="animate-particle-burst absolute left-0 top-0 block"
          >
            {p.shape === 'star' || variant === 'stars' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill={p.color}>
                <path d="M12 2L14.9 8.6L22 9.3L16.6 14L18.2 21L12 17.3L5.8 21L7.4 14L2 9.3L9.1 8.6L12 2Z" />
              </svg>
            ) : (
              <span
                className="block h-2.5 w-4 rounded-sm"
                style={{ backgroundColor: p.color }}
              />
            )}
          </span>
        ))}
      </div>
    </div>
  );
};
