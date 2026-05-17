import React from 'react';

interface WatermarkOverlayProps {
  identifier: string; // usually user's email
}

export const WatermarkOverlay: React.FC<WatermarkOverlayProps> = ({ identifier }) => {
  // Generate a grid of watermarks
  const renderWatermarks = () => {
    const marks = [];
    for (let i = 0; i < 20; i++) {
      marks.push(
        <div key={i} className="text-text-primary text-2xl font-bold -rotate-30 m-12 select-none whitespace-nowrap">
          {identifier}
        </div>
      );
    }
    return marks;
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] flex flex-wrap justify-around items-center overflow-hidden opacity-[0.04]" aria-hidden="true">
      {renderWatermarks()}
    </div>
  );
};
