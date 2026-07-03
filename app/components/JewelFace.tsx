'use client';

import { useEffect, useState } from 'react';

const PORTRAIT_AWAKE = '/images/jewel-face.png';
const PORTRAIT_REST = '/images/jewel-face-closed.png';

function portraitForHour(hour: number) {
  return hour >= 6 && hour < 20 ? PORTRAIT_AWAKE : PORTRAIT_REST;
}

export function JewelFace() {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      setSrc(portraitForHour(new Date().getHours()));
    };

    update();
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="jewel-face" aria-hidden="true">
      {src && (
        <img
          src={src}
          alt=""
          className="jewel-face-img"
          width={1024}
          height={1024}
          draggable={false}
        />
      )}
    </div>
  );
}
