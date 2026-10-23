import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface GlassesModelProps {
  scrollProgress: number;
}

/**
 * A procedural pair of eyeglasses built from Three.js primitives — torus lens
 * frames, transparent lens glass, a curved bridge, and temple arms. Designed to
 * evoke the NOOR OPTICAL brand: dark metal frames with champagne-tinted lenses.
 *
 * The model "enters" the scene on mount (scale-up + settle) then reacts to scroll
 * progress: rotating, lifting, and tilting as the user scrolls through the hero.
 */
export const GlassesModel = ({ scrollProgress }: GlassesModelProps) => {
  const group = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);

  // --- Geometry (memoised so it isn't rebuilt every frame) ---

  const lensFrameGeo = useMemo(() => {
    const geo = new THREE.TorusGeometry(0.62, 0.035, 16, 64);
    geo.scale(1, 0.86, 1); // oval
    return geo;
  }, []);

  const lensGlassGeo = useMemo(() => {
    const geo = new THREE.CircleGeometry(0.6, 64);
    geo.scale(1, 0.86, 1);
    return geo;
  }, []);

  const bridgeGeo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.14, 0, 0),
      new THREE.Vector3(-0.05, -0.035, 0),
      new THREE.Vector3(0, -0.055, 0),
      new THREE.Vector3(0.05, -0.035, 0),
      new THREE.Vector3(0.14, 0, 0),
    ]);
    return new THREE.TubeGeometry(curve, 32, 0.028, 8, false);
  }, []);

  const templeGeo = useMemo((side: 1 | -1 = 1) => {
    const s = side;
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(s * 1.12, 0, 0),
      new THREE.Vector3(s * 1.32, 0, 0.08),
      new THREE.Vector3(s * 1.52, -0.04, 0.28),
      new THREE.Vector3(s * 1.68, -0.09, 0.55),
      new THREE.Vector3(s * 1.74, -0.14, 0.85),
    ]);
    return new THREE.TubeGeometry(curve, 32, 0.026, 8, false);
  }, []);

  const templeLeftGeo = useMemo(
    () =>
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3([
          new THREE.Vector3(-1.12, 0, 0),
          new THREE.Vector3(-1.32, 0, 0.08),
          new THREE.Vector3(-1.52, -0.04, 0.28),
          new THREE.Vector3(-1.68, -0.09, 0.55),
          new THREE.Vector3(-1.74, -0.14, 0.85),
        ]),
        32,
        0.026,
        8,
        false,
      ),
    [],
  );

  const templeRightGeo = useMemo(
    () =>
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3([
          new THREE.Vector3(1.12, 0, 0),
          new THREE.Vector3(1.32, 0, 0.08),
          new THREE.Vector3(1.52, -0.04, 0.28),
          new THREE.Vector3(1.68, -0.09, 0.55),
          new THREE.Vector3(1.74, -0.14, 0.85),
        ]),
        32,
        0.026,
        8,
        false,
      ),
    [],
  );

  // suppress unused warning from the generic memo above
  void templeGeo;

  // --- Materials ---

  const frameMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#4a3d2e',
        metalness: 0.9,
        roughness: 0.15,
      }),
    [],
  );

  const lensMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#c5a77f',
        transparent: true,
        opacity: 0.22,
        roughness: 0.05,
        metalness: 0.2,
        transmission: 0.75,
        thickness: 0.4,
        ior: 1.5,
        side: THREE.DoubleSide,
      }),
    [],
  );

  // --- Animation ---

  useFrame((state) => {
    if (!group.current || !inner.current) return;
    const t = state.clock.getElapsedTime();

    // Entrance: scale up with cubic ease over ~2.2s
    const entrance = Math.min(1, t / 2.2);
    const ease = 1 - Math.pow(1 - entrance, 3);

    // Subtle idle rotation
    const idleY = Math.sin(t * 0.25) * 0.18;
    const idleX = Math.sin(t * 0.18) * 0.06;

    // Scroll-driven rotation: glasses turn to face the transition
    const scrollY = scrollProgress * Math.PI * 0.6;
    const scrollX = -scrollProgress * 0.35;
    const scrollZ = scrollProgress * 0.15;

    inner.current.rotation.y = idleY + scrollY;
    inner.current.rotation.x = idleX + scrollX;
    inner.current.rotation.z = scrollZ;

    // Scale: entrance pop, then slight shrink on scroll for depth
    const scale = ease * (1 - scrollProgress * 0.12);
    group.current.scale.setScalar(scale);

    // Lift slightly on scroll
    group.current.position.y = scrollProgress * 0.4;

    // Fade-related: tilt the whole group for a dynamic exit
    group.current.rotation.x = scrollProgress * 0.12;
  });

  return (
    <group ref={group} dispose={null}>
      <group ref={inner}>
        {/* Left lens frame + glass */}
        <mesh geometry={lensFrameGeo} material={frameMaterial} position={[-0.72, 0, 0]} />
        <mesh geometry={lensGlassGeo} material={lensMaterial} position={[-0.72, 0, 0]} />
        {/* Right lens frame + glass */}
        <mesh geometry={lensFrameGeo} material={frameMaterial} position={[0.72, 0, 0]} />
        <mesh geometry={lensGlassGeo} material={lensMaterial} position={[0.72, 0, 0]} />
        {/* Bridge */}
        <mesh geometry={bridgeGeo} material={frameMaterial} />
        {/* Temples */}
        <mesh geometry={templeLeftGeo} material={frameMaterial} />
        <mesh geometry={templeRightGeo} material={frameMaterial} />
      </group>
    </group>
  );
};
