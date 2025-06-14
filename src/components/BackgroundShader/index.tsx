import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Mesh } from 'three'
import styles from './styles.module.css'

// 背景シェーダーのマテリアル
const BackgroundMaterial = () => {
  const meshRef = useRef<Mesh>(null)

  // カスタムシェーダーマテリアル
  const shaderMaterial = useMemo(() => {
    return {
      vertexShader: `
        void main() {
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec2 resolution;

        void main() {
          vec2 uv = gl_FragCoord.xy / resolution.xy;

          // 複数の波紋を作成
          float wave1 = sin(distance(uv, vec2(0.3, 0.7)) * 15.0 - time * 2.0) * 0.5 + 0.5;
          float wave2 = sin(distance(uv, vec2(0.7, 0.3)) * 12.0 - time * 1.5) * 0.5 + 0.5;
          float wave3 = sin(distance(uv, vec2(0.5, 0.5)) * 18.0 - time * 2.5) * 0.5 + 0.5;

          // 波紋を組み合わせ
          float combinedWaves = (wave1 + wave2 + wave3) / 3.0;

          // グラデーションベース（より濃い色合い）
          vec3 color1 = vec3(0.85, 0.88, 0.92); // より濃い薄青
          vec3 color2 = vec3(0.75, 0.80, 0.85); // より濃い中間色
          vec3 color3 = vec3(0.65, 0.70, 0.78); // より濃い暗色

          // UVベースのグラデーション
          vec3 gradient = mix(color1, color2, uv.y);
          gradient = mix(gradient, color3, uv.x * 0.5);

          // 波紋を適用（より強い変化）
          vec3 finalColor = gradient + combinedWaves * 0.15;

          // 微細なノイズ追加
          float noise = fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453) * 0.02;
          finalColor += noise;

          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
      uniforms: {
        time: { value: 0 },
        resolution: { value: [window.innerWidth, window.innerHeight] }
      }
    }
  }, [])

  // アニメーションループ
  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as any
      if (material.uniforms) {
        material.uniforms.time.value = state.clock.elapsedTime
      }
    }
  })

  return (
    <mesh ref={meshRef} position={[0, 0, -1]}>
      <planeGeometry args={[10, 10]} />
      <shaderMaterial
        vertexShader={shaderMaterial.vertexShader}
        fragmentShader={shaderMaterial.fragmentShader}
        uniforms={shaderMaterial.uniforms}
      />
    </mesh>
  )
}

// 背景シェーダーコンポーネント
const BackgroundShader: React.FC = () => {
  return (
    <div className={styles.container}>
      <Canvas
        camera={{ position: [0, 0, 2], fov: 100 }}
        className={styles.canvas}
        style={{ width: '100vw', height: '100vh' }}
        orthographic={false}
      >
        <BackgroundMaterial />
      </Canvas>
    </div>
  )
}

export default BackgroundShader