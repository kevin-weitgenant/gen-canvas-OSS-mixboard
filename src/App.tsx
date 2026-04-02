import { InfiniteCanvas } from './components/InfiniteCanvas';
import { Toolbar } from './components/Toolbar';

function App() {
  return (
    <div className="w-screen h-screen m-0 p-0 overflow-hidden">
      <Toolbar />
      <InfiniteCanvas />
    </div>
  );
}

export default App;
