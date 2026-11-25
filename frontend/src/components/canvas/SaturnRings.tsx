import React, { useState, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { RingConfig } from '../../types/solar-system';

interface SaturnRingsProps {
  rings: RingConfig;
}

export const SaturnRings: React.FC<SaturnRingsProps> = ({ rings }) => {
  const [ringTexture, setRingTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (rings.textureUrl) {
      const loader = new THREE.TextureLoader();
      loader.load(rings.textureUrl, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 16;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.generateMipmaps = true;
        setRingTexture(tex);
      });
    } else {
      setRingTexture(null);
    }
  }, [rings.textureUrl]);

  // Generate planar UVs matching the concentric circular ring structure
  const ringGeometry = useMemo(() => {
    const geo = new THREE.RingGeometry(rings.innerRadius, rings.outerRadius, 128);
    const pos = geo.attributes.position;
    const uvs = geo.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      // Map [-outerRadius, outerRadius] into [0, 1] texture coordinates
      uvs.setXY(i, (x / (2 * rings.outerRadius)) + 0.5, (y / (2 * rings.outerRadius)) + 0.5);
    }
    uvs.needsUpdate = true;
    return geo;
  }, [rings.innerRadius, rings.outerRadius]);

  return (
    <group rotation={[rings.tilt || 0, 0, 0]}>
      <mesh geometry={ringGeometry} rotation={[-Math.PI / 2, 0, 0]}>
        <meshStandardMaterial
          key={ringTexture ? 'textured' : 'fallback'}
          map={ringTexture || undefined}
          color={ringTexture ? '#ffffff' : (rings.color || '#C8B282')}
          side={THREE.DoubleSide}
          transparent
          opacity={rings.opacity}
          roughness={0.65}
          metalness={0.05}
        />
      </mesh>
    </group>
  );
};
