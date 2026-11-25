import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MoonConfig } from '../../types/solar-system';
import { useSolarSystemStore } from '../../store/useSolarSystemStore';

interface MoonProps {
  config: MoonConfig;
}

export const Moon: React.FC<MoonProps> = ({ config }) => {
  const moonGroupRef = useRef<THREE.Group>(null);
  const moonMeshRef = useRef<THREE.Mesh>(null);
  const angleRef = useRef<number>(Math.random() * Math.PI * 2);

  const isOrbiting = useSolarSystemStore((state) => state.isOrbiting);
  const orbitSpeedMultiplier = useSolarSystemStore((state) => state.orbitSpeedMultiplier);

  const [moonTexture, setMoonTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    const url = config.textureUrl || '/textures/planets/moon.jpg';
    loader.load(url, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 16;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.generateMipmaps = true;
      setMoonTexture(tex);
    });
  }, [config.textureUrl]);

  useFrame((_, delta) => {
    if (isOrbiting) {
      angleRef.current += config.orbitalSpeed * 0.4 * orbitSpeedMultiplier * delta * 60;
    }
    if (moonGroupRef.current) {
      moonGroupRef.current.position.x = Math.cos(angleRef.current) * config.distance;
      moonGroupRef.current.position.z = Math.sin(angleRef.current) * config.distance;
    }
    if (moonMeshRef.current) {
      moonMeshRef.current.rotation.y += config.rotationSpeed * delta * 60;
    }
  });

  return (
    <group ref={moonGroupRef}>
      <mesh ref={moonMeshRef}>
        <sphereGeometry args={[config.radius, 32, 32]} />
        <meshStandardMaterial
          key={moonTexture ? 'textured' : 'fallback'}
          map={moonTexture || undefined}
          bumpMap={moonTexture || undefined}
          bumpScale={0.02}
          color={moonTexture ? '#ffffff' : config.color}
          roughness={0.92}
          metalness={0.02}
        />
      </mesh>
    </group>
  );
};
