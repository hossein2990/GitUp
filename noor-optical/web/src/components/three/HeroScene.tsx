import { Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import { GlassesModel } from './GlassesModel';
import { OpticalUniverse } from './OpticalUniverse';

interface HeroSceneProps {
  scrollProgress: number;
}

/**
 * Scroll-driven camera: starts head-on, then orbits and lifts as the user
 * scrolls through the hero, creating the "entering / leaving the universe"
 * motion described by the reference video.
 */
const CameraRig = ({ scrollProgress }: { scrollProgress: number }) => {
  const { camera } = useThree();

  useFrame(() => {
    const sp = scrollProgress;
    // Orbit from centre to the right, then pull up
    const targetX = Math.sin(sp * Math.PI) * 1.8;
    const targetY = sp * 1.8;
    const targetZ = 5.2 - sp * 1.4;

    camera.position.lerp(new THREE.Vector3(targetX, targetY, targetZ), 0.04);
    camera.lookAt(0, sp * 0.5, 0);
  });

  return null;
};

/**
 * The full 3D hero canvas: a navy fog envelops the scene, champagne key light
 * from above-right, soft fill from the left, and a custom environment built from
 * Lightformers so the metal frames and glass lenses pick up realistic reflections
 * in the brand palette — no external HDR files required.
 */
export const HeroScene = ({ scrollProgress }: HeroSceneProps) => {
  return (
    <Canvas
      camera={{ fov: 34, position: [0, 0, 5.2], near: 0.1, far: 100 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ width: '100%', height: '100%' }}
    >
      <color attach="background" args={['#0e1c2b']} />
      <fog attach="fog" args={['#0e1c2b', 6.5, 16]} />

      {/* Lighting in brand palette */}
      <ambientLight intensity={0.5} color="#14283d" />
      <directionalLight position={[3, 5, 2]} intensity={2.2} color="#c5a77f" />
      <directionalLight position={[-3, 1, 2]} intensity={0.8} color="#ffffff" />
      <pointLight position={[0, -2, -2]} intensity={1.0} color="#c5a77f" />
      <spotLight position={[0, 3, 4]} intensity={1.5} angle={0.5} penumbra={0.8} color="#e8d5b0" />

      <CameraRig scrollProgress={scrollProgress} />

      <Suspense fallback={null}>
        <GlassesModel scrollProgress={scrollProgress} />
        <OpticalUniverse scrollProgress={scrollProgress} />

        {/* Custom environment for reflections — brand-tinted Lightformers */}
        <Environment resolution={256}>
          <Lightformer
            intensity={3}
            position={[0, 5, 0]}
            scale={[10, 1, 1]}
            color="#c5a77f"
          />
          <Lightformer
            intensity={2}
            position={[5, 0, 0]}
            scale={[1, 10, 1]}
            color="#ffffff"
          />
          <Lightformer
            intensity={1}
            position={[-5, 0, 0]}
            scale={[1, 10, 1]}
            color="#14283d"
          />
          <Lightformer
            intensity={1.5}
            position={[0, -3, 2]}
            scale={[6, 1, 1]}
            color="#1e3a54"
          />
        </Environment>
      </Suspense>
    </Canvas>
  );
};
