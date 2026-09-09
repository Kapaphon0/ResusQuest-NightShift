import React from 'react';
import { AvatarAppearance, ClinicalTier } from '../../types/avatar';
import { getClinicalTier } from '../../store/useAvatarStore';

interface AvatarRendererProps {
  appearance: AvatarAppearance;
  level?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showBadge?: boolean;
  showAura?: boolean;
  emotion?: 'idle' | 'confident' | 'resuscitating' | 'celebrating';
  className?: string;
}

export const AvatarRenderer: React.FC<AvatarRendererProps> = ({
  appearance,
  level = 10,
  size = 'md',
  showBadge = true,
  showAura = true,
  emotion = 'idle',
  className = '',
}) => {
  const tier: ClinicalTier = getClinicalTier(level);

  // Size mapping (width/height in px)
  const sizeDims = {
    xs: { w: 36, h: 36, viewBox: '0 0 120 120' },
    sm: { w: 52, h: 52, viewBox: '0 0 120 120' },
    md: { w: 96, h: 96, viewBox: '0 0 120 120' },
    lg: { w: 160, h: 160, viewBox: '0 0 120 120' },
    xl: { w: 230, h: 230, viewBox: '0 0 120 120' },
  }[size];

  const {
    skinTone,
    hairStyle,
    hairColor,
    scrubColor,
    outfitStyle,
    stethoscopeStyle,
    badgeStyle,
    watchStyle,
    glassesStyle,
    maskStyle,
    accessoryStyle,
  } = appearance;

  const isMaster = tier === 'emergency_master' || level >= 30;
  const isSpecialist = tier === 'resus_specialist' || level >= 20;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: sizeDims.w, height: sizeDims.h }}
    >
      {/* Background Clinical Aura for Master / High Level */}
      {showAura && isMaster && (
        <div
          className="absolute inset-0 -m-3 rounded-full bg-radial from-amber-400/30 via-rose-500/15 to-transparent blur-md animate-pulse pointer-events-none"
          aria-hidden="true"
        />
      )}

      {showAura && isSpecialist && !isMaster && (
        <div
          className="absolute inset-0 -m-2 rounded-full bg-radial from-cyan-400/25 via-blue-500/10 to-transparent blur-sm pointer-events-none"
          aria-hidden="true"
        />
      )}

      <svg
        width={sizeDims.w}
        height={sizeDims.h}
        viewBox={sizeDims.viewBox}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm select-none"
      >
        <defs>
          {/* Subtle Shading Gradient for Scrubs */}
          <linearGradient id="scrubGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={scrubColor} />
            <stop offset="100%" stopColor="#0F172A" stopOpacity="0.45" />
          </linearGradient>

          {/* White Coat Gradient */}
          <linearGradient id="whiteCoatGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#E2E8F0" />
          </linearGradient>

          {/* Gold Accent for Master Tier */}
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="50%" stopColor="#EAB308" />
            <stop offset="100%" stopColor="#CA8A04" />
          </linearGradient>
        </defs>

        {/* 1. Backdrop Vignette / Pod */}
        <circle cx="60" cy="60" r="58" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="2.5" />
        <circle cx="60" cy="60" r="54" fill="#F1F5F9" />

        {/* 2. Clinician Torso & Shoulders */}
        <g id="torso-layer">
          {/* Main Body Silhouette */}
          <path
            d="M26 116 C26 94 38 82 60 82 C82 82 94 94 94 116 Z"
            fill={scrubColor}
          />
          {/* Subtle Torso Shading */}
          <path
            d="M26 116 C26 94 38 82 60 82 C82 82 94 94 94 116 Z"
            fill="url(#scrubGradient)"
            opacity="0.35"
          />

          {/* Scrub V-Neck Collar */}
          <path
            d="M50 82 L60 96 L70 82 Z"
            fill={skinTone}
          />
          <path
            d="M48 82 L60 97 L72 82"
            stroke="#0F172A"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeOpacity="0.3"
          />

          {/* White Coat Overlay if equipped */}
          {(outfitStyle === 'white_coat_over_scrubs' || outfitStyle === 'chief_attending_coat') && (
            <g id="white-coat-lapels">
              <path
                d="M26 116 C26 95 36 84 50 84 L53 116 L26 116 Z"
                fill="url(#whiteCoatGradient)"
                stroke="#CBD5E1"
                strokeWidth="1.2"
              />
              <path
                d="M94 116 C94 95 84 84 70 84 L67 116 L94 116 Z"
                fill="url(#whiteCoatGradient)"
                stroke="#CBD5E1"
                strokeWidth="1.2"
              />
              {/* Coat Collar Lapels */}
              <path d="M46 84 L54 98 L50 110" stroke="#94A3B8" strokeWidth="1.5" fill="none" />
              <path d="M74 84 L66 98 L70 110" stroke="#94A3B8" strokeWidth="1.5" fill="none" />
            </g>
          )}

          {/* Trauma Bay Jumpsuit Chevron or Reflective Bands */}
          {outfitStyle === 'trauma_jumpsuit' && (
            <g id="trauma-chevrons">
              <path
                d="M34 104 L60 95 L86 104"
                stroke="#F59E0B"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M36 109 L60 100 L84 109"
                stroke="#FFFFFF"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
              />
            </g>
          )}

          {/* Resus Specialist Shell Reflectives */}
          {outfitStyle === 'resus_specialist_parka' && (
            <g id="resus-shell-tape">
              <path
                d="M28 106 L60 97 L92 106"
                stroke="#06B6D4"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
              />
            </g>
          )}
        </g>

        {/* 3. Neck */}
        <rect x="52" y="66" width="16" height="20" rx="4" fill={skinTone} />
        {/* Subtle neck shadow under chin */}
        <ellipse cx="60" cy="71" rx="8" ry="3" fill="#000000" opacity="0.12" />

        {/* 4. Head & Face Base */}
        <g id="head-layer">
          {/* Ears */}
          <ellipse cx="37" cy="54" rx="4" ry="7" fill={skinTone} />
          <ellipse cx="83" cy="54" rx="4" ry="7" fill={skinTone} />

          {/* Face Oval */}
          <ellipse cx="60" cy="53" rx="23" ry="26" fill={skinTone} />

          {/* Facial Expression: Eyes & Eyebrows */}
          {emotion === 'celebrating' ? (
            // Smiling arched eyes
            <g id="eyes-celebrating">
              <path d="M49 51 Q53 46 57 51" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <path d="M63 51 Q67 46 71 51" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <path d="M54 64 Q60 70 66 64" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" fill="none" />
            </g>
          ) : (
            // Focused, alert eyes
            <g id="eyes-focused">
              {/* Eyebrows */}
              <path d="M47 45 Q53 44 57 46" stroke={hairColor} strokeWidth="2.2" strokeLinecap="round" />
              <path d="M63 46 Q67 44 73 45" stroke={hairColor} strokeWidth="2.2" strokeLinecap="round" />

              {/* Eyes */}
              <ellipse cx="52" cy="51" rx="3.5" ry="4" fill="#FFFFFF" />
              <circle cx="52.5" cy="51" r="2.2" fill="#0F172A" />
              <circle cx="53.5" cy="50" r="0.8" fill="#FFFFFF" />

              <ellipse cx="68" cy="51" rx="3.5" ry="4" fill="#FFFFFF" />
              <circle cx="67.5" cy="51" r="2.2" fill="#0F172A" />
              <circle cx="68.5" cy="50" r="0.8" fill="#FFFFFF" />

              {/* Nose */}
              <path d="M60 51 L59 58 L62 58" stroke="#000000" strokeWidth="1.4" strokeOpacity="0.25" strokeLinecap="round" fill="none" />

              {/* Confident Mouth */}
              <path d="M56 65 Q60 67 64 65" stroke="#0F172A" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            </g>
          )}

          {/* Glasses / Goggles Layer */}
          {glassesStyle === 'safety_goggles' && (
            <g id="safety-goggles">
              <rect x="43" y="44" width="34" height="15" rx="5" fill="#38BDF8" fillOpacity="0.3" stroke="#0284C7" strokeWidth="2" />
              <line x1="39" y1="50" x2="43" y2="50" stroke="#0284C7" strokeWidth="2" />
              <line x1="77" y1="50" x2="81" y2="50" stroke="#0284C7" strokeWidth="2" />
            </g>
          )}
          {glassesStyle === 'classic_wire' && (
            <g id="classic-wire-frames">
              <circle cx="51" cy="51" r="7" fill="none" stroke="#64748B" strokeWidth="1.5" />
              <circle cx="69" cy="51" r="7" fill="none" stroke="#64748B" strokeWidth="1.5" />
              <line x1="58" y1="51" x2="62" y2="51" stroke="#64748B" strokeWidth="1.5" />
            </g>
          )}
          {glassesStyle === 'trauma_shield' && (
            <path
              d="M40 43 L80 43 L76 68 Q60 74 44 68 Z"
              fill="#F59E0B"
              fillOpacity="0.35"
              stroke="#D97706"
              strokeWidth="2"
            />
          )}

          {/* Mask Layer */}
          {maskStyle === 'surgical_blue' && (
            <path
              d="M43 57 C43 57 48 74 60 74 C72 74 77 57 77 57 L74 54 C74 54 60 56 46 54 Z"
              fill="#38BDF8"
              stroke="#0284C7"
              strokeWidth="1.5"
            />
          )}
          {maskStyle === 'n95_particulate' && (
            <path
              d="M44 58 L60 54 L76 58 L69 75 L51 75 Z"
              fill="#FFFFFF"
              stroke="#CBD5E1"
              strokeWidth="1.8"
            />
          )}
          {maskStyle === 'resus_filter_mask' && (
            <g id="tactical-resus-mask">
              <path
                d="M45 57 L60 53 L75 57 L68 76 L52 76 Z"
                fill="#1E293B"
                stroke="#0F172A"
                strokeWidth="2"
              />
              <circle cx="52" cy="66" r="3.5" fill="#EF4444" />
              <circle cx="68" cy="66" r="3.5" fill="#EF4444" />
            </g>
          )}

          {/* Hair Styles */}
          <g id="hair-layer">
            {hairStyle === 'short_crop' && (
              <path
                d="M37 50 C37 32 46 27 60 27 C74 27 83 32 83 50 C83 45 81 37 77 34 C72 31 48 31 43 34 C39 37 37 45 37 50 Z"
                fill={hairColor}
              />
            )}
            {hairStyle === 'buzz' && (
              <path
                d="M38 48 C38 34 46 30 60 30 C74 30 82 34 82 48 C82 43 78 33 60 33 C42 33 38 43 38 48 Z"
                fill={hairColor}
                opacity="0.85"
              />
            )}
            {hairStyle === 'parted' && (
              <g>
                <path
                  d="M36 50 C36 30 46 25 60 25 C74 25 84 30 84 50 C82 40 76 34 68 33 C60 32 50 34 44 38 C39 42 37 46 36 50 Z"
                  fill={hairColor}
                />
                {/* Part line swoosh */}
                <path d="M46 32 Q58 35 76 33" stroke={hairColor} strokeWidth="3" fill="none" />
              </g>
            )}
            {hairStyle === 'curly_fade' && (
              <g fill={hairColor}>
                <circle cx="48" cy="28" r="8" />
                <circle cx="60" cy="26" r="9" />
                <circle cx="72" cy="28" r="8" />
                <circle cx="40" cy="38" r="6" />
                <circle cx="80" cy="38" r="6" />
                <path d="M38 44 C38 32 48 28 60 28 C72 28 82 32 82 44 Z" />
              </g>
            )}
            {hairStyle === 'high_ponytail' && (
              <g fill={hairColor}>
                <path d="M37 48 C37 32 47 28 60 28 C73 28 83 32 83 48 C81 37 73 32 60 32 C47 32 39 37 37 48 Z" />
                {/* Ponytail puff */}
                <path d="M56 26 C52 14 68 14 64 26 Z" />
                <path d="M64 20 C72 16 78 28 72 36 C68 34 66 26 64 20 Z" />
              </g>
            )}
            {hairStyle === 'scrub_cap' && (
              <g id="surgical-scrub-cap">
                <path
                  d="M36 49 C36 29 46 25 60 25 C74 25 84 29 84 49 C77 46 43 46 36 49 Z"
                  fill={scrubColor}
                  stroke="#0F172A"
                  strokeWidth="1.2"
                />
                {/* Cap tie band */}
                <path d="M35 48 Q60 45 85 48" stroke="#FFFFFF" strokeWidth="2.5" fill="none" />
              </g>
            )}
            {hairStyle === 'long_braids' && (
              <g fill={hairColor}>
                <path d="M37 48 C37 32 47 28 60 28 C73 28 83 32 83 48 Z" />
                {/* Braids cascading */}
                <rect x="34" y="44" width="7" height="34" rx="3.5" />
                <rect x="79" y="44" width="7" height="34" rx="3.5" />
              </g>
            )}
            {hairStyle === 'wavy_bob' && (
              <g fill={hairColor}>
                <path d="M36 50 C36 30 46 26 60 26 C74 26 84 30 84 50 C84 62 81 68 78 68 C76 68 76 56 75 52 C72 44 48 44 45 52 C44 56 44 68 42 68 C39 68 36 62 36 50 Z" />
              </g>
            )}
          </g>
        </g>

        {/* 5. Stethoscope Layer (Draped around neck) */}
        {stethoscopeStyle !== 'none' && (
          <g id="stethoscope-layer">
            {/* Tubing loop draped around neck */}
            <path
              d="M44 82 C44 98 48 108 55 110 C58 111 62 111 65 110 C72 108 76 98 76 82"
              fill="none"
              stroke={
                stethoscopeStyle === 'gold_master_stethoscope'
                  ? 'url(#goldGradient)'
                  : stethoscopeStyle === 'digital_electronic_scope'
                  ? '#06B6D4'
                  : stethoscopeStyle === 'cardiology_dual_lumen'
                  ? '#1E293B'
                  : '#475569'
              }
              strokeWidth={stethoscopeStyle === 'cardiology_dual_lumen' ? '4.5' : '3.5'}
              strokeLinecap="round"
            />

            {/* Chestpiece / Bell dangling at chest */}
            <circle
              cx="55"
              cy="110"
              r="6.5"
              fill={
                stethoscopeStyle === 'gold_master_stethoscope'
                  ? '#EAB308'
                  : '#CBD5E1'
              }
              stroke="#0F172A"
              strokeWidth="1.5"
            />
            <circle
              cx="55"
              cy="110"
              r="3.5"
              fill={
                stethoscopeStyle === 'digital_electronic_scope'
                  ? '#06B6D4'
                  : stethoscopeStyle === 'gold_master_stethoscope'
                  ? '#FDE047'
                  : '#94A3B8'
              }
            />
          </g>
        )}

        {/* 6. Hospital ID Badge clipped on chest */}
        {showBadge && (
          <g id="badge-layer">
            {/* Lanyard Clip */}
            <rect x="74" y="90" width="4" height="6" rx="1" fill="#94A3B8" />

            {/* Badge Card */}
            {badgeStyle === 'chief_gold_keycard' ? (
              <g>
                <rect x="71" y="95" width="16" height="20" rx="2" fill="url(#goldGradient)" stroke="#92400E" strokeWidth="1" />
                <rect x="73" y="97" width="5" height="5" rx="1" fill="#FFFFFF" />
                <line x1="73" y1="105" x2="84" y2="105" stroke="#78350F" strokeWidth="1.5" />
                <line x1="73" y1="109" x2="81" y2="109" stroke="#78350F" strokeWidth="1" />
              </g>
            ) : badgeStyle === 'ed_trainee_badge' ? (
              <g>
                <rect x="71" y="95" width="16" height="20" rx="2" fill="#FFFFFF" stroke="#0284C7" strokeWidth="1.2" />
                <rect x="71" y="95" width="16" height="4" fill="#0284C7" />
                <rect x="73" y="101" width="4" height="4" rx="1" fill="#94A3B8" />
                <line x1="79" y1="102" x2="84" y2="102" stroke="#0F172A" strokeWidth="1" />
                <line x1="73" y1="108" x2="84" y2="108" stroke="#E11D48" strokeWidth="1.5" />
              </g>
            ) : (
              // Basic Paper Badge
              <g>
                <rect x="72" y="95" width="14" height="18" rx="1.5" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
                <line x1="74" y1="99" x2="83" y2="99" stroke="#E11D48" strokeWidth="1.2" />
                <line x1="74" y1="103" x2="81" y2="103" stroke="#94A3B8" strokeWidth="0.8" />
                <line x1="74" y1="106" x2="79" y2="106" stroke="#94A3B8" strokeWidth="0.8" />
              </g>
            )}
          </g>
        )}

        {/* 7. Accessories (Penlight in pocket or trauma shears) */}
        {accessoryStyle === 'penlight_in_pocket' && (
          <g id="penlight-pocket">
            <rect x="36" y="94" width="3" height="12" rx="1.5" fill="#94A3B8" stroke="#475569" strokeWidth="0.8" />
            <circle cx="37.5" cy="94" r="1.5" fill="#FACC15" />
          </g>
        )}
        {accessoryStyle === 'trauma_shears_holster' && (
          <g id="trauma-shears">
            <path d="M34 94 L39 104" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M38 94 L33 104" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="34" cy="93" r="2.5" fill="none" stroke="#EF4444" strokeWidth="1.5" />
            <circle cx="38" cy="93" r="2.5" fill="none" stroke="#EF4444" strokeWidth="1.5" />
          </g>
        )}

        {/* 8. Level Tier Border Accent Ring */}
        <circle
          cx="60"
          cy="60"
          r="58"
          fill="none"
          stroke={
            isMaster
              ? '#F59E0B'
              : isSpecialist
              ? '#06B6D4'
              : tier === 'practitioner'
              ? '#10B981'
              : '#E2E8F0'
          }
          strokeWidth={isMaster ? '3' : isSpecialist ? '2.5' : '2'}
        />
      </svg>
    </div>
  );
};
