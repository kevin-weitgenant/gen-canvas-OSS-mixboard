import { useEffect } from 'react';
import { InfiniteCanvas } from './components/InfiniteCanvas';
import { Toolbar } from './components/Toolbar';
import { PromptBar } from './components/PromptBar';
import { ModelSelector } from './components/ModelSelector';
import { useCanvasStore } from './store/canvasStore';
import { sseManager } from './services/sseConnectionManager';

function App() {
  const variationsModal = useCanvasStore((state) => state.variationsModal);

  // Cleanup SSE connections on app unmount
  useEffect(() => {
    return () => {
      sseManager.disconnectAll();
    };
  }, []);

  return (
    <div className="w-screen h-screen m-0 p-0 overflow-hidden">
      {!variationsModal && <Toolbar />}
      <InfiniteCanvas />
      {!variationsModal && <ModelSelector />}
      {!variationsModal && <PromptBar />}
    </div>
  );
}

export default App;
