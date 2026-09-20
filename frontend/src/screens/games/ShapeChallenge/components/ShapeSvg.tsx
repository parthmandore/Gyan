/**
 * Purpose: Crisp vector SVG rendering for geometric shapes in Shape Challenge.
 *          Implements mathematical coordinates for 18 distinct shapes with support
 *          for size, fill, stroke, and bevel accents.
 * Module: Shape Challenge — Components
 * Folder: frontend/src/screens/games/ShapeChallenge/components
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
  size = 100,
  color = '#3B82F6',
  strokeColor = '#1E293B',
  strokeWidth = 3,
}) => {
  const s = size;
  const cx = s / 2;
  const cy = s / 2;

  // Helper to generate regular polygon points
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

  // Helper for 5-pointed star
  const getStarPoints = (outerR: number, innerR: number): string => {
    const points: string[] = [];
    const angleStep = Math.PI / 5;
    const startAngle = -Math.PI / 2;

    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const angle = startAngle + i * angleStep;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
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
            r={s * 0.4}
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
            points={`${cx},${s * 0.1} ${s * 0.9},${s * 0.86} ${s * 0.1},${s * 0.86}`}
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

      case 'star':
        return (
          <Polygon
            points={getStarPoints(s * 0.44, s * 0.2)}
            fill={color}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
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
            points={`${cx},${s * 0.08} ${s * 0.9},${cy} ${cx},${s * 0.92} ${s * 0.1},${cy}`}
            fill={color}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
        );

      case 'pentagon':
        return (
          <Polygon
            points={getRegularPolygonPoints(5, s * 0.42)}
            fill={color}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
        );

      case 'hexagon':
        return (
          <Polygon
            points={getRegularPolygonPoints(6, s * 0.42, 30)}
            fill={color}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
        );

      case 'heart':
        return (
          <Path
            d={`M ${cx} ${s * 0.82} C ${s * 0.1} ${s * 0.52}, ${s * 0.1} ${s * 0.22}, ${s * 0.35} ${s * 0.22} C ${s * 0.44} ${s * 0.22}, ${cx} ${s * 0.32}, ${cx} ${s * 0.32} C ${cx} ${s * 0.32}, ${s * 0.56} ${s * 0.22}, ${s * 0.65} ${s * 0.22} C ${s * 0.9} ${s * 0.22}, ${s * 0.9} ${s * 0.52}, ${cx} ${s * 0.82} Z`}
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

      case 'octagon':
        return (
          <Polygon
            points={getRegularPolygonPoints(8, s * 0.42, 22.5)}
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
            points={`${cx},${s * 0.12} ${s * 0.88},${cy} ${cx},${s * 0.88} ${s * 0.12},${cy}`}
            fill={color}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
        );

      case 'semicircle':
        return (
          <Path
            d={`M ${s * 0.12} ${s * 0.72} A ${s * 0.38} ${s * 0.38} 0 0 1 ${s * 0.88} ${s * 0.72} Z`}
            fill={color}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
        );

      case 'cross':
        const w = s * 0.24;
        const o = (s - w) / 2;
        const e = s * 0.1;
        return (
          <Polygon
            points={`
              ${o},${e} ${o + w},${e} ${o + w},${o} ${s - e},${o} 
              ${s - e},${o + w} ${o + w},${o + w} ${o + w},${s - e} ${o},${s - e} 
              ${o},${o + w} ${e},${o + w} ${e},${o} ${o},${o}
            `}
            fill={color}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
        );

      case 'decagon':
        return (
          <Polygon
            points={getRegularPolygonPoints(10, s * 0.42, 18)}
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
            r={s * 0.4}
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
