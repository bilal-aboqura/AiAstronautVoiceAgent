import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { SUN_CONFIG } from '../../data/planets';
import { useSolarSystemStore } from '../../store/useSolarSystemStore';

// Vertex shader with accurate world/view space position & normals
const sunVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vWorldNormal;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vPosition = mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

// Fragment shader: Authentic NASA Solar Dynamics Observatory (SDO 304Å / 171Å) scientific visualization
// Features: Active magnetic faculae plages, turbulent convection granules, dark sunspot umbras/penumbras,
// differential rotation, and empirical Eddington limb darkening.
const sunFragmentShader = `
  uniform sampler2D uTexture;
  uniform float uTime;
  uniform float uHasTexture;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vWorldNormal;

  // Optimized Simplex Noise for living solar plasma
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i);
    vec4 p = permute(permute(permute(
               i.z + vec4(0.0, i1.z, i2.z, 1.0))
             + i.y + vec4(0.0, i1.y, i2.y, 1.0))
             + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }

  void main() {
    vec3 viewDir = normalize(-vPosition);
    float mu = clamp(dot(vNormal, viewDir), 0.0, 1.0);

    // NASA empirical solar limb-darkening profile: I(mu) = 1.0 - u1*(1-mu) - u2*(1-mu)^2
    float oneMinusMu = 1.0 - mu;
    float limb = 1.0 - 0.58 * oneMinusMu - 0.24 * oneMinusMu * oneMinusMu;

    // Differential solar rotation: equator spins faster than poles (~25 days vs ~35 days)
    float lat = (vUv.y - 0.5) * 3.14159265;
    float diffSpeed = (0.006 - 0.0028 * sin(lat) * sin(lat)) * uTime;
    vec2 rotatedUv = vec2(fract(vUv.x + diffSpeed), vUv.y);

    // 1. Sample authentic NASA SDO high-resolution surface texture
    vec3 nasaTex = vec3(0.95, 0.45, 0.08);
    if (uHasTexture > 0.5) {
      nasaTex = texture2D(uTexture, rotatedUv).rgb;
    }

    // 2. Preserve NASA SDO fiery plasma contrast: dark convection lanes -> deep orange -> incandescent white-gold active regions
    float luma = dot(nasaTex, vec3(0.299, 0.587, 0.114));
    vec3 contrastedTex = pow(max(nasaTex, vec3(0.0)), vec3(1.28)) * 1.35;

    // 3. 3D Domain-Warped Solar Convection Boiling Cells (Granules) & Dark Sunspot Filaments
    vec3 posNorm = normalize(vWorldNormal);
    float t = uTime * 0.06;
    vec3 warp = vec3(
      snoise(posNorm * 6.0 + vec3(t, 0.0, 0.0)),
      snoise(posNorm * 6.0 + vec3(0.0, t, 0.0)),
      snoise(posNorm * 6.0 + vec3(0.0, 0.0, t))
    );

    float granules = snoise(posNorm * 28.0 + warp * 1.4);
    float fineGranules = snoise(posNorm * 56.0 - warp * 0.9);
    float cellShade = smoothstep(-0.4, 0.55, granules) * 0.18 + fineGranules * 0.06 - 0.08;

    // Subtle dark magnetic filaments & sunspot pores
    float filament = abs(snoise(posNorm * 11.0 + warp * 0.7));
    float filamentMask = smoothstep(0.0, 0.10, filament);

    vec3 solarSurface = contrastedTex * (0.85 + 0.15 * filamentMask) + cellShade * vec3(1.0, 0.55, 0.12);

    // Boost incandescent white-yellow highlights in active plage regions
    float hotMask = smoothstep(0.55, 0.92, luma);
    solarSurface = mix(solarSurface, vec3(1.15, 0.95, 0.65), hotMask * 0.45);

    // 4. Empirical limb darkening + fiery orange-red chromospheric rim
    vec3 limbRed = vec3(0.95, 0.24, 0.02);
    vec3 finalSolarSurface = mix(limbRed * (0.65 + 0.35 * luma), solarSurface, pow(mu, 0.48));

    gl_FragColor = vec4(finalSolarSurface * (0.35 + 0.65 * limb), 1.0);
  }
`;

// Coronal rim glow shader (BackSide): smoothly fades to 0.0 at outer edge — no hard circular ring
const coronaVertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vPosition = mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const coronaFragmentShader = `
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    vec3 viewDir = normalize(-vPosition);
    // On BackSide, -dot(vNormal, viewDir) is 0.0 at the outer boundary and rises smoothly inward
    float rim = clamp(-dot(vNormal, viewDir), 0.0, 1.0);

    // Magnetic coronal prominence arcs along the limb
    float angle = atan(vPosition.y, vPosition.x);
    float loop1 = sin(angle * 10.0 + uTime * 0.35) * cos(angle * 5.0 - uTime * 0.2);
    float loop2 = sin(angle * 22.0 - uTime * 0.6) * cos(angle * 11.0 + uTime * 0.3);
    float prominences = smoothstep(0.15, 0.85, loop1 * 0.6 + loop2 * 0.4 + 0.3);

    float intensity = pow(rim, 3.2) * (0.55 + prominences * 0.35);

    vec3 innerChromosphere = vec3(1.00, 0.62, 0.14);
    vec3 outerFlare        = vec3(0.95, 0.25, 0.02);
    vec3 corona = mix(outerFlare, innerChromosphere, rim);

    gl_FragColor = vec4(corona * intensity, intensity);
  }
`;

// Outer magnetic coronal streamer aura (BackSide): fades seamlessly into deep space
const outerHaloFragmentShader = `
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    vec3 viewDir = normalize(-vPosition);
    float rim = clamp(-dot(vNormal, viewDir), 0.0, 1.0);

    // Subtle solar wind ray streamers
    float angle = atan(vPosition.y, vPosition.x);
    float streamerPattern = sin(angle * 14.0 + uTime * 0.08) * 0.5 + 0.5;
    streamerPattern += sin(angle * 7.0 - uTime * 0.05) * 0.3;

    float intensity = pow(rim, 4.0) * (0.28 + streamerPattern * 0.14);
    vec3 haloColor = vec3(0.98, 0.38, 0.05);

    gl_FragColor = vec4(haloColor * intensity, intensity);
  }
`;

export const Sun: React.FC = () => {
  const sunMeshRef = useRef<THREE.Mesh>(null);
  const [sunTexture, setSunTexture] = useState<THREE.Texture | null>(null);

  const selectPlanet = useSolarSystemStore((state) => state.selectPlanet);
  const hoverPlanet = useSolarSystemStore((state) => state.hoverPlanet);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load('/textures/planets/sun.jpg', (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 16;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = true;
      setSunTexture(tex);
    });
  }, []);

  const sunUniforms = useMemo(
    () => ({
      uTexture: { value: null as THREE.Texture | null },
      uTime: { value: 0 },
      uHasTexture: { value: 0.0 },
    }),
    []
  );

  const coronaUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
    }),
    []
  );

  const outerHaloUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
    }),
    []
  );

  useEffect(() => {
    if (sunTexture) {
      sunUniforms.uTexture.value = sunTexture;
      sunUniforms.uHasTexture.value = 1.0;
    }
  }, [sunTexture, sunUniforms]);

  useFrame((state, delta) => {
    const elapsed = state.clock.getElapsedTime();
    sunUniforms.uTime.value = elapsed;
    coronaUniforms.uTime.value = elapsed;
    outerHaloUniforms.uTime.value = elapsed;

    if (sunMeshRef.current) {
      sunMeshRef.current.rotation.y += SUN_CONFIG.rotationSpeed * delta * 60;
    }
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    selectPlanet('sun');
  };

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    hoverPlanet('sun');
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    hoverPlanet(null);
    document.body.style.cursor = 'auto';
  };

  return (
    <group position={[0, 0, 0]}>
      {/* High-Definition Photospheric Sun Surface: NASA SDO 304Å False-Color, Convective Granules & Limb Darkening */}
      <mesh
        ref={sunMeshRef}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <sphereGeometry args={[SUN_CONFIG.radius, 64, 64]} />
        <shaderMaterial
          vertexShader={sunVertexShader}
          fragmentShader={sunFragmentShader}
          uniforms={sunUniforms}
        />
      </mesh>

      {/* Coronal Flare Halo (BackSide for seamless outer fade) */}
      <mesh>
        <sphereGeometry args={[SUN_CONFIG.radius * 1.12, 64, 64]} />
        <shaderMaterial
          vertexShader={coronaVertexShader}
          fragmentShader={coronaFragmentShader}
          uniforms={coronaUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Outer Magnetic Streamer Aura (BackSide for seamless outer fade) */}
      <mesh>
        <sphereGeometry args={[SUN_CONFIG.radius * 1.32, 64, 64]} />
        <shaderMaterial
          vertexShader={coronaVertexShader}
          fragmentShader={outerHaloFragmentShader}
          uniforms={outerHaloUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Primary solar point light — gentle directional highlight without blowing out sunlit textures */}
      <pointLight
        color="#FFF6E8"
        intensity={1.6}
        distance={900}
        decay={0}
      />

      {/* Warm secondary solar glow fill */}
      <pointLight
        color="#F59E0B"
        intensity={0.35}
        distance={400}
        decay={0}
      />
    </group>
  );
};
