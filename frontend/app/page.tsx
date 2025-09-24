// app/page.tsx (Home with 3D canvas)
'use client';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { OrbitControls, Box } from '@react-three/drei';

export default function HomePage() {
  return (
    <div className="h-screen bg-gray-800">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight />
        <Suspense fallback={null}>
          <Box rotation={[0.4, 0.2, 0]}>
            <meshStandardMaterial color="orange" />
          </Box>
        </Suspense>
        <OrbitControls />
      </Canvas>
    </div>
  );
}
