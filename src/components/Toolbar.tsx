import { useState } from 'react';
import type { DrawingTool } from '../types/canvas';
import './Toolbar.css';

interface ToolbarProps {
  onClear: () => void;
  onResetViewport: () => void;
  onToolChange?: (tool: DrawingTool) => void;
  onColorChange?: (color: string) => void;
}

export function Toolbar({ onClear, onResetViewport, onToolChange, onColorChange }: ToolbarProps) {
  const [tool, setTool] = useState<DrawingTool>('pen');
  const [color, setColor] = useState('#000000');

  const handleToolChange = (newTool: DrawingTool) => {
    setTool(newTool);
    onToolChange?.(newTool);
  };

  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    onColorChange?.(newColor);
  };

  return (
    <div className="toolbar">
      <div className="toolbar-section">
        <button
          className={tool === 'pen' ? 'active' : ''}
          onClick={() => handleToolChange('pen')}
          title="Pen Tool"
        >
          ✏️ Pen
        </button>
        <button
          className={tool === 'eraser' ? 'active' : ''}
          onClick={() => handleToolChange('eraser')}
          title="Eraser Tool"
        >
          🧹 Eraser
        </button>
      </div>

      <div className="toolbar-section">
        <input
          type="color"
          value={color}
          onChange={(e) => handleColorChange(e.target.value)}
          title="Color Picker"
        />
      </div>

      <div className="toolbar-section">
        <button onClick={onClear} title="Clear Canvas">
          🗑️ Clear
        </button>
        <button onClick={onResetViewport} title="Reset View">
          🎯 Reset View
        </button>
      </div>
    </div>
  );
}
