/**
 * Dynamic Artwork Generator
 * 
 * Generates unique, deterministic artwork based on conversation themes and data.
 * Uses Canvas API for local generation. In the future, this can be replaced
 * with LLM-generated images.
 */

import { useEffect, useState } from "react";

export interface ArtworkParams {
  themes: string[];
  agentIds?: string[];
  seed?: string; // For deterministic generation
  width?: number;
  height?: number;
}

// Seeded random number generator for deterministic artwork
class SeededRandom {
  private seed: number;

  constructor(seed: string) {
    this.seed = this.hashString(seed);
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }
}

// Theme to color mapping
const themeColors: Record<string, string> = {
  meaning: "oklch(0.65 0.25 280)",
  technology: "oklch(0.65 0.25 190)",
  creativity: "oklch(0.65 0.25 330)",
  identity: "oklch(0.65 0.25 35)",
  future: "oklch(0.65 0.25 210)",
  systems: "oklch(0.65 0.25 160)",
  sovereignty: "oklch(0.65 0.25 250)",
  expression: "oklch(0.65 0.25 310)",
  beauty: "oklch(0.65 0.25 50)",
  narrative: "oklch(0.65 0.25 70)",
  journey: "oklch(0.65 0.25 100)",
  consciousness: "oklch(0.65 0.25 270)",
};

// Parse OKLCH color to RGB using CSS color parsing
function oklchToRgb(oklch: string): [number, number, number] {
  // Use browser's CSS color parsing by creating a temporary element
  try {
    const tempDiv = document.createElement("div");
    tempDiv.style.color = oklch;
    document.body.appendChild(tempDiv);
    const computedColor = window.getComputedStyle(tempDiv).color;
    document.body.removeChild(tempDiv);
    
    // Parse rgb(r, g, b) format
    const match = computedColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
    }
  } catch (e) {
    // Fallback if parsing fails
  }
  
  // Fallback: parse OKLCH directly (simplified approximation)
  const match = oklch.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/);
  if (!match) return [139, 92, 246]; // Default purple
  
  const [, l, c, h] = match.map(Number);
  
  // Convert OKLCH to RGB (simplified approximation)
  // Convert hue to radians
  const hRad = (h * Math.PI) / 180;
  
  // Calculate chroma components
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);
  
  // Approximate OKLCH to RGB conversion
  // This is a simplified version - for production use a proper color library
  const lightness = l;
  const chroma = c;
  
  // Approximate conversion using perceptual color space
  const r = Math.max(0, Math.min(255, Math.round(lightness * 255 + chroma * Math.cos(hRad) * 100)));
  const g = Math.max(0, Math.min(255, Math.round(lightness * 255 + chroma * Math.cos(hRad - (2 * Math.PI / 3)) * 100)));
  const b2 = Math.max(0, Math.min(255, Math.round(lightness * 255 + chroma * Math.cos(hRad + (2 * Math.PI / 3)) * 100)));
  
  return [r, g, b2];
}

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [100, 100, 200];
}

function colorToRgb(color: string): [number, number, number] {
  if (color.startsWith("oklch")) {
    return oklchToRgb(color);
  }
  if (color.startsWith("#")) {
    return hexToRgb(color);
  }
  return [100, 100, 200]; // Default
}

export function generateArtwork(params: ArtworkParams): string {
  const { themes, agentIds = [], seed, width = 800, height = 800 } = params;
  
  // Create seed from themes and agentIds
  const seedString = seed || `${themes.join("-")}-${agentIds.join("-")}`;
  const rng = new SeededRandom(seedString);
  
  // Create canvas
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  
  if (!ctx) return "";
  
  // Get colors from themes
  const colors = themes
    .map(theme => themeColors[theme.toLowerCase()] || themeColors.meaning)
    .slice(0, 5); // Max 5 colors
  
  if (colors.length === 0) {
    colors.push(themeColors.meaning);
  }
  
  // Create gradient background
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  colors.forEach((color, i) => {
    const rgb = colorToRgb(color);
    const [r, g, b] = rgb;
    gradient.addColorStop(i / (colors.length - 1 || 1), `rgba(${r}, ${g}, ${b}, 0.8)`);
  });
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Add layered circles/patterns based on theme count
  const patternCount = Math.min(themes.length * 2, 8);
  
  for (let i = 0; i < patternCount; i++) {
    const x = rng.range(width * 0.2, width * 0.8);
    const y = rng.range(height * 0.2, height * 0.8);
    const radius = rng.range(width * 0.1, width * 0.3);
    const colorIndex = Math.floor(rng.range(0, colors.length));
    const rgb = colorToRgb(colors[colorIndex]);
    
    // Create gradient for circle
    const circleGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    circleGradient.addColorStop(0, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.3)`);
    circleGradient.addColorStop(1, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0)`);
    
    ctx.fillStyle = circleGradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Add connecting lines between points
  ctx.strokeStyle = `rgba(255, 255, 255, 0.2)`;
  ctx.lineWidth = 2;
  
  const points: Array<[number, number]> = [];
  for (let i = 0; i < Math.min(themes.length, 6); i++) {
    points.push([
      rng.range(width * 0.15, width * 0.85),
      rng.range(height * 0.15, height * 0.85),
    ]);
  }
  
  // Connect points
  for (let i = 0; i < points.length - 1; i++) {
    ctx.beginPath();
    ctx.moveTo(points[i][0], points[i][1]);
    ctx.lineTo(points[i + 1][0], points[i + 1][1]);
    ctx.stroke();
  }
  
  // Add particle effects
  for (let i = 0; i < 20; i++) {
    const x = rng.range(0, width);
    const y = rng.range(0, height);
    const size = rng.range(2, 6);
    const colorIndex = Math.floor(rng.range(0, colors.length));
    const rgb = colorToRgb(colors[colorIndex]);
    
    ctx.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.6)`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Add geometric shapes based on themes
  const shapeTypes = ["circle", "triangle", "square"];
  for (let i = 0; i < themes.length; i++) {
    const shapeType = shapeTypes[Math.floor(rng.range(0, shapeTypes.length))];
    const x = rng.range(width * 0.3, width * 0.7);
    const y = rng.range(height * 0.3, height * 0.7);
    const size = rng.range(30, 80);
    const rgb = colorToRgb(colors[i % colors.length]);
    
    ctx.strokeStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.5)`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    switch (shapeType) {
      case "circle":
        ctx.arc(x, y, size / 2, 0, Math.PI * 2);
        break;
      case "triangle":
        ctx.moveTo(x, y - size / 2);
        ctx.lineTo(x - size / 2, y + size / 2);
        ctx.lineTo(x + size / 2, y + size / 2);
        ctx.closePath();
        break;
      case "square":
        ctx.rect(x - size / 2, y - size / 2, size, size);
        break;
    }
    
    ctx.stroke();
  }
  
  return canvas.toDataURL("image/png");
}

/**
 * React hook for generating and caching artwork
 */
export function useArtwork(themes: string[], agentIds: string[] = [], seed?: string): string {
  const [artworkUrl, setArtworkUrl] = useState<string>("");
  
  useEffect(() => {
    if (themes.length > 0) {
      const url = generateArtwork({ themes, agentIds, seed });
      setArtworkUrl(url);
    }
  }, [themes.join(","), agentIds.join(","), seed]);
  
  return artworkUrl;
}

