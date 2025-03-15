import dynamic from 'next/dynamic';

// Use dynamic import with no SSR for the Canvas component
// This is necessary because it uses browser APIs like localStorage
const Canvas = dynamic(() => import('@/components/Canvas'));

export default function Home() {
  return (
    <div className="grid grid-cols-[1fr_auto] min-h-screen">
      <div className="flex flex-col items-center justify-start p-4 pt-8">
        <main className="w-full max-w-4xl">
          <Canvas />
        </main>
      </div>
    </div>
  );
}
