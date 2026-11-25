import React, { useRef, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Starfield } from './Starfield';
import { Sun } from './Sun';
import { Planet } from './Planet';
import { CameraController } from './CameraController';
import { PLANETS_DATA } from '../../data/planets';
import { OrbitalPath } from './OrbitalPath';
import { useSolarSystemStore } from '../../store/useSolarSystemStore';

export const SolarSystemCanvas: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = useRef<any>(null);
  const resetView = useSolarSystemStore((state) => state.resetView);

  const initialAngles = useMemo(() => {
    return PLANETS_DATA.map((_, index) => (index * (Math.PI * 2)) / PLANETS_DATA.length);
  }, []);

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden select-none">
      <Canvas
        camera={{ fov: 54, position: [0, 32, 76] }}
        dpr={[1, 2]}
        onPointerMissed={() => {}}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
        }}
      >
        {/* Full-sphere ambient illumination so all planet sides are clearly visible without dark night shadows */}
        <ambientLight intensity={1.15} color="#EEF4FF" />

        {/* Soft hemisphere fill for subtle 3D depth without darkening the back side */}
        <hemisphereLight args={['#DDE8FF', '#8FA4C4', 0.45]} />

        {/* Deep Space 3D Starfield */}
        <Starfield />

        {/* Photorealistic Luminous Sun with Primary Solar Light */}
        <Sun />

        {/* Scientifically Accurate Inclined Elliptical Orbital Paths for all 8 Planets */}
        {PLANETS_DATA.map((planet) =>
          planet.orbitalElements ? (
            <OrbitalPath
              key={`${planet.id}-orbit`}
              semiMajorAxis={planet.distance}
              eccentricity={planet.orbitalElements.eccentricity}
              inclination={planet.orbitalElements.inclination}
              longAscendingNode={planet.orbitalElements.longAscendingNode}
              argPerihelion={planet.orbitalElements.argPerihelion}
              color={planet.orbitColor || planet.color}
              opacity={0.48}
            />
          ) : null
        )}


        {/* All Eight Major Planets with Authentic NASA Textures & PBR Materials */}
        {PLANETS_DATA.map((planet, index) => (
          <Planet
            key={planet.id}
            config={planet}
            initialAngle={initialAngles[index]}
          />
        ))}

        {/* Smooth Cinematic Camera Transitions */}
        <CameraController controlsRef={controlsRef} />

        {/* Interactive Controls */}
        <OrbitControls
          ref={controlsRef}
          makeDefault
          enableDamping
          dampingFactor={0.05}
          maxDistance={350}
          minDistance={1.5}
          rotateSpeed={0.7}
          zoomSpeed={0.9}
        />
      </Canvas>
    </div>
  );
};
