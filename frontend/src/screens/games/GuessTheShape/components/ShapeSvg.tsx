/**
 * Purpose: Crisp vector SVG rendering for geometric shapes in Guess the Shape.
 *          Supports all Age 6 & Age 7 shapes including regular polygons (up to decagon),
 *          quadrilaterals, and curved shapes.
 * Module: Guess the Shape — Components
 * Folder: frontend/src/screens/games/GuessTheShape/components
 */

import React from 'react';
import Svg, { Circle, Rect, Polygon, Path, Ellipse } from 'react-native-svg';
import { ShapeId } from '../types';

export interface ShapeSvgProps {
  shapeId: ShapeId;
  size?: number;
  color?: string;
  strokeColor?: string;
  strokeWidth?: number;
}

export const ShapeSvg: React.FC<ShapeSvgProps> = React.memo(({
  shapeId,
  size = 140,
  color = '#3B82F6',
  strokeColor = '#1E293B',
  strokeWidth = 4,
}) => {
  const s = size;
  const cx = s / 2;
  const cy = s / 2;

  // Helper to generate regular polygon vertices
  const getRegularPolygonPoints = (sides: number, radius: number, rotationDeg: number = 0): string => {
    const points: string[] = [];
    const angleStep = (2 * Math.PI) / sides;
    const startAngle = (rotationDeg * Math.PI) / 180 - Math.PI / 2;

    for (let i = 0; i < sides; i++) {
      const angle = startAngle + i * angleStep;
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return points.join(' ');
  };

  const renderShapeElement = () => {
    switch (shapeId) {
      case 'circle':
        return (
          <Circle
            cx={cx}
            cy={cy}
            r={s * 0.42}
            fill={color}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        );

      case 'square':
        return (
          <Rect
            x={s * 0.12}
            y={s * 0.12}
            width={s * 0.76}
            height={s * 0.76}
            rx={s * 0.08}
            fill={color}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        );

      case 'triangle':
        return (
          <Polygon
            points={`${cx},${s * 0.1} ${s * 0.92},${s * 0.88} ${s * 0.08},${s * 0.88}`}
            fill={color}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
        );

      case 'rectangle':
        return (
          <Rect
            x={s * 0.08}
            y={s * 0.22}
            width={s * 0.84}
            height={s * 0.56}
            rx={s * 0.08}
            fill={color}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        );

      case 'oval':
        return (
          <Ellipse
            cx={cx}
            cy={cy}
            rx={s * 0.44}
            ry={s * 0.28}
            fill={color}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        );

      case 'diamond':
        return (
          <Polygon
            points={`${cx},${s * 0.08} ${s * 0.92},${cy} ${cx},${s * 0.92} ${s * 0.08},${cy}`}
            fill={color}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
        );

      case 'pentagon':
        return (
          <Polygon
            points={getRegularPolygonPoints(5, s * 0.44)}
            fill={color}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
        );

      case 'hexagon':
        return (
          <Polygon
            points={getRegularPolygonPoints(6, s * 0.44, 30)}
            fill={color}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
        );

      case 'octagon':
        return (
          <Polygon
            points={getRegularPolygonPoints(8, s * 0.44, 22.5)}
            fill={color}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
        );

      case 'nonagon':
        return (
          <Polygon
            points={getRegularPolygonPoints(9, s * 0.44, 20)}
            fill={color}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
        );

      case 'decagon':
        return (
          <Polygon
            points={getRegularPolygonPoints(10, s * 0.44, 18)}
            fill={color}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
        );

      case 'trapezoid':
        return (
          <Polygon
            points={`${s * 0.25},${s * 0.2} ${s * 0.75},${s * 0.2} ${s * 0.92},${s * 0.8} ${s * 0.08},${s * 0.8}`}
            fill={color}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
        );

      case 'parallelogram':
        return (
          <Polygon
            points={`${s * 0.28},${s * 0.22} ${s * 0.92},${s * 0.22} ${s * 0.72},${s * 0.78} ${s * 0.08},${s * 0.78}`}
            fill={color}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
        );

      case 'rhombus':
        return (
          <Polygon
            points={`${cx},${s * 0.12} ${s * 0.9},${cy} ${cx},${s * 0.88} ${s * 0.1},${cy}`}
            fill={color}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
        );

      case 'heart':
        return (
          <Path
            d={`M ${cx} ${s * 0.84} C ${s * 0.08} ${s * 0.52}, ${s * 0.08} ${s * 0.2}, ${s * 0.35} ${s * 0.2} C ${s * 0.44} ${s * 0.2}, ${cx} ${s * 0.32}, ${cx} ${s * 0.32} C ${cx} ${s * 0.32}, ${s * 0.56} ${s * 0.2}, ${s * 0.65} ${s * 0.2} C ${s * 0.92} ${s * 0.2}, ${s * 0.92} ${s * 0.52}, ${cx} ${s * 0.84} Z`}
            fill={color}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
        );

      case 'crescent':
        return (
          <Path
            d={`M ${s * 0.72} ${s * 0.12} A ${s * 0.4} ${s * 0.4} 0 1 0 ${s * 0.72} ${s * 0.88} A ${s * 0.32} ${s * 0.32} 0 0 1 ${s * 0.72} ${s * 0.12} Z`}
            fill={color}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
        );

      default:
        return (
          <Circle
            cx={cx}
            cy={cy}
            r={s * 0.42}
            fill={color}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        );
    }
  };

  return (
    <Svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
      {renderShapeElement()}
    </Svg>
  );
});
