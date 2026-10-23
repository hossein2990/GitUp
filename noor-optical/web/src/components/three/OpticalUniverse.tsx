import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';

interface OpticalUniverseProps {
  scrollProgress: number;
}

interface DiscData {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  speed: number;
}

/**
 * The "optical universe" surrounding the glasses: floating translucent lens
 * rings at varying depths, and champagne sparkles. The whole field drifts
 * slowly and disperses upward as the user scrolls, reinforcing the sense of
 * entering (and then leaving) an immersive space.
 */
export const OpticalUniverse = ({ scrollProgress }: OpticalUniverseProps) => {
  const group = useRef<THREE.Group>(null);

  const discs = useMemo<DiscData[]>(() => {
    const items: DiscData[] = [];
    const count = 9;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4;
      const radius = 2.4 + Math.random() * 1.8;
      items.push({
        position: [
          Math.cos(angle) * radius,
          (Math.random() - 0.5) * 2.4,
          Math.sin(angle) * radius - 1.5,
        ],
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0],
        scale: 0.18 + Math.random() * 0.28,
        speed: 0.1 + Math.random() * 0.2,
      });
    }
    return items;
  }, []);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.getElapsedTime();

    group.current.rotation.y = t * 0.04;
    group.current.position.y = scrollProgress * 0.5;

    // Fade the universe out near the end of the hero scroll
    const fade = 1 - Math.pow(scrollProgress, 2);
    group.current.children.forEach((child) => {
      const mesh = child as THREE.Mesh;
      if (mesh.material && 'opacity' in mesh.material) {
        const mat = mesh.material as THREE.MeshStandardMaterial;
        mat.opacity = 0.35 * fade;
      }
    });
  });

  return (
    <group ref={group}>
      {discs.map((disc, i) => (
        <mesh
          key={i}
          position={disc.position}
          rotation={disc.rotation}
          scale={disc.scale}
        >
          <torusGeometry args={[1, 0.018, 8, 48]} />
          <meshStandardMaterial
            color="#c5a77f"
            metalness={0.6}
            roughness={0.3}
            transparent
            opacity={0.35}
          />
        </mesh>
      ))}

      <Sparkles
        count={50}
        scale={[7, 5, 5]}
        size={2.5}
        speed={0.25}
        color="#c5a77f"
        opacity={0.55}
      />
    </group>
  );
};
