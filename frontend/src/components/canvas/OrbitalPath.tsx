import React, { useMemo } from 'react';
import * as THREE from 'three';

interface OrbitalPathProps {
  semiMajorAxis: number;      // scene units (a)
  eccentricity: number;       // e (0 to <1)
  inclination: number;        // degrees (i)
  longAscendingNode: number;  // degrees (Ω)
  argPerihelion: number;      // degrees (ω)
  color: string;
  opacity?: number;
}

/**
 * Renders a scientifically accurate elliptical orbital path for a solar system planet.
 * The Sun sits at one focus of the ellipse. The orbit is correctly oriented in 3D space
 * using three Keplerian angles: ω (arg. of perihelion), i (inclination), Ω (long. asc. node).
 * Rotation order matches keplerPosition() in Planet.tsx: outer → inner = Ω → i → ω.
 */
export const OrbitalPath: React.FC<OrbitalPathProps> = ({
  semiMajorAxis: a,
  eccentricity: e,
  inclination,
  longAscendingNode,
  argPerihelion,
  color,
  opacity = 0.45,
}) => {
  // Build ellipse geometry with Sun at one focus (offset by –c along X)
  const geometry = useMemo(() => {
    const b = a * Math.sqrt(1 - e * e); // semi-minor axis
    const c = a * e;                     // focus-to-center distance

    const N = 256;
    const points: THREE.Vector3[] = [];
    for (let k = 0; k <= N; k++) {
      const theta = (k / N) * Math.PI * 2;
      points.push(new THREE.Vector3(
        a * Math.cos(theta) - c, // shift so Sun (focus) is at origin
        0,
        b * Math.sin(theta),
      ));
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [a, e]);

  const omegaRad = THREE.MathUtils.degToRad(argPerihelion);
  const incRad   = THREE.MathUtils.degToRad(inclination);
  const OmegaRad = THREE.MathUtils.degToRad(longAscendingNode);

  return (
    // Apply orbital element rotations (must match keplerPosition() order in Planet.tsx)
    <group rotation={[0, OmegaRad, 0]}>
      <group rotation={[incRad, 0, 0]}>
        <group rotation={[0, omegaRad, 0]}>
          {/* Primary orbit ring */}
          <lineLoop geometry={geometry}>
            <lineBasicMaterial
              color={color}
              transparent
              opacity={opacity}
              depthWrite={false}
            />
          </lineLoop>
          {/* Soft outer glow pass (additive blend, same geometry) */}
          <lineLoop geometry={geometry}>
            <lineBasicMaterial
              color={color}
              transparent
              opacity={opacity * 0.35}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </lineLoop>
        </group>
      </group>
    </group>
  );
};
