import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'

// Floating Particles Component
function FloatingParticles() {
  const ref = useRef()
  const particleCount = 1000
  
  const particles = useMemo(() => {
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    
    for (let i = 0; i < particleCount; i++) {
      // Random positions in a sphere
      const radius = Math.random() * 20 + 5
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = radius * Math.cos(phi)
      
      // Alternate between orange and blue
      const isOrange = Math.random() > 0.5
      colors[i * 3] = isOrange ? 1 : 0.07 // R
      colors[i * 3 + 1] = isOrange ? 0.71 : 0.78 // G
      colors[i * 3 + 2] = isOrange ? 0.15 : 1 // B
    }
    
    return { positions, colors }
  }, [])
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1
      ref.current.rotation.y = state.clock.elapsedTime * 0.05
      ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.15) * 0.05
    }
  })
  
  return (
    <Points ref={ref} positions={particles.positions} colors={particles.colors}>
      <PointMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation={true}
        depthWrite={false}
      />
    </Points>
  )
}

// Geometric Shapes Component
function GeometricShapes() {
  const group = useRef()
  
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1
      group.current.rotation.y = state.clock.elapsedTime * 0.1
    }
  })
  
  return (
    <group ref={group}>
      {/* Wireframe Torus */}
      <mesh position={[-8, 3, -5]} rotation={[0.5, 0, 0]}>
        <torusGeometry args={[2, 0.5, 8, 16]} />
        <meshBasicMaterial color="#ffb527" wireframe transparent opacity={0.4} />
      </mesh>
      
      {/* Wireframe Octahedron */}
      <mesh position={[8, -2, -3]} rotation={[0, 0.5, 0]}>
        <octahedronGeometry args={[1.5]} />
        <meshBasicMaterial color="#13c8ff" wireframe transparent opacity={0.5} />
      </mesh>
      
      {/* Wireframe Icosahedron */}
      <mesh position={[0, 5, -8]} rotation={[0.3, 0.3, 0]}>
        <icosahedronGeometry args={[1]} />
        <meshBasicMaterial color="#ffb527" wireframe transparent opacity={0.3} />
      </mesh>
      
      {/* Wireframe Dodecahedron */}
      <mesh position={[-5, -4, -6]} rotation={[0.2, 0.8, 0.1]}>
        <dodecahedronGeometry args={[1.2]} />
        <meshBasicMaterial color="#13c8ff" wireframe transparent opacity={0.4} />
      </mesh>
    </group>
  )
}

// Animated Rings Component
function AnimatedRings() {
  const rings = useRef()
  
  useFrame((state) => {
    if (rings.current) {
      rings.current.children.forEach((ring, index) => {
        ring.rotation.x = state.clock.elapsedTime * (0.5 + index * 0.1)
        ring.rotation.y = state.clock.elapsedTime * (0.3 + index * 0.05)
        ring.rotation.z = Math.sin(state.clock.elapsedTime + index) * 0.2
      })
    }
  })
  
  return (
    <group ref={rings}>
      {[...Array(5)].map((_, i) => (
        <mesh key={i} position={[0, 0, -10 - i * 2]}>
          <torusGeometry args={[3 + i * 0.5, 0.1, 8, 32]} />
          <meshBasicMaterial 
            color={i % 2 === 0 ? "#ffb527" : "#13c8ff"} 
            transparent 
            opacity={0.3 - i * 0.05} 
          />
        </mesh>
      ))}
    </group>
  )
}

// Energy Waves Component
function EnergyWaves() {
  const waves = useRef()
  
  useFrame((state) => {
    if (waves.current) {
      waves.current.children.forEach((wave, index) => {
        const time = state.clock.elapsedTime
        wave.scale.setScalar(1 + Math.sin(time * 2 + index * 0.5) * 0.3)
        wave.material.opacity = 0.2 + Math.sin(time * 3 + index) * 0.1
      })
    }
  })
  
  return (
    <group ref={waves}>
      {[...Array(3)].map((_, i) => (
        <mesh key={i} position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2 + i * 2, 2.5 + i * 2, 32]} />
          <meshBasicMaterial 
            color={i % 2 === 0 ? "#ffb527" : "#13c8ff"} 
            transparent 
            opacity={0.2}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  )
}

// Main Scene Component
export default function Scene3D() {
  return (
    <>
      {/* Ambient lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.5} color="#ffb527" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#13c8ff" />
      
      {/* 3D Elements */}
      <FloatingParticles />
      <GeometricShapes />
      <AnimatedRings />
      <EnergyWaves />
    </>
  )
}