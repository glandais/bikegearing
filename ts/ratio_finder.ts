import { HALF_LINK } from "./constants.js";
import type { FinderInputs, ValidCog, ChainringCombo, ScoreResult } from "./types.js";

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

    validCogs.push({
      cog,
      ratio,
      chainstay,
      chainstayWeared,
    });
  }

  // Sort by ratio descending (highest ratio = smallest cog first)
  validCogs.sort((a, b) => b.ratio - a.ratio);

  return validCogs;
}

/**
 * Calculate score for a chainring/chain combo
 */
export function calculateScore(
  validCogs: ValidCog[],
  inputs: FinderInputs
): ScoreResult {
  const ratioCount = validCogs.length;

  if (ratioCount === 0) {
    return { score: 0, ratioCount: 0, ratioCoverage: 0 };
  }

  // Calculate ratio range coverage
  const ratios = validCogs.map((c) => c.ratio);
  const minRatio = Math.min(...ratios);
  const maxRatio = Math.max(...ratios);
  const targetRange = inputs.ratioMax - inputs.ratioMin;
  const achievedRange = maxRatio - minRatio;
  const ratioCoverage = targetRange > 0 ? achievedRange / targetRange : 1;

  return { score: ratioCoverage, ratioCount, ratioCoverage };
}

/**
 * Main finder function - find all chainring/chain combinations
 */
export function findChainringCombos(inputs: FinderInputs): ChainringCombo[] {
  const results: ChainringCombo[] = [];

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
    for (
      let chainring = inputs.chainringMin;
      chainring <= inputs.chainringMax;
      chainring++
    ) {
      const validCogs = findValidCogs(chainring, chainLinks, inputs);

      if (validCogs.length === 0) continue;

      const { score, ratioCount, ratioCoverage } = calculateScore(
        validCogs,
        inputs
      );

      // Only include if at least one ratio is in target range
      if (ratioCount > 0) {
        results.push({
          chainring,
          chainLinks,
          validCogs,
          score,
          ratioCount,
          ratioCoverage,
        });
      }
    }
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  return results;
}
