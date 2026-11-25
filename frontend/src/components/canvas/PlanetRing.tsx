import React from 'react';
import * as THREE from 'three';

// Thin decorative ring around a planet to highlight its own orbit/scale.
// Rendered in the planet's local space, lying in the ecliptic (XZ) plane.
export const PlanetRing: React.FC<{ radius: number }> = ({ radius }) => {
  const inner = radius * 1.02;
  const outer = radius * 1.08;
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[inner, outer, 64]} />
      <meshBasicMaterial
        color="#FFD700"
        transparent
        opacity={0.35}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};
