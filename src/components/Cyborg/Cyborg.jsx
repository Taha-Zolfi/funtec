import React, { useRef, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';

function Cyborg() {
  const groupRef = useRef();
  const { scene } = useGLTF('/operator.glb');

  useEffect(() => {
    if (groupRef.current && scene) {
      groupRef.current.add(scene);
    }

    return () => {
      if (groupRef.current && scene) {
        groupRef.current.remove(scene);
      }
    };
  }, [scene]);

  useEffect(() => {
    if (scene) {
      scene.position.y = -1.5; // مستقیم مثل قبل
      scene.rotation.y = 0.5;  // اینم مستقیم به سبک تو!
    }
  }, [scene]);

  return <group ref={groupRef} />;
}

export default Cyborg;
