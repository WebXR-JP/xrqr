import { Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from "@react-three/drei";
import { createXRStore, XR, XROrigin } from '@react-three/xr';
import './styles.css'

const store = createXRStore()

const Root = () => {
  return (
    <>
      <Canvas
        gl={{ antialias: true, pixelRatio: 1 }}
        dpr={Math.min(window.devicePixelRatio, 1.5)}
        style={{ background: '#000000' }}
        camera={{ position: [0, 0, 1], fov: 120, near: 0.01 }}
      >
        <XR store={store}>
          <XROrigin position={[0, -1.5, 15]} />
          <Suspense>
            <OrbitControls />
          </Suspense>
        </XR>
      </Canvas>
    </>
  )
}

createRoot(document.getElementById('root')!).render(
  <Root />
)
