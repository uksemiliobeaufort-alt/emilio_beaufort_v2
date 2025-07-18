"use client";

import React, { useEffect, useRef, useState } from 'react';
import Globe from 'globe.gl';

const GlobeBackground: React.FC = () => {
  const globeEl = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let globeInstance: any;
    setLoading(true);
    setError(null);
    try {
      globeInstance = new Globe(globeEl.current!)
        .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
        .backgroundColor('rgba(0,0,0,0)')
        .showAtmosphere(true)
        .atmosphereColor('#fff')
        .atmosphereAltitude(0.25)
        .width(window.innerWidth)
        .height(window.innerHeight);
      globeInstance.controls().autoRotate = true;
      globeInstance.controls().autoRotateSpeed = 0.5;
      globeInstance.controls().enableZoom = false;
      setLoading(false);
    } catch (e: any) {
      setError('Failed to load globe.');
      setLoading(false);
    }
    return () => {
      if (globeInstance && globeInstance._destructor) globeInstance._destructor();
    };
  }, []);

  return (
    <>
      <div
        ref={globeEl}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
      {loading && (
        <div style={{position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none'}}>
          <div style={{background: 'rgba(255,255,255,0.7)', padding: 24, borderRadius: 12, fontSize: 18}}>Loading globe...</div>
        </div>
      )}
      {error && (
        <div style={{position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none'}}>
          <div style={{background: 'rgba(255,0,0,0.1)', padding: 24, borderRadius: 12, fontSize: 18, color: '#b00'}}>{error}</div>
        </div>
      )}
    </>
  );
};

export default GlobeBackground; 