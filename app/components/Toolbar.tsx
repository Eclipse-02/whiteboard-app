import React from "react";
import { ShapeType } from "@/app/types/shapes";

interface ToolbarProps {
  addShape: (type: ShapeType) => void;
  zoom: number;
  setZoom: (z: number) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ addShape, zoom, setZoom }) => {
  return (
    <div className="absolute top-2 left-2 flex gap-2 bg-white shadow-md rounded p-2 z-50">
      <button onClick={() => addShape("rectangle")} className="px-2 py-1 bg-gray-200 rounded">
        ▭ Rect
      </button>
      <button onClick={() => addShape("circle")} className="px-2 py-1 bg-gray-200 rounded">
        ◯ Circle
      </button>
      <button onClick={() => addShape("triangle")} className="px-2 py-1 bg-gray-200 rounded">
        △ Triangle
      </button>
      <button onClick={() => addShape("line")} className="px-2 py-1 bg-gray-200 rounded">
        ─ Line
      </button>

      <div className="ml-4 flex gap-2">
        <button onClick={() => setZoom(zoom + 0.1)}>➕</button>
        <span>{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom(Math.max(0.1, zoom - 0.1))}>➖</button>
      </div>
    </div>
  );
};

export default Toolbar;
