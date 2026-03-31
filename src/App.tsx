import { InfiniteCanvas } from './components/InfiniteCanvas';
import { Toolbar } from './components/Toolbar';
import { useCanvasStore } from './store/canvasStore';

function App() {
  const handleClear = () => {
    useCanvasStore.getState().clear();
  };

  return (
    <div className="w-screen h-screen m-0 p-0 overflow-hidden">
      <Toolbar onClear={handleClear} />
      <InfiniteCanvas />
    </div>
  );
}

export default App;
