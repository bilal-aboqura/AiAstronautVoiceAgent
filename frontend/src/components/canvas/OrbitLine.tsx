import React, { useMemo } from 'react';
import * as THREE from 'three';

interface OrbitLineProps {
  distance: number;
  color?: string;
}

export const OrbitLine: React.FC<OrbitLineProps> = ({ distance, color = '#1E293B' }) => {
  const geometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const segments = 128;
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(angle) * distance, 0, Math.sin(angle) * distance));
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [distance]);

  return (
    <lineLoop geometry={geometry}>
      <lineBasicMaterial color={color} transparent opacity={0.16} />
    </lineLoop>
  );
};
