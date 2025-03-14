import dynamic from 'next/dynamic';

// Use dynamic import with no SSR for the Canvas component
// This is necessary because it uses browser APIs like localStorage
const Canvas = dynamic(() => import('@/components/Canvas'));

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <main className="w-full max-w-4xl">
        <Canvas />
      </main>
      
      <footer className="mt-8 text-center text-xs text-gray-500">
        <p>r/place Clone - A collaborative pixel canvas</p>
        <p className="mt-1">Each user can place one pixel per minute</p>
      </footer>
    </div>
  );
}
