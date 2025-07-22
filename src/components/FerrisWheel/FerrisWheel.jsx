import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

function FerrisWheel() {
  const groupRef = useRef();
  const cylinderRef = useRef();
  const cabins = useRef([]);
  const planeMeshes = useRef([]);
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const { camera, gl } = useThree();

  const { scene } = useGLTF('/ferris_final.glb');

  const inverseQuat = useMemo(() => new THREE.Quaternion(), []);
  const textureLoader = useMemo(() => new THREE.TextureLoader(), []);
  const links = useMemo(() => Array(10).fill('/products/'), []);
  const textureCache = useMemo(() => new Map(), []);

  const materialConfig = useMemo(() => ({
    transparent: false,
    opacity: 1,
    depthTest: true,
    depthWrite: true,
    side: THREE.DoubleSide,
  }), []);

  const loadTexture = useCallback((path) => {
    if (textureCache.has(path)) {
      return textureCache.get(path);
    }

    const texture = textureLoader.load(
      path,
      undefined,
      undefined,
      (error) => console.warn(`Failed to load texture ${path}:`, error)
    );

    texture.colorSpace = THREE.SRGBColorSpace;
    texture.repeat.x = -1;
    texture.offset.x = 1;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;

    textureCache.set(path, texture);
    return texture;
  }, [textureLoader, textureCache]);

  const updateMouseCoords = useCallback((event) => {
    if (!gl.domElement) return false;
    const rect = gl.domElement.getBoundingClientRect();
    mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    return true;
  }, [gl]);

  const handleClick = useCallback((event) => {
    if (!updateMouseCoords(event) || planeMeshes.current.length === 0) return;

    raycaster.current.setFromCamera(mouse.current, camera);
    const intersects = raycaster.current.intersectObjects(planeMeshes.current, false);
    if (intersects.length > 0) {
      const url = intersects[0].object.userData.link;
      if (url) window.location.href = url;
    }
  }, [camera, updateMouseCoords]);

  const handlePointerMove = useCallback((event) => {
    if (!updateMouseCoords(event) || planeMeshes.current.length === 0) return;

    raycaster.current.setFromCamera(mouse.current, camera);
    const intersects = raycaster.current.intersectObjects(planeMeshes.current, false);
    if (gl.domElement) {
      gl.domElement.style.cursor = intersects.length > 0 ? 'pointer' : 'default';
    }
  }, [camera, gl, updateMouseCoords]);

  const throttledPointerMove = useMemo(() => {
    let timeoutId;
    return (event) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => handlePointerMove(event), 16);
    };
  }, [handlePointerMove]);

  useEffect(() => {
    if (!scene) return;

    cabins.current = [];
    planeMeshes.current = [];

    const clonedScene = scene.clone(true);

    if (groupRef.current) {
      groupRef.current.clear();
    }

    cylinderRef.current = clonedScene.getObjectByName('Cylinder');

    for (let i = 1; i <= 10; i++) {
      const index = i.toString().padStart(3, '0');

      const cabin = clonedScene.getObjectByName(`v${index}`);
      if (cabin) {
        cabin.frustumCulled = true;
        cabins.current.push(cabin);
      }

      const plane = clonedScene.getObjectByName(`Plane${index}`);
      if (plane) {
        const texture = loadTexture(`/p${i}.jpg`);
        plane.material = new THREE.MeshBasicMaterial({
          ...materialConfig,
          map: texture,
        });
        plane.rotation.y = Math.PI;
        plane.userData.link = links[i - 1];
        plane.frustumCulled = true;
        planeMeshes.current.push(plane);
      }
    }

    if (groupRef.current) {
      groupRef.current.add(clonedScene);
    }

    return () => {
      if (groupRef.current && clonedScene) {
        groupRef.current.remove(clonedScene);
        clonedScene.traverse((child) => {
          if (child.isMesh) {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach((mat) => mat.dispose());
              } else {
                child.material.dispose();
              }
            }
          }
        });
      }
    };
  }, [scene, loadTexture, links, materialConfig]);

  useEffect(() => {
    const element = gl.domElement;
    if (!element) return;

    element.addEventListener('click', handleClick, { passive: true });
    element.addEventListener('pointermove', throttledPointerMove, { passive: true });

    return () => {
      element.removeEventListener('click', handleClick);
      element.removeEventListener('pointermove', throttledPointerMove);
    };
  }, [handleClick, throttledPointerMove, gl]);

  useFrame(() => {
    const cylinder = cylinderRef.current;
    if (!cylinder) return;

    cylinder.rotation.y -= 0.003;

    if (cabins.current.length > 0) {
      cylinder.getWorldQuaternion(inverseQuat);
      inverseQuat.invert();

      for (let i = 0; i < cabins.current.length; i++) {
        const cabin = cabins.current[i];
        if (cabin) {
          cabin.quaternion.copy(inverseQuat);
        }
      }
    }
  });

  useEffect(() => {
    return () => {
      textureCache.forEach(texture => texture.dispose());
      textureCache.clear();
    };
  }, [textureCache]);

  return <group ref={groupRef} position={[-1.2, 0.1, 0]} />;
}

useGLTF.preload('/ferris_final.glb');

export default FerrisWheel;
