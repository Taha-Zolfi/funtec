import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

function FerrisWheel() {
  const groupRef = useRef();
  const { scene } = useGLTF('/ferris2.glb');
  const cylinderRef = useRef();
  const cabins = useRef([]);
  const inverseQuat = new THREE.Quaternion();

  useEffect(() => {
    cabins.current = [];

    cylinderRef.current = scene.getObjectByName('Cylinder');

    for (let i = 1; i <= 10; i++) {
      const name = `Cube${i.toString().padStart(3, '0')}`;
      const cabin = scene.getObjectByName(name);
      if (cabin) {
        cabins.current.push(cabin);
      }
    }

    if (groupRef.current && scene) {
      groupRef.current.add(scene);
    }

    return () => {
      if (groupRef.current && scene) {
        groupRef.current.remove(scene);
      }
    };
  }, [scene]);

  useFrame(() => {
    if (!cylinderRef.current) return;

    cylinderRef.current.rotation.y -= 0.003;

    cylinderRef.current.getWorldQuaternion(inverseQuat);
    inverseQuat.invert();

    cabins.current.forEach((cabin) => {
      cabin.quaternion.copy(inverseQuat);
    });
  });

  // فقط تغییر این خط برای جابه‌جایی مدل
  return <group ref={groupRef} position={[-1.2, 0.1, 0]} />;
}

export default FerrisWheel;
