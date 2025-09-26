import React from "react";

interface ContextMenuProps {
  x: number;
  y: number;
  onDelete: () => void;
  onClose: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onDelete, onClose }) => {
  return (
    <div
      className="absolute bg-white shadow-md rounded p-2 z-50"
      style={{ top: y, left: x }}
      onMouseLeave={onClose}
    >
      <button onClick={onDelete} className="block px-2 py-1 hover:bg-gray-100 w-full text-left">
        🗑 Delete
      </button>
      {/* Future options: Group, Change Shape, Change Color */}
    </div>
  );
};

export default ContextMenu;
