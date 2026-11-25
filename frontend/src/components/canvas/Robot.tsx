import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { useSolarSystemStore } from '../../store/useSolarSystemStore';
import { RobotAnimation } from '../../types/solar-system';

export const RobotModel: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const outerRingRef = useRef<THREE.Mesh>(null);

  // Load rigged humanoid skeleton from Three.js assets
  const { scene, animations } = useGLTF('/models/robot.glb');
  const { actions } = useAnimations(animations, groupRef);

  const robotState = useSolarSystemStore((state) => state.robotState);
  const robotAnimation = useSolarSystemStore((state) => state.robotAnimation);
  const setRobotState = useSolarSystemStore((state) => state.setRobotState);
  const setRobotAnimation = useSolarSystemStore((state) => state.setRobotAnimation);

  // High-Definition, Sharp, Readable Sci-Fi Materials
  const materials = useMemo(() => {
    // 1. Sharp ballistic gunmetal armor (crisp specular definition & clear edge separation)
    const gunmetal = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#384357'),
      metalness: 0.90,
      roughness: 0.20,
      envMapIntensity: 2.5,
    });

    // 2. Matte tactical carbon composite for mechanical under-suit and joint channels
    const carbon = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#141822'),
      metalness: 0.70,
      roughness: 0.48,
      envMapIntensity: 1.2,
    });

    // 3. Polished surgical chrome for hydraulic pistons, mechanical pins, and elbow/knee hinges
    const chrome = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#E8EEF5'),
      metalness: 0.98,
      roughness: 0.12,
      envMapIntensity: 2.5,
    });

    // 4. Razor-sharp glowing amber visor eyes
    const amberEye = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#FFBA38'),
      emissive: new THREE.Color('#FF9500'),
      emissiveIntensity: 6.8,
      toneMapped: false,
    });

    // 5. Embedded orange glowing energy & telemetry light strips
    const orangeStrip = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#FF6600'),
      emissive: new THREE.Color('#FF4400'),
      emissiveIntensity: 5.2,
      toneMapped: false,
    });

    // 6. Brushed golden titanium accents on armor borders
    const goldAccent = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#D4AF37'),
      metalness: 0.95,
      roughness: 0.22,
    });

    return { gunmetal, carbon, chrome, amberEye, orangeStrip, goldAccent };
  }, []);

  // Build and attach the sharp, muscular, anatomically human-like humanoid cyborg body
  useEffect(() => {
    if (!scene) return;

    // 1. Hide all cartoon meshes from the original model
    const cartoonMeshNames = [
      'Head_2', 'Head_3', 'Head_4',
      'Torso_2', 'Torso_3',
      'ShoulderL_1', 'ShoulderR_1',
      'ArmL', 'ArmR',
      'LegL', 'LegR',
      'LowerLegL_1', 'LowerLegR_1',
      'FootL_1', 'FootR_1',
    ];

    scene.traverse((child) => {
      if (cartoonMeshNames.includes(child.name)) {
        child.visible = false;
      }
      // Hide entire lower-body leg & foot skeleton for clean half-body bust
      if (
        child.name.startsWith('UpperLeg') ||
        child.name.startsWith('LowerLeg') ||
        child.name.startsWith('Foot') ||
        child.name.startsWith('Leg')
      ) {
        child.visible = false;
      }
      // Re-skin 5-finger hands with sharp gunmetal/carbon
      if (child.name.includes('Hand') && (child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.material = materials.gunmetal;
        mesh.castShadow = true;
      }
    });

    // Prevent duplicate attachment across re-renders
    if (scene.getObjectByName('HumanoidExoskeleton')) return;
    const tag = new THREE.Object3D();
    tag.name = 'HumanoidExoskeleton';
    scene.add(tag);

    // =========================================================================
    // A. CHISELED ORGANIC HUMANOID HEAD & CYBERNETIC FACE (attached to Head bone)
    // =========================================================================
    const headBone = scene.getObjectByName('Head');
    if (headBone) {
      const headGroup = new THREE.Group();
      headGroup.name = 'CustomHumanoidHead';

      // 1. Organic Human Cranium / Skull Dome (Smooth curved human skull contour)
      const craniumGeo = new THREE.SphereGeometry(0.0125, 24, 24);
      craniumGeo.scale(0.95, 1.05, 1.10);
      const cranium = new THREE.Mesh(craniumGeo, materials.gunmetal);
      cranium.position.set(0, 0.003, -0.001);
      cranium.castShadow = true;
      headGroup.add(cranium);

      // Aerodynamic Dorsal Fin / Tactical Mohawk Crest
      const crest = new THREE.Mesh(new THREE.BoxGeometry(0.0035, 0.005, 0.024), materials.carbon);
      crest.position.set(0, 0.016, -0.001);
      headGroup.add(crest);

      // 2. Supraorbital Brow Ridge (sharp human forehead overhang)
      const brow = new THREE.Mesh(new THREE.CapsuleGeometry(0.0024, 0.016, 4, 12), materials.gunmetal);
      brow.rotation.z = Math.PI / 2;
      brow.position.set(0, 0.0075, 0.0112);
      headGroup.add(brow);

      // 3. Humanoid Eyes: Sharp Recessed Almond-Shaped Amber Eyes with Bright Iris Core
      const eyeL = new THREE.Mesh(new THREE.CapsuleGeometry(0.0011, 0.0036, 4, 8), materials.amberEye);
      eyeL.rotation.z = Math.PI / 2 - 0.16;
      eyeL.position.set(-0.0046, 0.0042, 0.0124);
      headGroup.add(eyeL);

      const eyeR = new THREE.Mesh(new THREE.CapsuleGeometry(0.0011, 0.0036, 4, 8), materials.amberEye);
      eyeR.rotation.z = Math.PI / 2 + 0.16;
      eyeR.position.set(0.0046, 0.0042, 0.0124);
      headGroup.add(eyeR);

      // Forward Eye Beam Spotlight
      const eyeLight = new THREE.PointLight('#FFA500', 8, 5, 2);
      eyeLight.position.set(0, 0.004, 0.016);
      headGroup.add(eyeLight);

      // 4. Sculpted Human Neck (Sternocleidomastoid tendons + cervical column)
      const neckCore = new THREE.Mesh(new THREE.CylinderGeometry(0.0042, 0.0048, 0.011, 12), materials.carbon);
      neckCore.position.set(0, -0.014, -0.001);
      headGroup.add(neckCore);

      const neckTendonL = new THREE.Mesh(new THREE.CapsuleGeometry(0.0014, 0.008, 4, 8), materials.gunmetal);
      neckTendonL.position.set(-0.0028, -0.013, 0.0025);
      neckTendonL.rotation.set(0.22, 0, -0.2);
      headGroup.add(neckTendonL);

      const neckTendonR = new THREE.Mesh(new THREE.CapsuleGeometry(0.0014, 0.008, 4, 8), materials.gunmetal);
      neckTendonR.position.set(0.0028, -0.013, 0.0025);
      neckTendonR.rotation.set(0.22, 0, 0.2);
      headGroup.add(neckTendonR);

      // 5. Sharp Humanoid Nose Bridge & Zygomatic Cheekbones
      const noseBridge = new THREE.Mesh(new THREE.ConeGeometry(0.0018, 0.0072, 4), materials.gunmetal);
      noseBridge.rotation.x = 0.24;
      noseBridge.position.set(0, 0.0012, 0.0128);
      headGroup.add(noseBridge);

      // Zygomatic Cheekbones (sculpted human facial planes)
      const cheekGeo = new THREE.CapsuleGeometry(0.0022, 0.008, 4, 8);
      const cheekL = new THREE.Mesh(cheekGeo, materials.gunmetal);
      cheekL.position.set(-0.009, -0.0015, 0.007);
      cheekL.rotation.set(0.3, 0.35, -0.4);
      headGroup.add(cheekL);

      const cheekR = new THREE.Mesh(cheekGeo, materials.gunmetal);
      cheekR.position.set(0.009, -0.0015, 0.007);
      cheekR.rotation.set(0.3, -0.35, 0.4);
      headGroup.add(cheekR);

      // 5. Human-like Cybernetic Mandible / Chiseled Jawline & Chin
      const jawL = new THREE.Mesh(new THREE.CapsuleGeometry(0.002, 0.009, 4, 8), materials.gunmetal);
      jawL.position.set(-0.0055, -0.008, 0.006);
      jawL.rotation.set(-0.4, 0.4, -0.5);
      headGroup.add(jawL);

      const jawR = new THREE.Mesh(new THREE.CapsuleGeometry(0.002, 0.009, 4, 8), materials.gunmetal);
      jawR.position.set(0.0055, -0.008, 0.006);
      jawR.rotation.set(-0.4, -0.4, 0.5);
      headGroup.add(jawR);

      // Anatomical Chin Cleft & Rebreather Guard
      const chin = new THREE.Mesh(new THREE.SphereGeometry(0.0035, 12, 12), materials.carbon);
      chin.position.set(0, -0.0105, 0.010);
      headGroup.add(chin);

      // Orange Indicator Vent Slit
      const ventStrip = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.001, 0.001), materials.orangeStrip);
      ventStrip.position.set(0, -0.0085, 0.0135);
      headGroup.add(ventStrip);

      // 6. Lateral Auditory & Sensor Pods (Human ear position)
      const earPodL = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.004, 8), materials.carbon);
      earPodL.rotation.z = Math.PI / 2;
      earPodL.position.set(-0.0125, 0.002, 0);
      headGroup.add(earPodL);

      const earStripL = new THREE.Mesh(new THREE.BoxGeometry(0.001, 0.004, 0.001), materials.orangeStrip);
      earStripL.position.set(-0.0146, 0.002, 0);
      headGroup.add(earStripL);

      const earPodR = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.004, 8), materials.carbon);
      earPodR.rotation.z = Math.PI / 2;
      earPodR.position.set(0.0125, 0.002, 0);
      headGroup.add(earPodR);

      const earStripR = new THREE.Mesh(new THREE.BoxGeometry(0.001, 0.004, 0.001), materials.orangeStrip);
      earStripR.position.set(0.0146, 0.002, 0);
      headGroup.add(earStripR);

      headBone.add(headGroup);
    }

    // =========================================================================
    // B. ATHLETIC V-TAPER TORSO & MUSCULAR CHEST (attached to Torso_1 bone)
    // =========================================================================
    const torsoBone = scene.getObjectByName('Torso_1');
    if (torsoBone) {
      const torsoGroup = new THREE.Group();
      torsoGroup.name = 'CustomHumanoidTorso';

      // 1. Trapezius & Clavicles (Human neck-to-shoulder taper + collarbones)
      const trapL = new THREE.Mesh(new THREE.CapsuleGeometry(0.0024, 0.008, 4, 8), materials.gunmetal);
      trapL.rotation.set(0.1, 0, -0.55);
      trapL.position.set(-0.0052, 0.0088, 0.0005);
      torsoGroup.add(trapL);

      const trapR = new THREE.Mesh(new THREE.CapsuleGeometry(0.0024, 0.008, 4, 8), materials.gunmetal);
      trapR.rotation.set(0.1, 0, 0.55);
      trapR.position.set(0.0052, 0.0088, 0.0005);
      torsoGroup.add(trapR);

      const clavicleL = new THREE.Mesh(new THREE.CapsuleGeometry(0.0012, 0.008, 4, 8), materials.gunmetal);
      clavicleL.rotation.set(0, 0.15, -0.15);
      clavicleL.position.set(-0.005, 0.007, 0.004);
      torsoGroup.add(clavicleL);

      const clavicleR = new THREE.Mesh(new THREE.CapsuleGeometry(0.0012, 0.008, 4, 8), materials.gunmetal);
      clavicleR.rotation.set(0, -0.15, 0.15);
      clavicleR.position.set(0.005, 0.007, 0.004);
      torsoGroup.add(clavicleR);

      // 2. Muscular Curved Pectorals (Contoured left & right pectoralis major)
      const pecGeoL = new THREE.SphereGeometry(0.0058, 16, 16);
      pecGeoL.scale(1.15, 0.85, 0.52);
      const pecL = new THREE.Mesh(pecGeoL, materials.gunmetal);
      pecL.position.set(-0.0045, 0.0018, 0.0075);
      pecL.rotation.set(0.12, 0.18, -0.06);
      pecL.castShadow = true;
      torsoGroup.add(pecL);

      const pecGeoR = new THREE.SphereGeometry(0.0058, 16, 16);
      pecGeoR.scale(1.15, 0.85, 0.52);
      const pecR = new THREE.Mesh(pecGeoR, materials.gunmetal);
      pecR.position.set(0.0045, 0.0018, 0.0075);
      pecR.rotation.set(0.12, -0.18, 0.06);
      pecR.castShadow = true;
      torsoGroup.add(pecR);

      // 3. Central Sternal Arc Reactor Core
      const coreRing = new THREE.Mesh(new THREE.CylinderGeometry(0.0024, 0.0024, 0.002, 6), materials.carbon);
      coreRing.rotation.x = Math.PI / 2;
      coreRing.position.set(0, 0.002, 0.0086);
      torsoGroup.add(coreRing);

      const coreCrystal = new THREE.Mesh(new THREE.CylinderGeometry(0.0016, 0.0016, 0.0024, 16), materials.amberEye);
      coreCrystal.rotation.x = Math.PI / 2;
      coreCrystal.position.set(0, 0.002, 0.009);
      torsoGroup.add(coreCrystal);

      const coreLight = new THREE.PointLight('#FF8C00', 6, 3, 2);
      coreLight.position.set(0, 0.002, 0.012);
      torsoGroup.add(coreLight);

      // 4. Serratus & Rib Armor Plates with Glowing Status Lines
      const ribL = new THREE.Mesh(new THREE.CapsuleGeometry(0.0009, 0.006, 4, 8), materials.orangeStrip);
      ribL.rotation.z = Math.PI / 2;
      ribL.position.set(-0.005, -0.0028, 0.0078);
      torsoGroup.add(ribL);

      const ribR = new THREE.Mesh(new THREE.CapsuleGeometry(0.0009, 0.006, 4, 8), materials.orangeStrip);
      ribR.rotation.z = Math.PI / 2;
      ribR.position.set(0.005, -0.0028, 0.0078);
      torsoGroup.add(ribR);

      // 5. Latissimus Dorsi & Flank Armor (Athletic V-Taper)
      const latGeo = new THREE.CapsuleGeometry(0.0035, 0.010, 8, 12);
      const latL = new THREE.Mesh(latGeo, materials.gunmetal);
      latL.position.set(-0.0085, 0.001, 0.001);
      latL.rotation.z = -0.18;
      torsoGroup.add(latL);

      const latR = new THREE.Mesh(latGeo, materials.gunmetal);
      latR.position.set(0.0085, 0.001, 0.001);
      latR.rotation.z = 0.18;
      torsoGroup.add(latR);

      // 6. Articulated Spinal Column (Back)
      for (let i = 0; i < 4; i++) {
        const vertebra = new THREE.Mesh(new THREE.BoxGeometry(0.0045, 0.0018, 0.003), materials.chrome);
        vertebra.position.set(0, 0.005 - i * 0.0028, -0.0075);
        torsoGroup.add(vertebra);
      }

      torsoBone.add(torsoGroup);
    }

    // =========================================================================
    // C. ARTICULATED ABDOMINALS (attached to Abdomen bone)
    // =========================================================================
    const abBone = scene.getObjectByName('Abdomen');
    if (abBone) {
      const abGroup = new THREE.Group();
      abGroup.name = 'CustomHumanoidAbdomen';

      // Anatomical 6-Pack Segmented Rounded Muscle Pads
      for (let row = 0; row < 3; row++) {
        const yPos = 0.0025 - row * 0.0028;
        const padGeo = new THREE.CapsuleGeometry(0.0016, 0.0032, 4, 8);
        padGeo.scale(1.1, 0.7, 0.5);

        const abL = new THREE.Mesh(padGeo, materials.gunmetal);
        abL.rotation.z = Math.PI / 2;
        abL.position.set(-0.0026, yPos, 0.0068);
        abGroup.add(abL);

        const abR = new THREE.Mesh(padGeo, materials.gunmetal);
        abR.rotation.z = Math.PI / 2;
        abR.position.set(0.0026, yPos, 0.0068);
        abGroup.add(abR);
      }

      // Central Vertical Linea Alba Orange Power Channel
      const abStrip = new THREE.Mesh(new THREE.CapsuleGeometry(0.0006, 0.008, 4, 8), materials.orangeStrip);
      abStrip.position.set(0, -0.0005, 0.0075);
      abGroup.add(abStrip);

      // Half-Body Waist Stabilizer Collar & Anti-Gravity Thruster Core
      const waistCollar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.0072, 0.0046, 0.004, 16),
        materials.carbon
      );
      waistCollar.position.set(0, -0.0068, 0.001);
      abGroup.add(waistCollar);

      const waistTrim = new THREE.Mesh(
        new THREE.TorusGeometry(0.0068, 0.0007, 8, 24),
        materials.goldAccent
      );
      waistTrim.rotation.x = Math.PI / 2;
      waistTrim.position.set(0, -0.0052, 0.001);
      abGroup.add(waistTrim);

      const thrusterCore = new THREE.Mesh(
        new THREE.CylinderGeometry(0.0038, 0.0022, 0.0016, 16),
        materials.orangeStrip
      );
      thrusterCore.position.set(0, -0.0092, 0.001);
      abGroup.add(thrusterCore);

      abBone.add(abGroup);
    }

    // =========================================================================
    // D. BROAD DELTOID PAULDRONS & ARMS (attached to Shoulder & Arm bones)
    // =========================================================================
    const shoulderL = scene.getObjectByName('ShoulderL');
    if (shoulderL) {
      const pL = new THREE.Group();
      pL.name = 'CustomShoulderL';
      // Muscular 3-faceted rounded deltoid cap
      const deltGeo = new THREE.CapsuleGeometry(0.0048, 0.006, 8, 16);
      deltGeo.scale(1.1, 1.0, 1.0);
      const delt = new THREE.Mesh(deltGeo, materials.gunmetal);
      delt.position.set(0.0045, 0.0025, 0);
      delt.rotation.z = -0.22;
      delt.castShadow = true;
      pL.add(delt);

      // Orange Power Conduit
      const strip = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.001, 0.009), materials.orangeStrip);
      strip.position.set(0.0045, 0.0065, 0);
      strip.rotation.z = -0.22;
      pL.add(strip);

      shoulderL.add(pL);
    }

    const shoulderR = scene.getObjectByName('ShoulderR');
    if (shoulderR) {
      const pR = new THREE.Group();
      pR.name = 'CustomShoulderR';
      const deltGeo = new THREE.CapsuleGeometry(0.0048, 0.006, 8, 16);
      deltGeo.scale(1.1, 1.0, 1.0);
      const delt = new THREE.Mesh(deltGeo, materials.gunmetal);
      delt.position.set(-0.0045, 0.0025, 0);
      delt.rotation.z = 0.22;
      delt.castShadow = true;
      pR.add(delt);

      const strip = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.001, 0.009), materials.orangeStrip);
      strip.position.set(-0.0045, 0.0065, 0);
      strip.rotation.z = 0.22;
      pR.add(strip);

      shoulderR.add(pR);
    }

    // Upper Arm Biceps/Triceps & Elbows
    const upperArmL = scene.getObjectByName('UpperArmL');
    if (upperArmL) {
      // Anatomical Bicep Muscle Belly
      const bicepL = new THREE.Mesh(new THREE.CapsuleGeometry(0.0028, 0.008, 8, 16), materials.gunmetal);
      bicepL.position.set(0.001, 0.004, 0.001);
      upperArmL.add(bicepL);
    }

    const upperArmR = scene.getObjectByName('UpperArmR');
    if (upperArmR) {
      const bicepR = new THREE.Mesh(new THREE.CapsuleGeometry(0.0028, 0.008, 8, 16), materials.gunmetal);
      bicepR.position.set(-0.001, 0.004, 0.001);
      upperArmR.add(bicepR);
    }

    // Forearm Vambraces & Gauntlets (Tapered to human wrist)
    const lowerArmL = scene.getObjectByName('LowerArmL');
    if (lowerArmL) {
      const vambraceL = new THREE.Group();
      const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.0034, 0.0024, 0.010, 12), materials.gunmetal);
      plate.position.set(0.001, 0.005, 0);
      vambraceL.add(plate);

      const strip = new THREE.Mesh(new THREE.BoxGeometry(0.001, 0.008, 0.0038), materials.orangeStrip);
      strip.position.set(0.0024, 0.005, 0);
      vambraceL.add(strip);

      lowerArmL.add(vambraceL);
    }

    const lowerArmR = scene.getObjectByName('LowerArmR');
    if (lowerArmR) {
      const vambraceR = new THREE.Group();
      const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.0034, 0.0024, 0.010, 12), materials.gunmetal);
      plate.position.set(-0.001, 0.005, 0);
      vambraceR.add(plate);

      const strip = new THREE.Mesh(new THREE.BoxGeometry(0.001, 0.008, 0.0038), materials.orangeStrip);
      strip.position.set(-0.0024, 0.005, 0);
      vambraceR.add(strip);

      lowerArmR.add(vambraceR);
    }
  }, [scene, materials]);

  // Subtle breathing pulse of amber eyes and orange energy telemetry
  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();
    const eyePulse = 5.5 + Math.sin(elapsed * 2.5) * 1.5;
    materials.amberEye.emissiveIntensity = eyePulse;

    const stripPulse = 4.5 + Math.sin(elapsed * 3.5) * 1.0;
    materials.orangeStrip.emissiveIntensity = stripPulse;

    if (ringRef.current) {
      ringRef.current.rotation.z += 0.008;
    }
    if (outerRingRef.current) {
      outerRingRef.current.rotation.z -= 0.005;
    }
  });

  // Active animation switcher
  useEffect(() => {
    if (!actions) return;

    const targetAnim = actions[robotAnimation] ? robotAnimation : 'Idle';
    const action = actions[targetAnim];

    if (action) {
      action.reset().fadeIn(0.3).play();

      if (['Wave', 'ThumbsUp', 'Yes', 'Punch', 'Jump'].includes(targetAnim)) {
        action.setLoop(THREE.LoopOnce, 1);
        action.clampWhenFinished = true;
        const mixer = action.getMixer();
        const onFinished = () => {
          action.fadeOut(0.3);
          actions['Idle']?.reset().fadeIn(0.3).play();
          setRobotAnimation('Idle');
        };
        mixer.addEventListener('finished', onFinished);
        return () => {
          mixer.removeEventListener('finished', onFinished);
        };
      }
    }

    return () => {
      action?.fadeOut(0.3);
    };
  }, [actions, robotAnimation, setRobotAnimation]);

  // Coordinate GSAP Walking Transition between Center and Right side
  useEffect(() => {
    if (!groupRef.current) return;

    if (robotState === 'walking_to_right') {
      setRobotAnimation('Walking');

      gsap.to(groupRef.current.rotation, {
        y: 0.55,
        duration: 0.35,
        ease: 'power1.out',
      });

      gsap.to(groupRef.current.position, {
        x: 5.5,
        z: 7.6,
        duration: 1.8,
        ease: 'power2.inOut',
        onComplete: () => {
          if (groupRef.current) {
            gsap.to(groupRef.current.rotation, {
              y: -0.28,
              duration: 0.45,
              ease: 'power1.out',
            });
          }
          setRobotState('right');
          setRobotAnimation('Idle');
        },
      });
    } else if (robotState === 'walking_to_center') {
      setRobotAnimation('Walking');

      gsap.to(groupRef.current.rotation, {
        y: -0.6,
        duration: 0.35,
        ease: 'power1.out',
      });

      gsap.to(groupRef.current.position, {
        x: 0,
        z: 7.6,
        duration: 1.8,
        ease: 'power2.inOut',
        onComplete: () => {
          if (groupRef.current) {
            gsap.to(groupRef.current.rotation, {
              y: 0,
              duration: 0.45,
              ease: 'power1.out',
            });
          }
          setRobotState('center');
          setRobotAnimation('Idle');
        },
      });
    }
  }, [robotState, setRobotAnimation, setRobotState]);

  const handleRobotClick = () => {
    const greetings: RobotAnimation[] = ['Wave', 'ThumbsUp', 'Dance'];
    const chosen = greetings[Math.floor(Math.random() * greetings.length)];
    setRobotAnimation(chosen);
  };

  return (
    <group ref={groupRef} position={[0, -2.8, 7.6]} scale={1.45} onClick={handleRobotClick}>
      {/* Humanoid Robot Rigged Armature with Anatomical Sci-Fi Exoskeleton */}
      <primitive object={scene} />

      {/* Holographic sci-fi pedestal platform right beneath the half-body waist */}
      <mesh ref={ringRef} position={[0, 1.55, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.95, 1.12, 64]} />
        <meshBasicMaterial
          color="#F59E0B"
          transparent
          opacity={0.65}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Outer concentric rotating telemetry ring */}
      <mesh ref={outerRingRef} position={[0, 1.545, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.18, 1.25, 48]} />
        <meshBasicMaterial
          color="#EA580C"
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Inner glowing energetic floor core */}
      <mesh position={[0, 1.54, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.90, 32]} />
        <meshBasicMaterial
          color="#B45309"
          transparent
          opacity={0.18}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Dedicated Crisp Key Light (Front-Right, sharp specular definition on gunmetal plates) */}
      <directionalLight
        position={[2.5, 4.0, 3.5]}
        color="#FFFFFF"
        intensity={2.2}
      />

      {/* Razor-sharp Golden Rim Light (Behind-Right, outlines muscular silhouette against dark space) */}
      <directionalLight
        position={[-3.0, 3.5, -2.0]}
        color="#F59E0B"
        intensity={3.8}
      />

      {/* Cool Secondary Fill Light for Joint Depth */}
      <pointLight
        position={[-1.5, 1.8, 3.0]}
        color="#93C5FD"
        intensity={45}
        distance={14}
        decay={2}
      />

      {/* Top Down-Light carving shoulder/trapezius contours */}
      <pointLight
        position={[0, 4.8, 0.5]}
        color="#FFD480"
        intensity={60}
        distance={12}
        decay={2}
      />
    </group>
  );
};

// Holographic loading placeholder for Suspense
export const RobotPlaceholder: React.FC = () => {
  return (
    <group position={[0, -2.8, 7.6]} scale={1.45}>
      <mesh position={[0, 2.5, 0]}>
        <capsuleGeometry args={[0.45, 1.0, 8, 16]} />
        <meshBasicMaterial color="#F59E0B" wireframe transparent opacity={0.3} />
      </mesh>
    </group>
  );
};

export const Robot: React.FC = () => {
  return (
    <React.Suspense fallback={<RobotPlaceholder />}>
      <RobotModel />
    </React.Suspense>
  );
};
