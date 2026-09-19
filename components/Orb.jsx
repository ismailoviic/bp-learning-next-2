"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { Component, useMemo, useRef, useState, useEffect } from "react";
import * as THREE from "three";
function Sculpture() {
  const group = useRef();
  const shader = useRef();
  const uniforms = useMemo(() => ({ time: { value: 0 } }), []);
  useFrame((s, delta) => {
    if (group.current) {
      group.current.rotation.y = THREE.MathUtils.lerp(
        group.current.rotation.y,
        s.pointer.x * 0.5,
        0.05,
      );
      group.current.rotation.x = THREE.MathUtils.lerp(
        group.current.rotation.x,
        -s.pointer.y * 0.25,
        0.05,
      );
      group.current.position.y = Math.sin(s.clock.elapsedTime * 0.7) * 0.09;
    }
    uniforms.time.value += Math.min(delta, 0.05);
  });
  return (
    <>
      <ambientLight intensity={1.9} />
      <directionalLight position={[3, 4, 5]} intensity={3} />
      <pointLight position={[-3, -2, 2]} color="#bd9cff" intensity={20} />
      <mesh position={[0, 0, -2]}>
        <planeGeometry args={[15, 12]} />
        <shaderMaterial
          ref={shader}
          uniforms={uniforms}
          vertexShader={
            "varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}"
          }
          fragmentShader={
            "varying vec2 vUv; uniform float time; void main(){float w=sin(vUv.x*7.0+time*.3+sin(vUv.y*9.0-time*.2))*0.5+0.5;vec3 a=vec3(.12,.055,.23);vec3 b=vec3(.35,.18,.54);gl_FragColor=vec4(mix(a,b,w*.6+vUv.y*.25),1.0);}"
          }
        />
      </mesh>
      <group ref={group} rotation={[0.1, -0.15, -0.12]}>
        <mesh>
          <torusGeometry args={[1.02, 0.34, 32, 80]} />
          <meshPhysicalMaterial
            color="#c6b3ff"
            roughness={0.21}
            metalness={0.35}
            clearcoat={1}
          />
        </mesh>
        <mesh position={[0.72, 0.63, 0.48]}>
          <sphereGeometry args={[0.27, 32, 32]} />
          <meshPhysicalMaterial
            color="#d9f9b0"
            roughness={0.2}
            metalness={0.15}
          />
        </mesh>
        <mesh position={[-0.7, -0.8, 0.35]}>
          <sphereGeometry args={[0.17, 24, 24]} />
          <meshStandardMaterial color="#ffffff" roughness={0.2} />
        </mesh>
        <mesh position={[0, 0, 0.15]} rotation={[0.3, 0.5, 0.6]}>
          <octahedronGeometry args={[0.44, 0]} />
          <meshPhysicalMaterial
            color="#e4dcff"
            metalness={0.25}
            roughness={0.18}
          />
        </mesh>
      </group>
    </>
  );
}
class Boundary extends Component {
  constructor(p) {
    super(p);
    this.state = { error: false };
  }
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    return this.state.error ? (
      <div className="orb-fallback">✦</div>
    ) : (
      this.props.children
    );
  }
}
export default function Orb() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const media = matchMedia(
      "(prefers-reduced-motion: reduce), (max-width: 700px)",
    );
    function update() {
      try {
        setEnabled(
          !media.matches &&
            !!document.createElement("canvas").getContext("webgl2"),
        );
      } catch {
        setEnabled(false);
      }
    }
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return (
    <div className="orb" aria-hidden="true">
      {enabled ? (
        <Boundary>
          <Canvas
            dpr={[1, 1.5]}
            camera={{ position: [0, 0, 4.5], fov: 42 }}
            gl={{ antialias: true, alpha: false }}
          >
            <Sculpture />
          </Canvas>
        </Boundary>
      ) : (
        <div className="orb-fallback">✦</div>
      )}
      <div className="orb-caption">
        <span>Écouter.</span>
        <span>Comprendre.</span>
        <span>Accompagner.</span>
      </div>
    </div>
  );
}
