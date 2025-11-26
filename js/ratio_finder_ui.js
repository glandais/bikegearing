import {
  findChainringCombos,
} from "./ratio_finder.js";
import BikeGearingState from "./state.js";
import BikeGearingMain from "./main.js";

/**
 * @typedef {Object} RangeInputConfig
 * @property {string} id
 * @property {string} label
 * @property {number} min
 * @property {number} max
 * @property {number} step
 * @property {number} defaultMin
 * @property {number} defaultMax
 */

class RatioFinderUi {
  /**
   * @param {BikeGearingState} state
   * @param {BikeGearingMain} main
   * @param {Function} onUiUpdate - callback to update main UI
   */
  constructor(state, main, onUiUpdate) {
    this.state = state;
    this.main = main;
    this.onUiUpdate = onUiUpdate;

    /** @type {HTMLElement} */
    this.modal = null;
    /** @type {HTMLElement} */
    this.overlay = null;
    /** @type {HTMLElement} */
    this.resultsContainer = null;

    this.inputConfigs = this.getInputConfigs();
    this.inputs = {};
    this.lastInputs = null;
    this.expandedRows = new Set();
    this.dragStart = null;
  }

  getInputConfigs() {
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
        defaultMin: 2.6,
        defaultMax: 3.4,
      },
      {
        id: "cogRange",
        label: "Cog Teeth",
        min: 10,
        max: 25,
        step: 1,
        defaultMin: 13,
        defaultMax: 19,
      },
      {
        id: "chainringRange",
        label: "Chainring Teeth",
        min: 32,
        max: 60,
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

  init() {
    this.createModal();
    this.createOpenButton();
    this.bindEvents();
  }

  createModal() {
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

  createInputsHtml() {
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
            <option value="1" selected>1</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </select>
        </div>
      </div>
    `;

    html += "</div>";
    return html;
  }

  storeInputReferences() {
    for (const config of this.inputConfigs) {
      this.inputs[config.id + "Min"] = document.getElementById(
        config.id + "Min"
      );
      this.inputs[config.id + "Max"] = document.getElementById(
        config.id + "Max"
      );
    }
    this.inputs.allowHalfLink = document.getElementById("allowHalfLink");
    this.inputs.maxChainWearInput = document.getElementById("maxChainWearInput");
    this.inputs.chainringCountInput = document.getElementById("chainringCountInput");
  }

  createOpenButton() {
    const sidebar = document.getElementById("sidebar-content");
    const container = document.createElement("div");
    container.style.padding = "5px";
    const button = document.createElement("button");
    button.id = "openRatioFinder";
    button.textContent = "Chainring Finder";
    button.className = "ratio-finder-open-btn";
    container.appendChild(button);
    sidebar.appendChild(container);
  }

  bindEvents() {
    // Open button
    document
      .getElementById("openRatioFinder")
      .addEventListener("click", () => this.open());

    // Close buttons
    this.modal
      .querySelector(".ratio-finder-close")
      .addEventListener("click", () => this.close());

    // Drag header
    const header = this.modal.querySelector(".ratio-finder-header");
    header.addEventListener("mousedown", (e) => this.onHeaderDown(e));
    header.addEventListener("touchstart", (e) => this.onHeaderDown(e));
    document
      .getElementById("ratio-finder-cancel")
      .addEventListener("click", () => this.close());
    this.overlay.addEventListener("click", () => this.close());

    // Search button
    document
      .getElementById("ratio-finder-search")
      .addEventListener("click", () => this.search());

    // ESC key to close
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isOpen()) {
        this.close();
      }
    });

    // Enter key to search
    this.modal.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && e.target.tagName === "INPUT") {
        this.search();
      }
    });
  }

  open() {
    this.overlay.classList.add("visible");
    this.modal.classList.add("visible");
  }

  close() {
    this.overlay.classList.remove("visible");
    this.modal.classList.remove("visible");
  }

  isOpen() {
    return this.modal.classList.contains("visible");
  }

  getEventLocation(e) {
    if (e.touches && e.touches.length == 1) {
      return {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    } else if (e.clientX && e.clientY) {
      return {
        x: e.clientX,
        y: e.clientY,
      };
    }
  }

  computeModalBounds() {
    let bodyRect = document.body.getBoundingClientRect();
    let modalRect = this.modal.getBoundingClientRect();
    this.modalMinLeft = bodyRect.x;
    this.modalMaxLeft = bodyRect.x + bodyRect.width - modalRect.width;
    this.modalMinTop = bodyRect.y;
    this.modalMaxTop = bodyRect.y + bodyRect.height - modalRect.height;
  }

  onHeaderDown(e) {
    e.preventDefault();
    this.dragStart = this.getEventLocation(e);
    this.computeModalBounds();
    if (this.dragStart) {
      // Switch from centered transform to absolute positioning
      let modalRect = this.modal.getBoundingClientRect();
      this.modal.style.transform = "none";
      this.modal.style.left = modalRect.left + "px";
      this.modal.style.top = modalRect.top + "px";

      // Bind handlers for cleanup
      this.boundMouseMove = (e) => this.onWindowMouseMove(e);
      this.boundMouseUp = (e) => this.onWindowMouseUp(e);

      document.addEventListener("mouseup", this.boundMouseUp);
      document.addEventListener("touchend", this.boundMouseUp);
      document.addEventListener("mousemove", this.boundMouseMove);
      document.addEventListener("touchmove", this.boundMouseMove, {
        passive: false,
      });
    }
  }

  onWindowMouseMove(e) {
    e.preventDefault();
    let dragEnd = this.getEventLocation(e);
    if (dragEnd) {
      let left = this.modal.offsetLeft + dragEnd.x - this.dragStart.x;
      let top = this.modal.offsetTop + dragEnd.y - this.dragStart.y;
      left = Math.max(this.modalMinLeft, Math.min(this.modalMaxLeft, left));
      top = Math.max(this.modalMinTop, Math.min(this.modalMaxTop, top));
      this.modal.style.left = left + "px";
      this.modal.style.top = top + "px";
      this.dragStart = dragEnd;
    }
  }

  onWindowMouseUp() {
    document.removeEventListener("mouseup", this.boundMouseUp);
    document.removeEventListener("touchend", this.boundMouseUp);
    document.removeEventListener("mousemove", this.boundMouseMove);
    document.removeEventListener("touchmove", this.boundMouseMove);
  }

  getInputValues() {
    return {
      csMin: parseFloat(this.inputs.csRangeMin.value),
      csMax: parseFloat(this.inputs.csRangeMax.value),
      ratioMin: parseFloat(this.inputs.ratioRangeMin.value),
      ratioMax: parseFloat(this.inputs.ratioRangeMax.value),
      cogMin: parseInt(this.inputs.cogRangeMin.value),
      cogMax: parseInt(this.inputs.cogRangeMax.value),
      chainringMin: parseInt(this.inputs.chainringRangeMin.value),
      chainringMax: parseInt(this.inputs.chainringRangeMax.value),
      chainLinksMin: parseInt(this.inputs.chainLinksRangeMin.value),
      chainLinksMax: parseInt(this.inputs.chainLinksRangeMax.value),
      allowHalfLink: this.inputs.allowHalfLink.checked,
      maxChainWear: parseFloat(this.inputs.maxChainWearInput.value) / 100,
      chainringCount: parseInt(this.inputs.chainringCountInput.value),
    };
  }

  validateInputs(inputs) {
    const errors = [];

    if (inputs.csMin > inputs.csMax) {
      errors.push("Chainstay min must be ≤ max");
    }
    if (inputs.ratioMin > inputs.ratioMax) {
      errors.push("Ratio min must be ≤ max");
    }
    if (inputs.cogMin > inputs.cogMax) {
      errors.push("Cog min must be ≤ max");
    }
    if (inputs.chainringMin > inputs.chainringMax) {
      errors.push("Chainring min must be ≤ max");
    }
    if (inputs.chainLinksMin > inputs.chainLinksMax) {
      errors.push("Chain links min must be ≤ max");
    }

    return errors;
  }

  search() {
    const inputs = this.getInputValues();

    // Validate inputs
    const errors = this.validateInputs(inputs);
    if (errors.length > 0) {
      this.resultsContainer.innerHTML = `<p class="no-results">Invalid inputs:<br>${errors.join("<br>")}</p>`;
      return;
    }

    this.lastInputs = inputs;
    this.expandedRows.clear();

    const results = findChainringCombos(inputs);
    this.renderResults(results);
  }

  renderResults(results) {
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
        ratiosDisplay = `${combo.ratioCount} (${minRatio} → ${maxRatio})`;
      }

      html += `
        <tr class="result-row" data-row-id="${rowId}"
            data-chainring="${combo.chainring}"
            data-chainlinks="${combo.chainLinks}"
            data-index="${i}">
          <td><span class="expand-icon">▶</span></td>
          <td>${combo.chainring}T</td>
          <td>${combo.chainLinks}</td>
          <td>${ratiosDisplay}</td>
          <td>${combo.score.toFixed(1)}</td>
        </tr>
      `;

      // Add expandable cog details rows
      for (const cog of combo.validCogs) {
        html += `
          <tr class="cog-details cog-detail-row"
              data-parent="${rowId}"
              data-chainring="${combo.chainring}"
              data-chainlinks="${combo.chainLinks}"
              data-cog="${cog.cog}"
              data-chainstay="${cog.chainstay.toFixed(2)}"
              data-chainstayWeared="${cog.chainstayWeared.toFixed(2)}">
            <td colspan="5">
              ${cog.cog}T: ratio ${cog.ratio.toFixed(2)} (cs: ${cog.chainstay.toFixed(1)}mm → ${cog.chainstayWeared.toFixed(1)}mm (weared))              
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
      row.addEventListener("click", (e) => this.toggleRow(row, e));
    });

    // Add click handlers to cog detail rows (apply configuration)
    this.resultsContainer.querySelectorAll(".cog-detail-row").forEach((row) => {
      row.addEventListener("click", (e) => {
        e.stopPropagation();
        this.applyFromCogRow(row);
      });
    });
  }

  toggleRow(row, event) {
    const rowId = row.dataset.rowId;
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

  applyFromCogRow(row) {
    const chainring = parseInt(row.dataset.chainring);
    const chainLinks = parseInt(row.dataset.chainlinks);
    const cog = parseInt(row.dataset.cog);
    const chainstay = parseFloat(row.dataset.chainstay);

    this.applyConfiguration(chainring, chainLinks, cog, chainstay);
  }

  applyConfiguration(chainring, chainLinks, cog, chainstay) {
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

export default RatioFinderUi;
