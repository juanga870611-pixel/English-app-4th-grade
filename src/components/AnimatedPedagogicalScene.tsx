import React from 'react';
import type { SceneTheme } from '../utils/pedagogicalFeedback';

interface AnimatedPedagogicalSceneProps {
  theme: SceneTheme;
  activeStep: 1 | 2 | 3;
}

const SCENE_CAPTIONS: Record<SceneTheme, { titleEn: string; captionEs: string }> = {
  hygiene: {
    titleEn: 'Clean Hands & Soap',
    captionEs: 'Escena animada: agua limpia, jabón y burbujas',
  },
  health_ailments: {
    titleEn: 'Health & Care',
    captionEs: 'Escena animada: termómetro, descanso y cuidado médico',
  },
  healthy_food: {
    titleEn: 'Healthy Lunchbox',
    captionEs: 'Escena animada: frutas frescas frente a bebidas azucaradas',
  },
  sports_routine: {
    titleEn: 'Active & Calm Routine',
    captionEs: 'Escena animada: deporte, energía y respiración',
  },
  family_traits: {
    titleEn: 'Family & Traits',
    captionEs: 'Escena animada: familia unida y cualidades físicas',
  },
  emotions_peace: {
    titleEn: 'Emotions & Peace',
    captionEs: 'Escena animada: empatía, calma y palabras amables',
  },
  colombian_fauna: {
    titleEn: 'Colombian Wildlife',
    captionEs: 'Escena animada: cóndor andino y selva colombiana',
  },
  eco_habitats: {
    titleEn: 'Save Our Planet',
    captionEs: 'Escena animada: reciclaje, agua y bosques vivos',
  },
  prepositions: {
    titleEn: 'Where Is It? (In · On · Under)',
    captionEs: 'Escena animada: posición espacial de la pelota',
  },
  time_clock: {
    titleEn: "What Time Is It? (O'clock)",
    captionEs: 'Escena animada: manecillas del reloj escolar',
  },
  city_transport: {
    titleEn: 'City & Transport',
    captionEs: 'Escena animada: ruta segura por la ciudad',
  },
  global_digital: {
    titleEn: 'Global Village & Safety',
    captionEs: 'Escena animada: mundo conectado con seguridad digital',
  },
};

export const AnimatedPedagogicalScene: React.FC<AnimatedPedagogicalSceneProps> = ({
  theme,
  activeStep,
}) => {
  const meta = SCENE_CAPTIONS[theme];
  const energized = activeStep >= 2;

  return (
    <div
      data-testid={`pedagogical-scene-${theme}`}
      className="flex flex-col items-center justify-center rounded-xl border border-sky-200 bg-gradient-to-b from-sky-50 via-white to-emerald-50/70 p-3 text-center"
    >
      <svg
        viewBox="0 0 180 112"
        className="h-28 w-44 overflow-visible"
        role="img"
        aria-label={`${meta.titleEn}: ${meta.captionEs}`}
      >
        {theme === 'prepositions' && (
          <g>
            {/* Floor line */}
            <line x1="16" y1="96" x2="164" y2="96" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
            {/* Box */}
            <rect x="64" y="48" width="52" height="44" rx="6" fill="#FDE68A" stroke="#D97706" strokeWidth="2.5" />
            <line x1="64" y1="62" x2="116" y2="62" stroke="#D97706" strokeWidth="2" />
            {/* Labels */}
            <text x="30" y="34" fontSize="9" fontWeight="700" fill="#0369A1">ON</text>
            <text x="128" y="34" fontSize="9" fontWeight="700" fill="#059669">IN</text>
            <text x="76" y="108" fontSize="9" fontWeight="700" fill="#B45309">UNDER</text>
            {/* Animated hopping ball */}
            <g className={energized ? 'animate-scene-hop' : 'animate-scene-float'}>
              <circle cx="52" cy="40" r="11" fill="#0EA5E9" stroke="#0369A1" strokeWidth="2" />
              <path d="M45 36 Q52 40 59 36" stroke="#E0F2FE" strokeWidth="1.8" fill="none" />
            </g>
          </g>
        )}

        {theme === 'time_clock' && (
          <g>
            {/* Clock outer */}
            <circle cx="60" cy="55" r="38" fill="#FFFFFF" stroke="#0284C7" strokeWidth="4" />
            <circle cx="60" cy="55" r="32" fill="#F0F9FF" />
            {/* Hour ticks */}
            <text x="55" y="31" fontSize="9" fontWeight="800" fill="#0F172A">12</text>
            <text x="85" y="58" fontSize="9" fontWeight="800" fill="#0F172A">3</text>
            <text x="58" y="84" fontSize="9" fontWeight="800" fill="#0F172A">6</text>
            <text x="31" y="58" fontSize="9" fontWeight="800" fill="#0F172A">9</text>
            {/* Hour hand pointing to 9 */}
            <line x1="60" y1="55" x2="40" y2="55" stroke="#0F172A" strokeWidth="3.5" strokeLinecap="round" />
            {/* Minute hand spinning */}
            <g className="animate-clock-minute">
              <line x1="60" y1="55" x2="60" y2="27" stroke="#E11D48" strokeWidth="2.5" strokeLinecap="round" />
            </g>
            <circle cx="60" cy="55" r="3.5" fill="#0284C7" />
            {/* Digital badge */}
            <rect x="110" y="38" width="58" height="32" rx="8" fill="#0F172A" />
            <text x="139" y="58" textAnchor="middle" fontSize="12" fontWeight="800" fill="#38BDF8">
              9:00
            </text>
            <text x="139" y="84" textAnchor="middle" fontSize="9" fontWeight="700" fill="#0369A1">
              O&apos;CLOCK
            </text>
          </g>
        )}

        {theme === 'hygiene' && (
          <g>
            {/* Faucet */}
            <path d="M35 28 H76 C84 28 88 32 88 40 V46" stroke="#64748B" strokeWidth="8" strokeLinecap="round" fill="none" />
            <rect x="28" y="20" width="16" height="16" rx="3" fill="#475569" />
            {/* Water drops */}
            <g className="animate-scene-float">
              <path d="M88 52 C83 60 83 66 88 68 C93 66 93 60 88 52 Z" fill="#38BDF8" />
              <circle cx="72" cy="70" r="6" fill="#BAE6FD" opacity="0.85" />
              <circle cx="106" cy="64" r="5" fill="#E0F2FE" stroke="#7DD3FC" strokeWidth="1.5" />
              <circle cx="122" cy="48" r="7" fill="#E0F2FE" stroke="#7DD3FC" strokeWidth="1.5" />
            </g>
            {/* Soap bar */}
            <rect x="58" y="78" width="60" height="22" rx="10" fill="#F472B6" stroke="#DB2777" strokeWidth="2" />
            <text x="88" y="93" textAnchor="middle" fontSize="9" fontWeight="800" fill="#FFFFFF">SOAP</text>
          </g>
        )}

        {theme === 'health_ailments' && (
          <g>
            {/* Medical bag */}
            <rect x="40" y="38" width="70" height="52" rx="10" fill="#FFFFFF" stroke="#E11D48" strokeWidth="3" />
            <path d="M62 38 V30 H88 V38" stroke="#E11D48" strokeWidth="3" fill="none" />
            <rect x="70" y="50" width="10" height="28" rx="2" fill="#E11D48" />
            <rect x="61" y="59" width="28" height="10" rx="2" fill="#E11D48" />
            {/* Floating thermometer / heart */}
            <g className="animate-scene-float">
              <rect x="128" y="26" width="14" height="52" rx="7" fill="#FEF2F2" stroke="#DC2626" strokeWidth="2.5" />
              <circle cx="135" cy="72" r="9" fill="#EF4444" />
              <rect x="132" y="42" width="6" height="28" rx="3" fill="#EF4444" />
            </g>
          </g>
        )}

        {theme === 'healthy_food' && (
          <g>
            {/* Green tray / plate */}
            <ellipse cx="90" cy="82" rx="68" ry="18" fill="#DCFCE7" stroke="#16A34A" strokeWidth="2.5" />
            {/* Mango / Apple */}
            <g className="animate-scene-float">
              <circle cx="62" cy="54" r="18" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
              <path d="M62 36 Q70 26 76 32 Q68 38 62 36 Z" fill="#16A34A" />
              {/* Carrot */}
              <polygon points="104,40 132,56 106,68" fill="#FB923C" stroke="#C2410C" strokeWidth="2" />
              <path d="M100 44 L92 34 M102 48 L90 48" stroke="#15803D" strokeWidth="2.5" strokeLinecap="round" />
            </g>
            <text x="90" y="106" textAnchor="middle" fontSize="9" fontWeight="800" fill="#166534">
              HEALTHY CHOICE
            </text>
          </g>
        )}

        {theme === 'sports_routine' && (
          <g>
            {/* Pitch grass */}
            <rect x="18" y="84" width="144" height="14" rx="7" fill="#BBF7D0" />
            {/* Goal arch */}
            <path d="M110 84 V40 H154 V84" stroke="#64748B" strokeWidth="3" fill="none" />
            {/* Bouncing soccer ball */}
            <g className={energized ? 'animate-scene-hop' : 'animate-scene-float'}>
              <circle cx="52" cy="56" r="16" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2.5" />
              <polygon points="52,47 59,52 56,61 48,61 45,52" fill="#0F172A" />
            </g>
            <text x="88" y="28" textAnchor="middle" fontSize="9" fontWeight="800" fill="#047857">
              LET&apos;S PLAY!
            </text>
          </g>
        )}

        {theme === 'family_traits' && (
          <g>
            {/* House frame */}
            <polygon points="90,14 26,52 154,52" fill="#FDE68A" stroke="#D97706" strokeWidth="2.5" />
            <rect x="38" y="52" width="104" height="46" rx="4" fill="#FFFBEB" stroke="#D97706" strokeWidth="2" />
            {/* Two smiling family silhouettes */}
            <g className="animate-scene-float">
              <circle cx="72" cy="68" r="10" fill="#38BDF8" />
              <path d="M58 96 C58 84 86 84 86 96" fill="#0284C7" />
              <circle cx="110" cy="72" r="8" fill="#FB7185" />
              <path d="M98 96 C98 86 122 86 122 96" fill="#E11D48" />
            </g>
          </g>
        )}

        {theme === 'emotions_peace' && (
          <g>
            {/* Heart & Dove / Peace circle */}
            <g className="animate-scene-float">
              <circle cx="62" cy="56" r="24" fill="#FEF3C7" stroke="#D97706" strokeWidth="2.5" />
              <circle cx="54" cy="51" r="2.8" fill="#1E293B" />
              <circle cx="70" cy="51" r="2.8" fill="#1E293B" />
              <path d="M52 62 Q62 71 72 62" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              {/* Speech heart */}
              <path
                d="M124 44 C124 36 112 36 112 46 C112 56 128 66 128 66 C128 66 144 56 144 46 C144 36 132 36 132 44 Z"
                fill="#FB7185"
                stroke="#E11D48"
                strokeWidth="2"
              />
            </g>
            <text x="90" y="98" textAnchor="middle" fontSize="9" fontWeight="800" fill="#B45309">
              RESPECT &amp; KINDNESS
            </text>
          </g>
        )}

        {theme === 'colombian_fauna' && (
          <g>
            {/* Andean mountains */}
            <polygon points="14,92 56,36 98,92" fill="#86EFAC" />
            <polygon points="68,92 116,28 166,92" fill="#4ADE80" />
            {/* Soaring condor / bird */}
            <g className={energized ? 'animate-scene-hop' : 'animate-scene-float'}>
              <path d="M54 34 Q70 20 86 34 Q102 20 118 34" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" fill="none" />
              <circle cx="86" cy="37" r="4" fill="#FDE047" />
            </g>
            <text x="90" y="106" textAnchor="middle" fontSize="9" fontWeight="800" fill="#166534">
              FAUNA COLOMBIANA
            </text>
          </g>
        )}

        {theme === 'eco_habitats' && (
          <g>
            {/* Tree & Recycling bin */}
            <rect x="46" y="64" width="12" height="28" rx="3" fill="#92400E" />
            <circle cx="52" cy="48" r="22" fill="#22C55E" />
            <g className="animate-scene-float">
              <rect x="96" y="46" width="44" height="46" rx="6" fill="#10B981" stroke="#047857" strokeWidth="2.5" />
              <text x="118" y="74" textAnchor="middle" fontSize="18" fill="#FFFFFF">♻️</text>
            </g>
            <text x="90" y="106" textAnchor="middle" fontSize="9" fontWeight="800" fill="#065F46">
              SAVE WATER · RECYCLE
            </text>
          </g>
        )}

        {theme === 'city_transport' && (
          <g>
            {/* Road */}
            <rect x="12" y="78" width="156" height="18" rx="4" fill="#334155" />
            <line x1="24" y1="87" x2="156" y2="87" stroke="#FACC15" strokeWidth="2.5" strokeDasharray="10 8" />
            {/* Moving school bus */}
            <g className="animate-scene-drive">
              <rect x="52" y="42" width="76" height="36" rx="8" fill="#FACC15" stroke="#CA8A04" strokeWidth="2.5" />
              <rect x="62" y="50" width="16" height="12" rx="2" fill="#E0F2FE" />
              <rect x="84" y="50" width="16" height="12" rx="2" fill="#E0F2FE" />
              <rect x="106" y="50" width="14" height="12" rx="2" fill="#E0F2FE" />
              <circle cx="68" cy="79" r="7" fill="#0F172A" />
              <circle cx="112" cy="79" r="7" fill="#0F172A" />
            </g>
          </g>
        )}

        {theme === 'global_digital' && (
          <g>
            {/* Globe & Shield */}
            <g className="animate-scene-float">
              <circle cx="72" cy="54" r="28" fill="#38BDF8" stroke="#0284C7" strokeWidth="2.5" />
              <path d="M54 44 Q70 36 86 48 Q78 66 58 64 Z" fill="#4ADE80" />
              <path d="M114 36 L140 44 V60 C140 74 127 84 114 88 C101 84 88 74 88 60 V44 Z" fill="#FEF08A" stroke="#CA8A04" strokeWidth="2.5" />
              <text x="114" y="67" textAnchor="middle" fontSize="14">🔒</text>
            </g>
            <text x="90" y="106" textAnchor="middle" fontSize="9" fontWeight="800" fill="#0369A1">
              GLOBAL VILLAGE
            </text>
          </g>
        )}
      </svg>

      <p className="mt-1 text-[11px] font-bold text-slate-700">{meta.titleEn}</p>
      <p className="text-[10px] font-medium text-slate-500">{meta.captionEs}</p>
    </div>
  );
};
