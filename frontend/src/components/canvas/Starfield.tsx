import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

const nebulaVertexShader = `
  varying vec3 vWorldPosition;

  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const nebulaFragmentShader = `
  uniform float uTime;
  varying vec3 vWorldPosition;

  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  float noise(vec3 x) {
    vec3 p = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);

    return mix(
      mix(mix(hash(p + vec3(0,0,0)), hash(p + vec3(1,0,0)), f.x),
          mix(hash(p + vec3(0,1,0)), hash(p + vec3(1,1,0)), f.x), f.y),
      mix(mix(hash(p + vec3(0,0,1)), hash(p + vec3(1,0,1)), f.x),
          mix(hash(p + vec3(0,1,1)), hash(p + vec3(1,1,1)), f.x), f.y), f.z
    );
  }

  float fbm(vec3 p) {
    float v = 0.0;
    float a = 0.5;
    vec3 shift = vec3(100.0);
    for (int i = 0; i < 4; ++i) {
      v += a * noise(p);
      p = p * 2.0 + shift;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec3 dir = normalize(vWorldPosition);

    // Galactic horizon band
    float galacticPlane = smoothstep(0.65, 0.0, abs(dir.y));

    // Multi-layered cosmic nebula gas
    vec3 p = dir * 2.6 + vec3(uTime * 0.008, 0.0, uTime * 0.006);
    float n1 = fbm(p);
    float n2 = fbm(p * 1.7 + vec3(3.2, 1.5, 4.8));

    // Luminous cosmic palette (illuminates space so it is never completely dark)
    vec3 baseCosmicGlow = vec3(0.015, 0.015, 0.015);  // neutral dark glow
    vec3 cyanNebula      = vec3(0.0, 0.0, 0.0);     // no cyan
    // keep violetNebula for magenta hue
    vec3 violetNebula    = vec3(0.22, 0.10, 0.38);
    vec3 warmStardust    = vec3(0.24, 0.16, 0.08);

    // Blend nebulae structures
    vec3 nebulaColor = mix(cyanNebula, violetNebula, n1);
    nebulaColor = mix(nebulaColor, warmStardust, n2 * galacticPlane * 0.7);

    float nebulaIntensity = smoothstep(0.32, 0.82, n1 + n2 * 0.45);
    vec3 finalSpace = baseCosmicGlow + nebulaColor * (nebulaIntensity * 0.85 + galacticPlane * 0.35);

    gl_FragColor = vec4(finalSpace, 1.0);
  }
`;

export const Starfield: React.FC = () => {
  const nebulaMaterialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
    }),
    []
  );

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();
    uniforms.uTime.value = elapsed;
  });

  return (
    <group>
      {/* 1. Luminous Deep Space Cosmic Nebula Sky Dome (eliminates fully dark void) */}
      <mesh>
        <sphereGeometry args={[380, 48, 48]} />
        <shaderMaterial
          ref={nebulaMaterialRef}
          vertexShader={nebulaVertexShader}
          fragmentShader={nebulaFragmentShader}
          uniforms={uniforms}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* 2. Deep Colorful Astronomical Stars */}
      <Stars
        radius={300}
        depth={80}
        count={8500}
        factor={6.5}
        saturation={0.8}
        fade
        speed={0.4}
      />

      {/* 3. Mid-range Brilliant Twinkling Stellar Cluster */}
      <Stars
        radius={150}
        depth={50}
        count={2500}
        factor={5.0}
        saturation={0.9}
        fade
        speed={0.6}
      />

      <Sparkles
        count={160}
        scale={90}
        size={3.2}
        speed={0.25}
        opacity={0.55}
        color="#FDE68A"
      />
    </group>
  );
};
