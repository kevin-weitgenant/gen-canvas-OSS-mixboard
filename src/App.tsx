import { InfiniteCanvas } from './components/InfiniteCanvas';
import { Toolbar } from './components/Toolbar';
import { PromptBar } from './components/PromptBar';
import { ModelSelector } from './components/ModelSelector';
import { useCanvasStore } from './store/canvasStore';

function App() {
  const variationsModal = useCanvasStore((state) => state.variationsModal);

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
