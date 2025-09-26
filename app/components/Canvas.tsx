// Canvas.tsx
import React, { useState, useEffect, useRef } from "react";
import Shape from "@/app/components/Shape";
import { ShapeData } from "@/app/types/shapes";
import { v4 as uuidv4 } from "uuid";
import { BsCircleFill, BsTriangleFill, BsPaletteFill } from "react-icons/bs";
import { IoMdClose } from "react-icons/io";
import {
  TbSquareFilled,
  TbSquareRoundedPlusFilled,
  TbSquareRoundedMinusFilled,
} from "react-icons/tb";

export default function Canvas() {
  const [shapes, setShapes] = useState<ShapeData[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    shapeId: string | null;
  } | null>(null);
  const [zoom, setZoom] = useState(100);
  const [showInfo, setShowInfo] = useState(true);

  // clipboard state
  const [clipboardShape, setClipboardShape] = useState<ShapeData | null>(null);

  // ref for canvas container (used for export)
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleUpdate = (id: string, updates: Partial<ShapeData>) => {
    setShapes((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const addShape = (type: ShapeData["type"]) => {
    let color = "#3b82f6"; // rectangle = blue
    if (type === "circle") color = "#22c55e"; // green
    if (type === "triangle") color = "#eab308"; // yellow

    setShapes((prev) => [
      ...prev,
      {
        id: uuidv4(),
        type,
        x: 150,
        y: 150,
        width: 100,
        height: 80,
        color,
        text: "",
      },
    ]);
  };

  const deleteShape = (id: string) => {
    setShapes((prev) => prev.filter((s) => s.id !== id));
    setContextMenu(null);
    if (selectedId === id) setSelectedId(null);
  };

  const changeColor = (id: string) => {
    setShapes((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              color:
                "#" +
                Math.floor(Math.random() * 16777215)
                  .toString(16)
                  .padStart(6, "0"),
            }
          : s
      )
    );
    setContextMenu(null);
  };

  const changeShape = (id: string, newType: ShapeData["type"]) => {
    setShapes((prev) =>
      prev.map((s) => (s.id === id ? { ...s, type: newType } : s))
    );
    setContextMenu(null);
  };

  const handleZoom = (direction: "in" | "out") => {
    setZoom((prev) => {
      let newZoom = direction === "in" ? prev + 10 : prev - 10;
      if (newZoom < 10) newZoom = 10;
      if (newZoom > 300) newZoom = 300;
      return newZoom;
    });
  };

  const handleSaveAsPng = async () => {
    if (!canvasRef.current) return;
    const htmlToImage = await import("html-to-image");
    htmlToImage.toPng(canvasRef.current).then((dataUrl: string) => {
      const link = document.createElement("a");
      link.download = "whiteboard.png";
      link.href = dataUrl;
      link.click();
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // zoom
      if (e.ctrlKey && (e.key === "+" || e.key === "=")) {
        e.preventDefault();
        handleZoom("in");
      } else if (e.ctrlKey && e.key === "-") {
        e.preventDefault();
        handleZoom("out");
      }
      // delete
      else if (e.key === "Delete" && selectedId) {
        e.preventDefault();
        deleteShape(selectedId);
      }
      // add shapes
      else if (e.key.toLowerCase() === "r" && e.shiftKey) {
        e.preventDefault();
        addShape("rectangle");
      } else if (e.key.toLowerCase() === "c" && e.shiftKey) {
        e.preventDefault();
        addShape("circle");
      } else if (e.key.toLowerCase() === "t" && e.shiftKey) {
        e.preventDefault();
        addShape("triangle");
      }
      // clipboard: copy
      else if (e.ctrlKey && e.key.toLowerCase() === "c") {
        if (selectedId) {
          const shape = shapes.find((s) => s.id === selectedId);
          if (shape) {
            setClipboardShape({ ...shape });
            navigator.clipboard
              .writeText(JSON.stringify(shape))
              .catch(() => {});
          }
        }
      }
      // clipboard: cut
      else if (e.ctrlKey && e.key.toLowerCase() === "x") {
        if (selectedId) {
          const shape = shapes.find((s) => s.id === selectedId);
          if (shape) {
            setClipboardShape({ ...shape });
            navigator.clipboard
              .writeText(JSON.stringify(shape))
              .catch(() => {});
            deleteShape(selectedId);
          }
        }
      }
      // clipboard: paste
      else if (e.ctrlKey && e.key.toLowerCase() === "v") {
        if (clipboardShape) {
          const newShape = {
            ...clipboardShape,
            id: uuidv4(),
            x: clipboardShape.x + 20,
            y: clipboardShape.y + 20,
          };
          setShapes((prev) => [...prev, newShape]);
          setSelectedId(newShape.id);
        } else {
          navigator.clipboard
            .readText()
            .then((text) => {
              try {
                const parsed = JSON.parse(text) as ShapeData;
                const newShape = {
                  ...parsed,
                  id: uuidv4(),
                  x: parsed.x + 20,
                  y: parsed.y + 20,
                };
                setShapes((prev) => [...prev, newShape]);
                setSelectedId(newShape.id);
              } catch {
                // ignore
              }
            })
            .catch(() => {});
        }
      }
      // save PNG
      else if (e.ctrlKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSaveAsPng();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedId, shapes, clipboardShape]);

  return (
    <div
      className="relative w-full h-full bg-gray-100 overflow-hidden"
      onClick={() => {
        setContextMenu(null);
        setSelectedId(null);
      }}
    >
      {/* Canvas content with zoom */}
      <div
        ref={canvasRef}
        className="w-full h-full relative origin-top-left"
        style={{ transform: `scale(${zoom / 100})` }}
      >
        {shapes.map((shape) => (
          <Shape
            key={shape.id}
            shape={shape}
            isSelected={shape.id === selectedId}
            onUpdate={handleUpdate}
            onClick={(e, id) => {
              e.stopPropagation();
              setSelectedId(id);
              setContextMenu(null);
            }}
            onContextMenu={(e, id) => {
              e.preventDefault();
              e.stopPropagation();
              setSelectedId(id);
              setContextMenu({ x: e.clientX, y: e.clientY, shapeId: id });
            }}
          />
        ))}
      </div>

      {/* Toolbar (bottom center) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-6 bg-white shadow-md px-4 py-2 rounded-lg">
        {/* Shape buttons */}
        <div className="flex gap-3">
          <TbSquareFilled
            className="w-8 h-8 text-blue-500 hover:text-blue-600 cursor-pointer"
            title="Rectangle"
            onClick={() => addShape("rectangle")}
          />
          <BsCircleFill
            className="w-8 h-8 text-green-500 hover:text-green-600 cursor-pointer"
            title="Circle"
            onClick={() => addShape("circle")}
          />
          <BsTriangleFill
            className="w-8 h-8 text-yellow-500 hover:text-yellow-600 cursor-pointer"
            title="Triangle"
            onClick={() => addShape("triangle")}
          />
        </div>

        {/* Separator */}
        <div className="w-px h-6 bg-gray-300 mx-2" />

        {/* Zoom controls */}
        <div className="flex items-center gap-2">
          <TbSquareRoundedMinusFilled
            className="w-8 h-8 text-gray-400 hover:text-gray-500 cursor-pointer"
            onClick={() => handleZoom("out")}
          />
          <span className="min-w-[40px] text-center text-gray-600">
            {zoom}%
          </span>
          <TbSquareRoundedPlusFilled
            className="w-8 h-8 text-gray-400 hover:text-gray-500 cursor-pointer"
            onClick={() => handleZoom("in")}
          />
        </div>
      </div>

      {/* Top-left App Info Card */}
      <div className="absolute top-4 left-4 z-50 bg-white shadow-md rounded-lg p-4 w-64">
        <h2 className="text-lg font-bold text-gray-800">A Whiteboard</h2>
        <p className="text-sm text-gray-600">Just a simple whiteboard</p>
      </div>

      {/* Info Card (top right) */}
      {showInfo ? (
        <div className="absolute top-4 right-4 z-50 bg-white shadow-md rounded-lg p-4 w-64">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-gray-800">Shortcuts</h3>
            <button
              onClick={() => setShowInfo(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <IoMdClose className="w-5 h-5" />
            </button>
          </div>
          <ul className="text-sm text-gray-600 space-y-1">
            <li><b>Ctrl + +</b>: Zoom In</li>
            <li><b>Ctrl + -</b>: Zoom Out</li>
            <li><b>Del</b>: Delete Shape</li>
            <li><b>Shift + R</b>: New Rectangle</li>
            <li><b>Shift + C</b>: New Circle</li>
            <li><b>Shift + T</b>: New Triangle</li>
            <li><b>Ctrl + S</b>: Save PNG</li>
            <li><b>Ctrl + C / V / X</b>: Copy / Paste / Cut</li>
          </ul>
        </div>
      ) : (
        <button
          className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-md hover:bg-blue-600"
          onClick={() => setShowInfo(true)}
          title="Show shortcuts"
        >
          ?
        </button>
      )}

      {/* Context Menu */}
      {contextMenu && contextMenu.shapeId && (
        <div
          className="absolute bg-white shadow-lg rounded-md border z-50 p-2 flex flex-col gap-2"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button
            className="block w-full px-2 py-1 text-left text-red-400 hover:bg-gray-100 rounded"
            onClick={() => deleteShape(contextMenu.shapeId!)}
          >
            Delete
          </button>
          <div className="flex items-center gap-2">
            <BsPaletteFill
              className="w-6 h-6 text-gray-500 hover:text-pink-500 cursor-pointer"
              title="Change Color"
              onClick={() => changeColor(contextMenu.shapeId!)}
            />
            <BsCircleFill
              className="w-6 h-6 text-green-500 hover:text-green-600 cursor-pointer"
              title="Circle"
              onClick={() => changeShape(contextMenu.shapeId!, "circle")}
            />
            <TbSquareFilled
              className="w-6 h-6 text-blue-500 hover:text-blue-600 cursor-pointer"
              title="Rectangle"
              onClick={() => changeShape(contextMenu.shapeId!, "rectangle")}
            />
            <BsTriangleFill
              className="w-6 h-6 text-yellow-500 hover:text-yellow-600 cursor-pointer"
              title="Triangle"
              onClick={() => changeShape(contextMenu.shapeId!, "triangle")}
            />
          </div>
        </div>
      )}
    </div>
  );
}
