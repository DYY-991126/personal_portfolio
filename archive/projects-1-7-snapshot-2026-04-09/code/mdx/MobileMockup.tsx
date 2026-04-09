import React from 'react';

interface MobileMockupProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * MobileMockup Component - Natural Titanium Style
 * 
 * A highly realistic iPhone 15 Pro mockup with natural titanium finish,
 * built using Tailwind CSS for styling and complex box-shadows for physical materials simulation.
 */
export const MobileMockup: React.FC<MobileMockupProps> = ({ children, className = '', style }) => {
  return (
    <div className={`relative mx-auto transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${className}`}
         style={{ width: '393px', height: '852px', ...style }}>
      
      {/* 
        Main Device Frame - Natural Titanium
      */}
      <div 
        className="relative w-full h-full rounded-[55px] z-10 bg-[#a7a49d]"
        style={{
          boxShadow: `
            0 0 0 1px rgba(0,0,0,0.1),
            0 30px 60px -10px rgba(0,0,0,0.25),
            0 50px 100px -20px rgba(0,0,0,0.3),
            inset 0 1px 0 0 rgba(255,255,255,0.95),
            inset 0 -1px 0 0 rgba(0,0,0,0.2),
            inset 6px 0 6px -4px rgba(255,255,255,0.7),
            inset -6px 0 6px -4px rgba(0,0,0,0.2),
            inset 0 0 12px rgba(255,255,255,0.3)
          `
        }}
      >
        {/* Brushed Metal Texture Layer */}
        <div 
          className="absolute inset-0 rounded-[55px] pointer-events-none p-[3px]"
          style={{
            background: `
              url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.15'/%3E%3C/svg%3E"),
              linear-gradient(125deg, #b5b2ab 0%, #d1d0cb 25%, #e8e7e3 45%, #bebbb5 55%, #d1d0cb 70%, #9c9a93 100%)
            `,
            backgroundBlendMode: 'overlay, normal',
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'exclude',
            WebkitMaskComposite: 'xor',
            boxShadow: `
              inset 0 0 2px 1px rgba(255,255,255,0.4),
              inset 0 1px 0 0 rgba(255,255,255,0.8)
            `
          }}
        />

        {/* Physical Buttons */}
        <div className="absolute left-[-3px] top-[115px] w-[3px] h-[26px] bg-[#99968e] rounded-l-[4px] z-[5] border border-black/10"
             style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.8), inset 0 -1px 1px rgba(0,0,0,0.3), inset 1px 0 2px rgba(255,255,255,0.4), -1px 1px 4px rgba(0,0,0,0.25)' }} />
        
        <div className="absolute left-[-3px] top-[165px] w-[3px] h-[48px] bg-[#99968e] rounded-l-[4px] z-[5] border border-black/10"
             style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.8), inset 0 -1px 1px rgba(0,0,0,0.3), inset 1px 0 2px rgba(255,255,255,0.4), -1px 1px 4px rgba(0,0,0,0.25)' }} />
        
        <div className="absolute left-[-3px] top-[225px] w-[3px] h-[48px] bg-[#99968e] rounded-l-[4px] z-[5] border border-black/10"
             style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.8), inset 0 -1px 1px rgba(0,0,0,0.3), inset 1px 0 2px rgba(255,255,255,0.4), -1px 1px 4px rgba(0,0,0,0.25)' }} />
        
        <div className="absolute right-[-3px] top-[190px] w-[3px] h-[80px] bg-[#99968e] rounded-r-[4px] z-[5] border border-black/10"
             style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.8), inset 0 -1px 1px rgba(0,0,0,0.3), inset -1px 0 2px rgba(255,255,255,0.4), 1px 1px 3px rgba(0,0,0,0.2)' }} />

        {/* Bezel */}
        <div className="absolute inset-[3px] bg-[#050505] rounded-[52px] z-[11]"
             style={{ 
               boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05), 0 0 0 1px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.2)' 
             }}>
          
          {/* Screen */}
          <div className="absolute inset-[8px] bg-white rounded-[44px] overflow-hidden z-[12] flex flex-col"
               style={{ boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)' }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
