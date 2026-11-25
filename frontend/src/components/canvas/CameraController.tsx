import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useSolarSystemStore } from '../../store/useSolarSystemStore';
import { PLANETS_DATA, SUN_CONFIG } from '../../data/planets';
import { planetPositionsMap } from './Planet';

interface CameraControllerProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  controlsRef?: React.RefObject<any>;
}

export const CameraController: React.FC<CameraControllerProps> = ({ controlsRef }) => {
  const { camera } = useThree();
  const selectedPlanetId = useSolarSystemStore((state) => state.selectedPlanetId);

  // Cinematic overview camera: elevated 3D vantage point framing all 8 inclined planetary orbits around the Sun
  const overviewCamPos = useMemo(() => new THREE.Vector3(0, 32.0, 76.0), []);
  const overviewTarget = useMemo(() => new THREE.Vector3(0, 0, 0), []);

  const currentTarget = useRef(new THREE.Vector3(0, 0.2, 0));
  const desiredCamPos = useMemo(() => new THREE.Vector3(), []);
  const desiredTarget = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    // Responsive, silky smooth damping lambda
    const lambda = 3.0;

    if (selectedPlanetId) {
      const isSun = selectedPlanetId === 'sun';
      const planetConfig = isSun ? SUN_CONFIG : PLANETS_DATA.find((p) => p.id === selectedPlanetId);
      const planetPos = isSun ? new THREE.Vector3(0, 0, 0) : planetPositionsMap.get(selectedPlanetId);

      if (planetConfig && planetPos) {
        desiredTarget.copy(planetPos);

        // Frame the whole planet: pull back far enough so the sphere
        // fits comfortably within the camera frustum, with extra
        // padding for rings (Saturn) and atmosphere glow.
        const hasRings = !!(planetConfig as any).rings;
        const effectiveRadius = hasRings
          ? ((planetConfig as any).rings.outerRadius ?? planetConfig.radius) * 1.2
          : planetConfig.radius;
        const fovRad = THREE.MathUtils.degToRad(54 / 2); // half the camera FOV
        // Distance so the sphere subtends ~60% of vertical FOV
        const fitDistance = effectiveRadius / Math.sin(fovRad) * 1.35;
        const viewDistance = Math.max(fitDistance, 4.0);

        desiredCamPos.set(
          planetPos.x + viewDistance * 0.55,
          planetPos.y + viewDistance * 0.35,
          planetPos.z + viewDistance * 0.7
        );
      }
    } else {
      desiredCamPos.copy(overviewCamPos);
      desiredTarget.copy(overviewTarget);
    }

    // Smoothly damp camera coordinates
    camera.position.x = THREE.MathUtils.damp(camera.position.x, desiredCamPos.x, lambda, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, desiredCamPos.y, lambda, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, desiredCamPos.z, lambda, delta);

    // Smoothly damp look-at target
    currentTarget.current.x = THREE.MathUtils.damp(currentTarget.current.x, desiredTarget.x, lambda, delta);
    currentTarget.current.y = THREE.MathUtils.damp(currentTarget.current.y, desiredTarget.y, lambda, delta);
    currentTarget.current.z = THREE.MathUtils.damp(currentTarget.current.z, desiredTarget.z, lambda, delta);

    if (controlsRef?.current) {
      controlsRef.current.target.copy(currentTarget.current);
      controlsRef.current.update();
    } else {
      camera.lookAt(currentTarget.current);
    }
  });

  return null;
};
