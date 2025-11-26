// Core geometry types
export interface Point {
  x: number;
  y: number;
}

// Camera offset for interactive view
export interface CameraOffset {
  x: number;
  y: number;
}

// Cog geometry data
export interface CogGeometry {
  n: number; // tooth count
  r: number; // radius
  a: number; // current angle
  da: number; // angle step per tooth
}

// Circle intersection result
export interface CircleIntersectionResult {
  intersectCount: number | null;
  intersectOccurs: boolean;
  oneIsInOther: boolean;
  areEqual: boolean;
  p1: Point;
  p2: Point;
}

// Wheel dimensions
export interface WheelDimensions {
  total: number;
  rim: number;
  brakeHeight: number;
  rimHeight: number;
  hub: number;
  hubSpoke: number;
}

// Ratio finder types
export interface FinderInputs {
  csMin: number;
  csMax: number;
  ratioMin: number;
  ratioMax: number;
  cogMin: number;
  cogMax: number;
  chainringMin: number;
  chainringMax: number;
  chainLinksMin: number;
  chainLinksMax: number;
  allowHalfLink: boolean;
  maxChainWear: number;
  chainringCount: number;
}

export interface ValidCog {
  chainring: number;
  cog: number;
  ratio: number;
  chainstay: number;
  chainstayWeared: number;
}

export interface ChainringCombo {
  chainring: number;
  validCogs: ValidCog[];
}

export interface ChainringsCombo {
  chainrings: number[];
  chainLinks: number;
  validCogs: ValidCog[];
  score: number;
  ratioCount: number;
  ratioCoverage: number;
  maxGap: number;
}

// Range input configuration for ratio finder UI
export interface RangeInputConfig {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  defaultMin: number;
  defaultMax: number;
}

// Input references for ratio finder
export interface RatioFinderInputRefs {
  csRangeMin: HTMLInputElement;
  csRangeMax: HTMLInputElement;
  ratioRangeMin: HTMLInputElement;
  ratioRangeMax: HTMLInputElement;
  cogRangeMin: HTMLInputElement;
  cogRangeMax: HTMLInputElement;
  chainringRangeMin: HTMLInputElement;
  chainringRangeMax: HTMLInputElement;
  chainLinksRangeMin: HTMLInputElement;
  chainLinksRangeMax: HTMLInputElement;
  allowHalfLink: HTMLInputElement;
  maxChainWearInput: HTMLInputElement;
  chainringCountInput: HTMLSelectElement;
}

// Canvas drawing context type alias
export type Ctx2D = CanvasRenderingContext2D;
