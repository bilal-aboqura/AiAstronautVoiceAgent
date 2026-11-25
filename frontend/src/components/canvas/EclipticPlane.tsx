import React from 'react';
import * as THREE from 'three';

// Visual representation of the ecliptic plane (Y = 0)
// Rendered as a thin, semi‑transparent disc spanning the solar system extent.
export const EclipticPlane: React.FC = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      {/* Outer radius 40 units, inner radius 0 creates a disc */}
      <ringGeometry args={[0, 40, 128]} />
      <meshBasicMaterial
        color="#6EE7B7"
        transparent
        opacity={0.2}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};
