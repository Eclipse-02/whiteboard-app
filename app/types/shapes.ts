export type ShapeType = "rectangle" | "circle" | "triangle" | "line";

export interface ShapeData {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  text?: string;
  isSelected?: boolean;
}
