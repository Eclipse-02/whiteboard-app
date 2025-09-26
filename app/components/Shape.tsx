// Shape.tsx
import React, { useEffect, useRef, useState } from "react";
import { Rnd } from "react-rnd";
import { ShapeData } from "@/app/types/shapes";

type ShapeProps = {
  shape: ShapeData;
  isSelected: boolean;
  onUpdate: (id: string, updates: Partial<ShapeData>) => void;
  onClick: (e: React.MouseEvent, id: string) => void;
  onContextMenu: (e: React.MouseEvent, id: string) => void;
};

export default function Shape({ shape, isSelected, onUpdate, onClick, onContextMenu }: ShapeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(shape.text || "");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) textareaRef.current.focus();
  }, [isEditing]);

  const saveText = () => {
    onUpdate(shape.id, { text });
    setIsEditing(false);
  };

  const getShapeInner = () => {
    switch (shape.type) {
      case "circle":
        return (
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              background: shape.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
            }}
            onDoubleClick={() => setIsEditing(true)}
          >
            {!isEditing && <span className="select-none whitespace-pre-wrap">{shape.text}</span>}
            {isEditing && (
              <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onBlur={saveText}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setText(shape.text || "");
                    setIsEditing(false);
                  }
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) saveText();
                }}
                className="w-full h-full resize-none bg-transparent outline-none text-center p-1 text-white"
              />
            )}
          </div>
        );

      case "triangle":
        return (
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: `${shape.width / 2}px solid transparent`,
              borderRight: `${shape.width / 2}px solid transparent`,
              borderBottom: `${shape.height}px solid ${shape.color}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onDoubleClick={() => setIsEditing(true)}
          >
            {/* we don't display text inside CSS triangle easily */}
          </div>
        );

      default: // rectangle
        return (
          <div
            style={{
              width: "100%",
              height: "100%",
              background: shape.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
            }}
            onDoubleClick={() => setIsEditing(true)}
          >
            {!isEditing && <span className="select-none whitespace-pre-wrap">{shape.text}</span>}
            {isEditing && (
              <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onBlur={saveText}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setText(shape.text || "");
                    setIsEditing(false);
                  }
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) saveText();
                }}
                className="w-full h-full resize-none bg-transparent outline-none text-center p-1 text-white"
              />
            )}
          </div>
        );
    }
  };

  return (
    <Rnd
      bounds="parent"
      size={{ width: shape.width, height: shape.height }}
      position={{ x: shape.x, y: shape.y }}
      onDragStop={(e, d) => onUpdate(shape.id, { x: d.x, y: d.y })}
      onResizeStop={(e, direction, ref, delta, position) =>
        onUpdate(shape.id, {
          width: parseInt(ref.style.width),
          height: parseInt(ref.style.height),
          ...position,
        })
      }
      onClick={(e: React.MouseEvent<Element, MouseEvent>) => onClick(e, shape.id)}
      onContextMenu={(e: React.MouseEvent<Element, MouseEvent>) => onContextMenu(e, shape.id)}
      enableResizing={shape.type !== "line"}
      style={{
        border: isSelected ? "2px solid #3b82f6" : "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "transparent",
      }}
    >
      {getShapeInner()}
    </Rnd>
  );
}
