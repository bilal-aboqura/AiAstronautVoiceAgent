import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { CelestialBodyConfig } from '../../types/solar-system';
import { OrbitalElements } from '../../types/solar-system';
import { useSolarSystemStore } from '../../store/useSolarSystemStore';
import { SaturnRings } from './SaturnRings';
import { Moon } from './Moon';
import { AtmosphereGlow } from './AtmosphereGlow';

const Y_AXIS = new THREE.Vector3(0, 1, 0);
const X_AXIS = new THREE.Vector3(1, 0, 0);

/**
 * Computes a planet's 3D world position on its inclined elliptical orbit.
 * Rotation order (inner → outer: ω → i → Ω) matches OrbitalPath.tsx identically.
 */
function keplerPosition(
  a: number,
  elements: OrbitalElements | undefined,
  meanAnomaly: number,
  out: THREE.Vector3
): THREE.Vector3 {
  const e = elements?.eccentricity ?? 0;
  // Solve Kepler's Equation M = E - e*sin(E) via Newton-Raphson
  let E = meanAnomaly;
  if (e > 0) {
    for (let iter = 0; iter < 4; iter++) {
      E -= (E - e * Math.sin(E) - meanAnomaly) / (1 - e * Math.cos(E));
    }
  }

  const b = a * Math.sqrt(1 - e * e);
  const c = a * e;
  out.set(a * Math.cos(E) - c, 0, b * Math.sin(E));

  if (elements) {
    const omegaRad = THREE.MathUtils.degToRad(elements.argPerihelion);
    const incRad = THREE.MathUtils.degToRad(elements.inclination);
    const OmegaRad = THREE.MathUtils.degToRad(elements.longAscendingNode);

    out.applyAxisAngle(Y_AXIS, omegaRad);
    out.applyAxisAngle(X_AXIS, incRad);
    out.applyAxisAngle(Y_AXIS, OmegaRad);
  }

  return out;
}

export const planetPositionsMap = new Map<string, THREE.Vector3>();

// Per-planet physically based material presets
// Tuned to match NASA reference imagery for each world
const PBR_PRESETS: Record<string, { roughness: number; metalness: number; normalStrength: number; bumpScale: number; envMapIntensity: number }> = {
  mercury:  { roughness: 0.94, metalness: 0.00, normalStrength: 1.0, bumpScale: 0.025, envMapIntensity: 0.0 },
  venus:    { roughness: 0.72, metalness: 0.00, normalStrength: 0.3, bumpScale: 0.008, envMapIntensity: 0.05 },
  earth:    { roughness: 0.62, metalness: 0.02, normalStrength: 0.85, bumpScale: 0.0, envMapIntensity: 0.1 },
  mars:     { roughness: 0.88, metalness: 0.00, normalStrength: 1.0, bumpScale: 0.03, envMapIntensity: 0.0 },
  jupiter:  { roughness: 0.68, metalness: 0.00, normalStrength: 0.1, bumpScale: 0.0, envMapIntensity: 0.05 },
  saturn:   { roughness: 0.70, metalness: 0.00, normalStrength: 0.1, bumpScale: 0.0, envMapIntensity: 0.05 },
  uranus:   { roughness: 0.55, metalness: 0.00, normalStrength: 0.05, bumpScale: 0.0, envMapIntensity: 0.08 },
  neptune:  { roughness: 0.52, metalness: 0.00, normalStrength: 0.05, bumpScale: 0.0, envMapIntensity: 0.08 },
};

// Atmosphere glow intensities tuned per planet
const ATMOSPHERE_INTENSITY: Record<string, number> = {
  venus: 0.55,
  earth: 0.75,
  mars: 0.30,
  jupiter: 0.35,
  saturn: 0.28,
  uranus: 0.60,
  neptune: 0.65,
};

interface PlanetProps {
  config: CelestialBodyConfig;
  initialAngle?: number;
}

export const Planet: React.FC<PlanetProps> = ({ config, initialAngle = 0 }) => {
  const planetGroupRef = useRef<THREE.Group>(null);
  const planetMeshRef = useRef<THREE.Mesh>(null);
  const cloudsMeshRef = useRef<THREE.Mesh>(null);
  const angleRef = useRef<number>(initialAngle);

  const selectedPlanetId = useSolarSystemStore((state) => state.selectedPlanetId);
  const isOrbiting = useSolarSystemStore((state) => state.isOrbiting);
  const orbitSpeedMultiplier = useSolarSystemStore((state) => state.orbitSpeedMultiplier);
  const selectPlanet = useSolarSystemStore((state) => state.selectPlanet);
  const hoverPlanet = useSolarSystemStore((state) => state.hoverPlanet);

  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [cloudsTexture, setCloudsTexture] = useState<THREE.Texture | null>(null);
  const [normalTexture, setNormalTexture] = useState<THREE.Texture | null>(null);
  const [specularTexture, setSpecularTexture] = useState<THREE.Texture | null>(null);

  const pbr = PBR_PRESETS[config.id] ?? { roughness: 0.75, metalness: 0.02, normalStrength: 0.5, bumpScale: 0.0, envMapIntensity: 0.05 };

  // Configure texture with high-quality anisotropic filtering & mipmapping
  const setupTexture = (tex: THREE.Texture, isColorMap = true) => {
    if (isColorMap) {
      tex.colorSpace = THREE.SRGBColorSpace;
    }
    tex.anisotropy = 16;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = true;
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  };

  // Load authentic NASA textures
  useEffect(() => {
    const loader = new THREE.TextureLoader();

    if (config.textureUrl) {
      loader.load(
        config.textureUrl,
        (tex) => setTexture(setupTexture(tex, true)),
        undefined,
        () => setTexture(null)
      );
    }
    if (config.cloudsTextureUrl) {
      loader.load(
        config.cloudsTextureUrl,
        (tex) => setCloudsTexture(setupTexture(tex, true)),
        undefined,
        () => setCloudsTexture(null)
      );
    }
    if (config.normalTextureUrl) {
      loader.load(
        config.normalTextureUrl,
        (tex) => setNormalTexture(setupTexture(tex, false)),
        undefined,
        () => setNormalTexture(null)
      );
    }
    if (config.specularTextureUrl) {
      loader.load(
        config.specularTextureUrl,
        (tex) => setSpecularTexture(setupTexture(tex, false)),
        undefined,
        () => setSpecularTexture(null)
      );
    }
  }, [config.textureUrl, config.cloudsTextureUrl, config.normalTextureUrl, config.specularTextureUrl]);

  const initialPos = useMemo(() => {
    const vec = new THREE.Vector3();
    return keplerPosition(config.distance, config.orbitalElements, initialAngle, vec);
  }, [config.distance, config.orbitalElements, initialAngle]);

  const currentPosVector = useMemo(() => new THREE.Vector3().copy(initialPos), [initialPos]);

  useEffect(() => {
    planetPositionsMap.set(config.id, currentPosVector);
  }, [config.id, currentPosVector]);

  useFrame((_, delta) => {
    if (isOrbiting) {
      angleRef.current += config.orbitalSpeed * 0.35 * orbitSpeedMultiplier * delta * 60;
    }

    keplerPosition(config.distance, config.orbitalElements, angleRef.current, currentPosVector);

    if (planetGroupRef.current) {
      planetGroupRef.current.position.copy(currentPosVector);
      planetPositionsMap.set(config.id, currentPosVector);
    }

    if (planetMeshRef.current) {
      planetMeshRef.current.rotation.y += config.rotationSpeed * delta * 60;
    }

    if (cloudsMeshRef.current) {
      cloudsMeshRef.current.rotation.y += (config.rotationSpeed * 1.15) * delta * 60;
    }
  });

  const handleClick = (e: ThreeEvent<MouseEvent | PointerEvent>) => {
    e.stopPropagation();
    selectPlanet(config.id, 'click');
  };

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    hoverPlanet(config.id);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    hoverPlanet(null);
    document.body.style.cursor = 'auto';
  };

  // Higher tessellation for larger planets — smoother spheres
  const segments = config.radius > 1.5 ? 128 : 96;

  return (
    <>
      <group ref={planetGroupRef} position={initialPos.toArray()}>
        {/* Axial Tilt Group */}
        <group rotation={[config.tilt || 0, 0, 0]}>
          {/* Main Planet PBR Mesh */}
          <mesh
            ref={planetMeshRef}
            onClick={handleClick}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
          >
            <sphereGeometry args={[config.radius, segments, segments]} />
            <meshStandardMaterial
              key={`mat-${Boolean(texture)}-${Boolean(normalTexture)}`}
              map={texture || undefined}
              normalMap={normalTexture || undefined}
              normalScale={new THREE.Vector2(pbr.normalStrength, pbr.normalStrength)}
              bumpMap={!normalTexture && pbr.bumpScale > 0 && texture ? texture : undefined}
              bumpScale={pbr.bumpScale}
              color={texture ? '#ffffff' : config.color}
              roughness={pbr.roughness}
              metalness={pbr.metalness}
              envMapIntensity={pbr.envMapIntensity}
            />
          </mesh>

          {/* Earth Cloud Layer — uses alphaMap so black areas are 100% transparent */}
          {cloudsTexture && (
            <mesh ref={cloudsMeshRef}>
              <sphereGeometry args={[config.radius * 1.012, segments, segments]} />
              <meshStandardMaterial
                key="earth-clouds-mat"
                map={cloudsTexture}
                alphaMap={cloudsTexture}
                color="#ffffff"
                transparent
                opacity={0.85}
                blending={THREE.NormalBlending}
                depthWrite={false}
                roughness={1.0}
                metalness={0.0}
              />
            </mesh>
          )}

          {/* Fresnel Atmospheric Scattering Glow */}
          {config.hasAtmosphereGlow && config.atmosphereGlowColor && (
            <AtmosphereGlow
              radius={config.radius}
              color={config.atmosphereGlowColor}
              intensity={ATMOSPHERE_INTENSITY[config.id] ?? 0.25}
            />
          )}

          {/* Planetary Rings */}
          {config.rings && <SaturnRings rings={config.rings} />}
        </group>

        {/* Moons */}
        {config.moons &&
          config.moons.map((moon) => (
            <Moon key={moon.id} config={moon} />
          ))}

        {/* Invisible Touch Hitbox */}
        <mesh
          onClick={handleClick}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          <sphereGeometry args={[config.radius * 1.6, 16, 16]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>
    </>
  );
};
