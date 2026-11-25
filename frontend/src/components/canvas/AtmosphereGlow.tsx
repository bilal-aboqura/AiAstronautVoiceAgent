import React, { useMemo } from 'react';
import * as THREE from 'three';

interface AtmosphereGlowProps {
  radius: number;
  color: string;
  intensity?: number;
}

// Realistic BackSide atmospheric limb scattering shader:
// Fades smoothly to 0.0 at the outer boundary (dot = 0) and peaks softly
// just above the planet's surface limb, eliminating any hard circular edge.
const atmosphereVertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vPosition = mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const atmosphereFragmentShader = `
  uniform vec3 uColor;
  uniform float uIntensity;
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    vec3 viewDir = normalize(-vPosition);
    // On BackSide, vNormal points away from camera, so -dot(vNormal, viewDir)
    // is 0.0 at the outer silhouette and increases smoothly inward toward the planet limb.
    float rim = clamp(-dot(vNormal, viewDir), 0.0, 1.0);
    float scatter = pow(rim, 3.2) * uIntensity;

    gl_FragColor = vec4(uColor * scatter, scatter);
  }
`;

export const AtmosphereGlow: React.FC<AtmosphereGlowProps> = ({
  radius,
  color,
  intensity = 0.25,
}) => {
  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(color) },
      uIntensity: { value: intensity },
    }),
    [color, intensity]
  );

  return (
    <mesh>
      <sphereGeometry args={[radius * 1.08, 64, 64]} />
      <shaderMaterial
        vertexShader={atmosphereVertexShader}
        fragmentShader={atmosphereFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.BackSide}
      />
    </mesh>
  );
};
