import { useRef } from 'react';
import { InfiniteCanvas } from './components/InfiniteCanvas';
import { Toolbar } from './components/Toolbar';
import './App.css';

function App() {
  const canvasRef = useRef<{ clear: () => void; reset: () => void } | null>(null);

  const handleClear = () => {
    window.location.reload();
  };

  const handleResetViewport = () => {
    window.location.reload();
  };

  return (
    <div className="app">
      <Toolbar
        onClear={handleClear}
        onResetViewport={handleResetViewport}
      />
      <InfiniteCanvas />
    </div>
  );
}

export default App;
