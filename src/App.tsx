import { InfiniteCanvas } from './components/InfiniteCanvas';
import { Toolbar } from './components/Toolbar';
import { PromptBar } from './components/PromptBar';
import { ModelSelector } from './components/ModelSelector';

function App() {
  return (
    <div className="w-screen h-screen m-0 p-0 overflow-hidden">
      <Toolbar />
      <InfiniteCanvas />
      <ModelSelector />
      <PromptBar />
    </div>
  );
}

export default App;
