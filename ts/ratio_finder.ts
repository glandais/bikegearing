import { HALF_LINK } from "./constants.js";
import { computeSkidPatches } from "./math.js";
import type {
  FinderInputs,
  ValidCog,
  ChainringCombo,
  ChainringsCombo,
} from "./types.js";

/**
 * Calculate required chainstay length for given chainring, cog, and chain length
 * Uses quadratic formula to solve for optimal chainstay distance
 */
export function calculateChainstay(
  f: number,
  r: number,
  cl: number,
  chainWear: number
): number | null {
  const effectiveHalfLink = HALF_LINK * (1 + chainWear);

  // Total chain length
  const L = cl * effectiveHalfLink;

  // Primitive radii
  const R = (f * effectiveHalfLink) / (2 * Math.PI);
  const r_small = (r * effectiveHalfLink) / (2 * Math.PI);

  // Quadratic equation: aD² + bD + c = 0
  const a = 2;
  const b = Math.PI * (R + r_small) - L;
  const c = Math.pow(R - r_small, 2);

  // Calculate discriminant
  const discriminant = b * b - 4 * a * c;

  if (discriminant < 0) {
    return null; // Chain too short
  }

  // Solve for D (chainstay distance)
  const D = (-b + Math.sqrt(discriminant)) / (2 * a);

  // Subtract 0.2mm to account for chain tension/tightness.
  // The theoretical chainstay assumes perfect geometry, but in practice
  // a slightly shorter distance ensures proper chain tension without slack.
  return D - 0.2;
}

/**
 * Find all valid cogs for a given chainring and chain length
 */
export function findValidCogs(
  chainring: number,
  chainLinks: number,
  inputs: FinderInputs
): ValidCog[] {
  const validCogs: ValidCog[] = [];

  for (let cog = inputs.cogMin; cog <= inputs.cogMax; cog++) {
    const ratio = chainring / cog;
    if (ratio < inputs.ratioMin || ratio > inputs.ratioMax) continue;

    const chainstay = calculateChainstay(chainring, cog, chainLinks, 0);

    if (chainstay === null) continue;
    if (chainstay < inputs.csMin || chainstay > inputs.csMax) continue;

    const chainstayWeared = calculateChainstay(
      chainring,
      cog,
      chainLinks,
      inputs.maxChainWear
    );

    if (chainstayWeared === null) continue;
    if (chainstayWeared < inputs.csMin || chainstayWeared > inputs.csMax)
      continue;

    const skidPatches = computeSkidPatches(chainring, cog);

    validCogs.push({
      chainring,
      cog,
      ratio,
      chainstay,
      chainstayWeared,
      skidPatchesSingleLegged: skidPatches[0],
      skidPatchesAmbidextrous: skidPatches[1],
    });
  }

  // Sort by ratio descending (highest ratio = smallest cog first)
  validCogs.sort((a, b) => b.ratio - a.ratio);

  return validCogs;
}

// Scoring weights
const COVERAGE_WEIGHT = 0.35;
const COUNT_WEIGHT = 0.3;
const EVENNESS_WEIGHT = 0.2;
const REUSABILITY_WEIGHT = 0.15;
const MAX_EXPECTED_RATIOS = 15;

/**
 * Calculate score for a chainring/chain combo
 * Score = coverage * (coverageWeight + countWeight * countScore + evennessWeight * evennessScore + reusabilityWeight * reusabilityScore)
 */
export function calculateScore(
  chainLinks: number,
  chainringComboList: ChainringCombo[],
  inputs: FinderInputs
): ChainringsCombo {
  const validCogs = chainringComboList.flatMap((c) => c.validCogs);
  const n = validCogs.length;
  const chainringCount = chainringComboList.length;

  // Edge case: no ratios
  if (n === 0) {
    return {
      chainLinks,
      chainrings: [],
      score: 0,
      maxGap: 0,
      ratioCount: 0,
      ratioCoverage: 0,
      validCogs,
      coverageScore: 0,
      countScore: 0,
      evennessScore: 0,
      reusabilityScore: 0,
    };
  }

  // Sort ratios ascending
  validCogs.sort((a, b) => a.ratio - b.ratio);
  const ratios = validCogs.map((c) => c.ratio);

  const minRatio = ratios[0];
  const maxRatio = ratios[n - 1];
  const achievedRange = maxRatio - minRatio;
  const targetRange = inputs.ratioMax - inputs.ratioMin;

  // Calculate gaps and maxGap
  const gaps: number[] = [];
  let maxGap = 0;
  for (let i = 1; i < n; i++) {
    const gap = ratios[i] - ratios[i - 1];
    gaps.push(gap);
    if (gap > maxGap) {
      maxGap = gap;
    }
  }

  // === COVERAGE SCORE ===
  let coverageScore: number;
  if (n === 1) {
    coverageScore = 0; // Single ratio cannot cover a range
  } else if (targetRange <= 0) {
    coverageScore = 1; // Trivially satisfied
  } else {
    coverageScore = Math.min(achievedRange / targetRange, 1.0);
  }

  // === COUNT SCORE (logarithmic with diminishing returns) ===
  const countScore = Math.min(
    Math.log(n + 1) / Math.log(MAX_EXPECTED_RATIOS + 1),
    1.0
  );

  // === EVENNESS SCORE (normalized RMSE from ideal gap) ===
  let evennessScore: number;
  if (n <= 2) {
    evennessScore = 1.0; // Trivially even (0 or 1 gap)
  } else {
    const idealGap = achievedRange / (n - 1);

    if (idealGap <= 0) {
      evennessScore = 1.0; // All ratios identical
    } else {
      let sumSquaredDev = 0;
      for (const gap of gaps) {
        sumSquaredDev += Math.pow(gap - idealGap, 2);
      }
      const rmse = Math.sqrt(sumSquaredDev / gaps.length);
      const normalizedRmse = rmse / idealGap;
      evennessScore = 1 / (1 + normalizedRmse);
    }
  }

  // === REUSABILITY SCORE (cog reuse across chainrings) ===
  let reusabilityScore: number;
  if (chainringCount <= 1) {
    reusabilityScore = 0; // No reusability possible with single chainring
  } else {
    // Count unique cogs
    const uniqueCogs = new Set(validCogs.map((c) => c.cog)).size;
    const totalUsages = n;

    // reusabilityScore = (totalUsages - uniqueCogs) / (uniqueCogs * (chainringCount - 1))
    // This ranges from 0 (no reuse) to 1 (perfect reuse: every cog works with every chainring)
    const maxReuse = uniqueCogs * (chainringCount - 1);
    if (maxReuse <= 0) {
      reusabilityScore = 0;
    } else {
      reusabilityScore = Math.min((totalUsages - uniqueCogs) / maxReuse, 1.0);
    }
  }

  // === FINAL SCORE ===
  const score =
    coverageScore *
    (COVERAGE_WEIGHT +
      COUNT_WEIGHT * countScore +
      EVENNESS_WEIGHT * evennessScore +
      REUSABILITY_WEIGHT * reusabilityScore);

  return {
    chainLinks,
    chainrings: chainringComboList.map(
      (chainringCombo) => chainringCombo.chainring
    ),
    score,
    ratioCount: n,
    ratioCoverage: coverageScore,
    maxGap,
    validCogs,
    coverageScore,
    countScore,
    evennessScore,
    reusabilityScore,
  };
}

function combinations<T>(arr: T[], n: number): T[][] {
  let result: T[][] = [];
  for (let i = 1; i <= n; i++) {
    result = result.concat(combinationsStrict(arr, i));
  }
  return result;
}

function combinationsStrict<T>(arr: T[], n: number): T[][] {
  if (n === 0) return [[]];
  if (n > arr.length) return [];

  const result: T[][] = [];

  function helper(start: number, combo: T[]) {
    if (combo.length === n) {
      result.push([...combo]);
      return;
    }

    for (let i = start; i < arr.length; i++) {
      combo.push(arr[i]);
      helper(i + 1, combo);
      combo.pop();
    }
  }

  helper(0, []);
  return result;
}

/**
 * Main finder function - find all chainring/chain combinations
 */
export function findChainringCombos(inputs: FinderInputs): ChainringsCombo[] {
  const results: ChainringsCombo[] = [];

  // Determine chain link iteration based on half-link option
  const startLinks = inputs.allowHalfLink
    ? inputs.chainLinksMin
    : inputs.chainLinksMin % 2 === 0
    ? inputs.chainLinksMin
    : inputs.chainLinksMin + 1;

  const linkStep = inputs.allowHalfLink ? 1 : 2;

  for (
    let chainLinks = startLinks;
    chainLinks <= inputs.chainLinksMax;
    chainLinks += linkStep
  ) {
    const chainrings: ChainringCombo[] = [];

    for (
      let chainring = inputs.chainringMin;
      chainring <= inputs.chainringMax;
      chainring++
    ) {
      const validCogs = findValidCogs(chainring, chainLinks, inputs);

      if (validCogs.length === 0) continue;

      // Only include if at least one ratio is in target range
      chainrings.push({
        chainring,
        validCogs,
      });
    }

    if (chainrings.length > 0) {
      const chainringComboListList = combinations(
        chainrings,
        inputs.chainringCount
      );
      for (const chainringComboList of chainringComboListList) {
        chainringComboList.sort((a, b) => a.chainring - b.chainring);
        results.push(calculateScore(chainLinks, chainringComboList, inputs));
      }
    }
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  return results;
}
