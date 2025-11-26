import { HALF_LINK } from "./constants.js";

/**
 * Calculate required chainstay length for given chainring, cog, and chain length
 * Uses quadratic formula to solve for optimal chainstay distance
 * @param {number} f - chainring teeth
 * @param {number} r - cog teeth
 * @param {number} cl - chain links
 * @param {number} chainWear - chain wear factor (0-1, as percentage/100)
 * @returns {number|null} required chainstay in mm, or null if invalid
 */
function calculateChainstay(f, r, cl, chainWear) {
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
 * Calculate gear ratio
 * @param {number} f - chainring teeth
 * @param {number} r - cog teeth
 * @returns {number} gear ratio
 */
function calculateRatio(f, r) {
  return f / r;
}

/**
 * @typedef {Object} FinderInputs
 * @property {number} csMin - minimum chainstay (mm)
 * @property {number} csMax - maximum chainstay (mm)
 * @property {number} ratioMin - minimum target ratio
 * @property {number} ratioMax - maximum target ratio
 * @property {number} cogMin - minimum cog teeth
 * @property {number} cogMax - maximum cog teeth
 * @property {number} chainringMin - minimum chainring teeth
 * @property {number} chainringMax - maximum chainring teeth
 * @property {number} chainLinksMin - minimum chain links
 * @property {number} chainLinksMax - maximum chain links
 * @property {boolean} allowHalfLink - allow odd chain link counts
 * @property {number} maxChainWear - chain wear (0-0.01)
 */

/**
 * @typedef {Object} ValidCog
 * @property {number} cog - cog teeth
 * @property {number} ratio - gear ratio
 * @property {number} chainstay - required chainstay (mm)
 * @property {number} chainstayWeared - required chainstay (weared) (mm)
 * @property {boolean} inTargetRange - ratio within target range
 */

/**
 * @typedef {Object} ChainringCombo
 * @property {number} chainring - chainring teeth
 * @property {number} chainLinks - chain link count
 * @property {ValidCog[]} validCogs - list of valid cog configurations
 * @property {number} score - composite score
 * @property {number} ratioCount - count of ratios in target range
 * @property {number} ratioCoverage - percentage of target range covered
 */

/**
 * Find all valid cogs for a given chainring and chain length
 * @param {number} chainring
 * @param {number} chainLinks
 * @param {FinderInputs} inputs
 * @returns {ValidCog[]}
 */
function findValidCogs(chainring, chainLinks, inputs) {
  const validCogs = [];

  for (let cog = inputs.cogMin; cog <= inputs.cogMax; cog++) {
    const chainstay = calculateChainstay(
      chainring,
      cog,
      chainLinks,
      0
    );

    if (chainstay === null) continue;
    if (chainstay < inputs.csMin || chainstay > inputs.csMax) continue;

    const chainstayWeared = calculateChainstay(
      chainring,
      cog,
      chainLinks,
      inputs.maxChainWear
    );

    if (chainstayWeared === null) continue;
    if (chainstayWeared < inputs.csMin || chainstayWeared > inputs.csMax) continue;

    const ratio = calculateRatio(chainring, cog);
    const inTargetRange = ratio >= inputs.ratioMin && ratio <= inputs.ratioMax;

    validCogs.push({
      cog,
      ratio,
      chainstay,
      chainstayWeared,
      inTargetRange,
    });
  }

  // Sort by ratio descending (highest ratio = smallest cog first)
  validCogs.sort((a, b) => b.ratio - a.ratio);

  return validCogs;
}

/**
 * Calculate score for a chainring/chain combo
 * @param {ValidCog[]} validCogs
 * @param {FinderInputs} inputs
 * @returns {{score: number, ratioCount: number, ratioCoverage: number}}
 */
function calculateScore(validCogs, inputs) {
  const inRangeCogs = validCogs.filter((c) => c.inTargetRange);
  const ratioCount = inRangeCogs.length;

  if (ratioCount === 0) {
    return { score: 0, ratioCount: 0, ratioCoverage: 0 };
  }

  // Calculate ratio range coverage
  const ratios = inRangeCogs.map((c) => c.ratio);
  const minRatio = Math.min(...ratios);
  const maxRatio = Math.max(...ratios);
  const targetRange = inputs.ratioMax - inputs.ratioMin;
  const achievedRange = maxRatio - minRatio;
  const ratioCoverage = targetRange > 0 ? achievedRange / targetRange : 1;

  // Composite score: weight count more heavily, coverage as bonus
  const score = ratioCount * 10 + ratioCoverage * 5;

  return { score, ratioCount, ratioCoverage };
}

/**
 * Find the cog closest to the middle of the target ratio range
 * @param {ValidCog[]} validCogs
 * @param {FinderInputs} inputs
 * @returns {ValidCog|null}
 */
function findMiddleCog(validCogs, inputs) {
  const inRangeCogs = validCogs.filter((c) => c.inTargetRange);
  if (inRangeCogs.length === 0) {
    return validCogs.length > 0 ? validCogs[0] : null;
  }

  const middleRatio = (inputs.ratioMin + inputs.ratioMax) / 2;
  let closest = inRangeCogs[0];
  let minDiff = Math.abs(closest.ratio - middleRatio);

  for (const cog of inRangeCogs) {
    const diff = Math.abs(cog.ratio - middleRatio);
    if (diff < minDiff) {
      minDiff = diff;
      closest = cog;
    }
  }

  return closest;
}

/**
 * Main finder function - find all chainring/chain combinations
 * @param {FinderInputs} inputs
 * @returns {ChainringCombo[]}
 */
function findChainringCombos(inputs) {
  const results = [];

  for (
    let chainring = inputs.chainringMin;
    chainring <= inputs.chainringMax;
    chainring++
  ) {
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

export {
  calculateChainstay,
  calculateRatio,
  findChainringCombos,
  findValidCogs,
  calculateScore,
  findMiddleCog,
};
