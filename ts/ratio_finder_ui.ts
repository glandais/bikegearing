import { findChainringCombos } from "./ratio_finder.js";
import BikeGearingState from "./state.js";
import type {
  FinderInputs,
  RangeInputConfig,
  Point,
  ChainringsCombo,
} from "./types.js";

// Forward reference for BikeGearingMain to avoid circular dependency
interface MainInterface {
  resetComputer(): void;
}

interface RatioFinderInputRefs {
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
  [key: string]: HTMLInputElement | HTMLSelectElement;
}

export default class RatioFinderUi {
  state: BikeGearingState;
  main: MainInterface;
  onUiUpdate: () => void;

  modal: HTMLElement | null = null;
  overlay: HTMLElement | null = null;
  resultsContainer: HTMLElement | null = null;

  inputConfigs: RangeInputConfig[];
  inputs: Partial<RatioFinderInputRefs> = {};
  lastInputs: FinderInputs | null = null;
  expandedRows: Set<string> = new Set();
  dragStart: Point | null = null;

  // Bounds for dragging
  modalMinLeft: number = 0;
  modalMaxLeft: number = 0;
  modalMinTop: number = 0;
  modalMaxTop: number = 0;

  // Bound event handlers for cleanup
  boundMouseMove: ((e: MouseEvent | TouchEvent) => void) | null = null;
  boundMouseUp: ((e: MouseEvent | TouchEvent) => void) | null = null;

  constructor(
    state: BikeGearingState,
    main: MainInterface,
    onUiUpdate: () => void
  ) {
    this.state = state;
    this.main = main;
    this.onUiUpdate = onUiUpdate;
    this.inputConfigs = this.getInputConfigs();
  }

  getInputConfigs(): RangeInputConfig[] {
    return [
      {
        id: "csRange",
        label: "Chainstay (mm)",
        min: 350,
        max: 450,
        step: 1,
        defaultMin: 381,
        defaultMax: 396,
      },
      {
        id: "ratioRange",
        label: "Target Ratio",
        min: 1.5,
        max: 5.0,
        step: 0.1,
        defaultMin: 2.5,
        defaultMax: 3.8,
      },
      {
        id: "cogRange",
        label: "Cog Teeth",
        min: 10,
        max: 25,
        step: 1,
        defaultMin: 13,
        defaultMax: 21,
      },
      {
        id: "chainringRange",
        label: "Chainring Teeth",
        min: 32,
        max: 70,
        step: 1,
        defaultMin: 42,
        defaultMax: 55,
      },
      {
        id: "chainLinksRange",
        label: "Chain Links",
        min: 80,
        max: 130,
        step: 1,
        defaultMin: 80,
        defaultMax: 130,
      },
    ];
  }

  init(): void {
    this.createModal();
    this.createOpenButton();
    this.bindEvents();
  }

  createModal(): void {
    // Create overlay
    this.overlay = document.createElement("div");
    this.overlay.id = "ratio-finder-overlay";
    this.overlay.className = "ratio-finder-overlay";

    // Create modal
    this.modal = document.createElement("div");
    this.modal.id = "ratio-finder-modal";
    this.modal.className = "ratio-finder-modal";

    // Modal header
    const header = document.createElement("div");
    header.className = "ratio-finder-header";
    header.innerHTML = `
      <h2>Chainring Finder</h2>
      <button class="ratio-finder-close">&times;</button>
    `;

    // Modal content (inputs)
    const inputsSection = document.createElement("div");
    inputsSection.className = "ratio-finder-inputs";
    inputsSection.innerHTML = this.createInputsHtml();

    // Results section
    this.resultsContainer = document.createElement("div");
    this.resultsContainer.className = "ratio-finder-results";
    this.resultsContainer.innerHTML =
      '<p class="placeholder">Configure inputs and click "Find Combinations"</p>';

    // Footer with actions
    const footer = document.createElement("div");
    footer.className = "ratio-finder-footer";
    footer.innerHTML = `
      <button id="ratio-finder-search" class="ratio-finder-btn primary">Find Combinations</button>
      <button id="ratio-finder-cancel" class="ratio-finder-btn">Close</button>
    `;

    // Assemble modal
    this.modal.appendChild(header);
    this.modal.appendChild(inputsSection);
    this.modal.appendChild(this.resultsContainer);
    this.modal.appendChild(footer);

    // Add to DOM
    document.body.appendChild(this.overlay);
    document.body.appendChild(this.modal);

    // Store input references
    this.storeInputReferences();
  }

  createInputsHtml(): string {
    let html = '<div class="ratio-finder-input-grid">';

    for (const config of this.inputConfigs) {
      html += `
        <div class="ratio-finder-input-row">
          <label>${config.label}:</label>
          <div class="range-inputs">
            <input type="number" id="${config.id}Min"
                   min="${config.min}" max="${config.max}" step="${config.step}"
                   value="${config.defaultMin}">
            <span>to</span>
            <input type="number" id="${config.id}Max"
                   min="${config.min}" max="${config.max}" step="${config.step}"
                   value="${config.defaultMax}">
          </div>
        </div>
      `;
    }

    // Half-link checkbox
    html += `
      <div class="ratio-finder-input-row">
        <label>Half-link Chain:</label>
        <input type="checkbox" id="allowHalfLink">
        <span class="hint">(allows odd link counts)</span>
      </div>
    `;

    // Max Chain wear
    html += `
      <div class="ratio-finder-input-row">
        <label>Max Chain Wear (%):</label>
        <div class="range-inputs">
          <input type="number" id="maxChainWearInput" min="0" max="1" step="0.1" value="0.75">
        </div>
      </div>
    `;

    // Chainring count
    html += `
      <div class="ratio-finder-input-row">
        <label>Chainring Count:</label>
        <div class="range-inputs">
          <select id="chainringCountInput">
            <option value="1">1</option>
            <option value="2" selected>2</option>
            <option value="3">3</option>
          </select>
        </div>
      </div>
    `;

    html += "</div>";
    return html;
  }

  storeInputReferences(): void {
    for (const config of this.inputConfigs) {
      this.inputs[config.id + "Min"] = document.getElementById(
        config.id + "Min"
      ) as HTMLInputElement;
      this.inputs[config.id + "Max"] = document.getElementById(
        config.id + "Max"
      ) as HTMLInputElement;
    }
    this.inputs.allowHalfLink = document.getElementById(
      "allowHalfLink"
    ) as HTMLInputElement;
    this.inputs.maxChainWearInput = document.getElementById(
      "maxChainWearInput"
    ) as HTMLInputElement;
    this.inputs.chainringCountInput = document.getElementById(
      "chainringCountInput"
    ) as HTMLSelectElement;
  }

  createOpenButton(): void {
    const sidebar = document.getElementById("sidebar-content");
    if (!sidebar) return;

    const container = document.createElement("div");
    container.style.padding = "5px";
    const button = document.createElement("button");
    button.id = "openRatioFinder";
    button.textContent = "Chainring Finder";
    button.className = "ratio-finder-open-btn";
    container.appendChild(button);
    sidebar.appendChild(container);
  }

  bindEvents(): void {
    // Open button
    const openBtn = document.getElementById("openRatioFinder");
    if (openBtn) {
      openBtn.addEventListener("click", () => this.open());
    }

    if (!this.modal || !this.overlay) return;

    // Close buttons
    const closeBtn = this.modal.querySelector(".ratio-finder-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.close());
    }

    // Drag header
    const header = this.modal.querySelector(".ratio-finder-header");
    if (header) {
      header.addEventListener("mousedown", (e) =>
        this.onHeaderDown(e as MouseEvent)
      );
      header.addEventListener("touchstart", (e) =>
        this.onHeaderDown(e as TouchEvent)
      );
    }

    const cancelBtn = document.getElementById("ratio-finder-cancel");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => this.close());
    }

    this.overlay.addEventListener("click", () => this.close());

    // Search button
    const searchBtn = document.getElementById("ratio-finder-search");
    if (searchBtn) {
      searchBtn.addEventListener("click", () => this.search());
    }

    // ESC key to close
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isOpen()) {
        this.close();
      }
    });

    // Enter key to search
    this.modal.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && (e.target as HTMLElement).tagName === "INPUT") {
        this.search();
      }
    });
  }

  open(): void {
    if (this.overlay) this.overlay.classList.add("visible");
    if (this.modal) this.modal.classList.add("visible");
  }

  close(): void {
    if (this.overlay) this.overlay.classList.remove("visible");
    if (this.modal) this.modal.classList.remove("visible");
  }

  isOpen(): boolean {
    return this.modal?.classList.contains("visible") ?? false;
  }

  getEventLocation(e: MouseEvent | TouchEvent): Point | undefined {
    if ("touches" in e && e.touches && e.touches.length === 1) {
      return {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    } else if ("clientX" in e && e.clientX && e.clientY) {
      return {
        x: e.clientX,
        y: e.clientY,
      };
    }
    return undefined;
  }

  computeModalBounds(): void {
    if (!this.modal) return;
    const bodyRect = document.body.getBoundingClientRect();
    const modalRect = this.modal.getBoundingClientRect();
    this.modalMinLeft = bodyRect.x;
    this.modalMaxLeft = bodyRect.x + bodyRect.width - modalRect.width;
    this.modalMinTop = bodyRect.y;
    this.modalMaxTop = bodyRect.y + bodyRect.height - modalRect.height;
  }

  onHeaderDown(e: MouseEvent | TouchEvent): void {
    e.preventDefault();
    this.dragStart = this.getEventLocation(e) ?? null;
    this.computeModalBounds();
    if (this.dragStart && this.modal) {
      // Switch from centered transform to absolute positioning
      const modalRect = this.modal.getBoundingClientRect();
      this.modal.style.transform = "none";
      this.modal.style.left = modalRect.left + "px";
      this.modal.style.top = modalRect.top + "px";

      // Bind handlers for cleanup
      this.boundMouseMove = (e: MouseEvent | TouchEvent) =>
        this.onWindowMouseMove(e);
      this.boundMouseUp = () => this.onWindowMouseUp();

      document.addEventListener("mouseup", this.boundMouseUp);
      document.addEventListener("touchend", this.boundMouseUp);
      document.addEventListener("mousemove", this.boundMouseMove);
      document.addEventListener("touchmove", this.boundMouseMove, {
        passive: false,
      });
    }
  }

  onWindowMouseMove(e: MouseEvent | TouchEvent): void {
    e.preventDefault();
    const dragEnd = this.getEventLocation(e);
    if (dragEnd && this.dragStart && this.modal) {
      let left = this.modal.offsetLeft + dragEnd.x - this.dragStart.x;
      let top = this.modal.offsetTop + dragEnd.y - this.dragStart.y;
      left = Math.max(this.modalMinLeft, Math.min(this.modalMaxLeft, left));
      top = Math.max(this.modalMinTop, Math.min(this.modalMaxTop, top));
      this.modal.style.left = left + "px";
      this.modal.style.top = top + "px";
      this.dragStart = dragEnd;
    }
  }

  onWindowMouseUp(): void {
    if (this.boundMouseUp) {
      document.removeEventListener("mouseup", this.boundMouseUp);
      document.removeEventListener("touchend", this.boundMouseUp);
    }
    if (this.boundMouseMove) {
      document.removeEventListener("mousemove", this.boundMouseMove);
      document.removeEventListener("touchmove", this.boundMouseMove);
    }
  }

  getInputValues(): FinderInputs {
    const inputs = this.inputs as RatioFinderInputRefs;
    return {
      csMin: parseFloat(inputs.csRangeMin.value),
      csMax: parseFloat(inputs.csRangeMax.value),
      ratioMin: parseFloat(inputs.ratioRangeMin.value),
      ratioMax: parseFloat(inputs.ratioRangeMax.value),
      cogMin: parseInt(inputs.cogRangeMin.value),
      cogMax: parseInt(inputs.cogRangeMax.value),
      chainringMin: parseInt(inputs.chainringRangeMin.value),
      chainringMax: parseInt(inputs.chainringRangeMax.value),
      chainLinksMin: parseInt(inputs.chainLinksRangeMin.value),
      chainLinksMax: parseInt(inputs.chainLinksRangeMax.value),
      allowHalfLink: inputs.allowHalfLink.checked,
      maxChainWear: parseFloat(inputs.maxChainWearInput.value) / 100,
      chainringCount: parseInt(inputs.chainringCountInput.value),
    };
  }

  validateInputs(inputs: FinderInputs): string[] {
    const errors: string[] = [];

    if (inputs.csMin > inputs.csMax) {
      errors.push("Chainstay min must be \u2264 max");
    }
    if (inputs.ratioMin > inputs.ratioMax) {
      errors.push("Ratio min must be \u2264 max");
    }
    if (inputs.cogMin > inputs.cogMax) {
      errors.push("Cog min must be \u2264 max");
    }
    if (inputs.chainringMin > inputs.chainringMax) {
      errors.push("Chainring min must be \u2264 max");
    }
    if (inputs.chainLinksMin > inputs.chainLinksMax) {
      errors.push("Chain links min must be \u2264 max");
    }

    return errors;
  }

  search(): void {
    const inputs = this.getInputValues();

    // Validate inputs
    const errors = this.validateInputs(inputs);
    if (errors.length > 0 && this.resultsContainer) {
      this.resultsContainer.innerHTML = `<p class="no-results">Invalid inputs:<br>${errors.join(
        "<br>"
      )}</p>`;
      return;
    }

    this.lastInputs = inputs;
    this.expandedRows.clear();

    const results = findChainringCombos(inputs);
    this.renderResults(results);
  }

  renderResults(results: ChainringsCombo[]): void {
    if (!this.resultsContainer) return;

    if (results.length === 0) {
      this.resultsContainer.innerHTML =
        '<p class="no-results">No valid combinations found. Try expanding your ranges.</p>';
      return;
    }

    let html = `
      <table class="ratio-finder-table">
        <thead>
          <tr>
            <th></th>
            <th>Chainring</th>
            <th>Links</th>
            <th>Ratios</th>
            <th>Score</th>
            <th title="Coverage: how much of target ratio range is achieved">Cov</th>
            <th title="Count: number of available ratios (log scale)">Cnt</th>
            <th title="Evenness: how evenly spaced the ratios are">Even</th>
            <th>Max gap</th>
          </tr>
        </thead>
        <tbody>
    `;

    // Show top 50 results
    const displayResults = results.slice(0, 50);

    for (let i = 0; i < displayResults.length; i++) {
      const combo = displayResults[i];
      const rowId = `combo-${i}`;
      const validCogs = combo.validCogs;

      // Calculate min/max ratios for display
      let ratiosDisplay = "0";
      if (validCogs.length > 0) {
        const ratios = validCogs.map((c) => c.ratio);
        const minRatio = Math.min(...ratios).toFixed(2);
        const maxRatio = Math.max(...ratios).toFixed(2);
        ratiosDisplay = `${combo.ratioCount} (${minRatio} \u2192 ${maxRatio})`;
      }

      html += `
        <tr class="result-row" data-row-id="${rowId}"
            data-chainrings="${combo.chainrings}"
            data-chainlinks="${combo.chainLinks}"
            data-index="${i}">
          <td><span class="expand-icon">\u25B6</span></td>
          <td>${combo.chainrings.join(",")}T</td>
          <td>${combo.chainLinks}</td>
          <td>${ratiosDisplay}</td>
          <td>${(combo.score * 100).toFixed(0)}%</td>
          <td>${(combo.coverageScore * 100).toFixed(0)}%</td>
          <td>${(combo.countScore * 100).toFixed(0)}%</td>
          <td>${(combo.evennessScore * 100).toFixed(0)}%</td>
          <td>${combo.maxGap.toFixed(2)}</td>
        </tr>
      `;

      // Add expandable cog details rows
      for (const cog of combo.validCogs) {
        html += `
          <tr class="cog-details cog-detail-row"
              data-parent="${rowId}"
              data-chainring="${cog.chainring}"
              data-chainlinks="${combo.chainLinks}"
              data-cog="${cog.cog}"
              data-chainstay="${cog.chainstay.toFixed(2)}"
              data-chainstayWeared="${cog.chainstayWeared.toFixed(2)}">
            <td colspan="9">
              ${cog.chainring}x${cog.cog}:
              ratio ${cog.ratio.toFixed(2)}
              —
              cs: ${cog.chainstay.toFixed(1)}mm
              \u2192 ${cog.chainstayWeared.toFixed(1)}mm (weared)
              —
              sp : ${cog.skidPatchesSingleLegged} / ${cog.skidPatchesAmbidextrous}
            </td>
          </tr>
        `;
      }
    }

    html += "</tbody></table>";

    if (results.length > 50) {
      html += `<p class="more-results">Showing top 50 of ${results.length} combinations</p>`;
    }

    this.resultsContainer.innerHTML = html;

    // Add click handlers to result rows (expand/collapse)
    this.resultsContainer.querySelectorAll(".result-row").forEach((row) => {
      row.addEventListener("click", (e) =>
        this.toggleRow(row as HTMLElement, e)
      );
    });

    // Add click handlers to cog detail rows (apply configuration)
    this.resultsContainer.querySelectorAll(".cog-detail-row").forEach((row) => {
      row.addEventListener("click", (e) => {
        e.stopPropagation();
        this.applyFromCogRow(row as HTMLElement);
      });
    });
  }

  toggleRow(row: HTMLElement, _event: Event): void {
    const rowId = row.dataset.rowId;
    if (!rowId || !this.resultsContainer) return;

    const isExpanded = row.classList.contains("expanded");

    if (isExpanded) {
      // Collapse
      row.classList.remove("expanded");
      this.expandedRows.delete(rowId);
      this.resultsContainer
        .querySelectorAll(`.cog-details[data-parent="${rowId}"]`)
        .forEach((detail) => {
          detail.classList.remove("visible");
        });
    } else {
      // Expand
      row.classList.add("expanded");
      this.expandedRows.add(rowId);
      this.resultsContainer
        .querySelectorAll(`.cog-details[data-parent="${rowId}"]`)
        .forEach((detail) => {
          detail.classList.add("visible");
        });
    }
  }

  applyFromCogRow(row: HTMLElement): void {
    const chainring = parseInt(row.dataset.chainring ?? "0");
    const chainLinks = parseInt(row.dataset.chainlinks ?? "0");
    const cog = parseInt(row.dataset.cog ?? "0");
    const chainstay = parseFloat(row.dataset.chainstay ?? "0");

    this.applyConfiguration(chainring, chainLinks, cog, chainstay);
  }

  applyConfiguration(
    chainring: number,
    chainLinks: number,
    cog: number,
    chainstay: number
  ): void {
    // Apply to main simulation state
    this.state.f = chainring;
    this.state.r = cog;
    this.state.cl = chainLinks;
    this.state.cs = chainstay;

    // Reset and update simulation
    this.main.resetComputer();
    this.onUiUpdate();
  }
}
