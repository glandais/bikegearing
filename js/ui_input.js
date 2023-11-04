class BikeGearingInputRange {
  constructor(
    id,
    toHuman,
    valueGetter,
    valueSetter,
    valueFromInput = (v) => v,
    valueToInput = (v) => v,
  ) {
    this.inputElement = document.getElementById(id);
    this.spanElement = document.getElementById(id + "Value");
    this.toHuman = toHuman;
    this.valueSetter = valueSetter;
    this.valueGetter = valueGetter;
    this.valueFromInput = valueFromInput;
    this.valueToInput = valueToInput;

    this.inputElement.addEventListener("input", (e) => this.onInput(e));
  }

  onInput(e) {
    this.valueSetter(this.valueFromInput(1.0 * e.target.value));
    this.setTextValue();
  }
  setInputValue() {
    this.inputElement.value = this.valueToInput(this.valueGetter());
  }
  setTextValue() {
    if (this.spanElement) {
      this.spanElement.innerText = this.toHuman(this.inputElement.value);
    }
  }
  reset() {
    this.setInputValue();
    this.setTextValue();
  }
}

class BikeGearingInputCheckbox {
  constructor(id, valueGetter, valueSetter) {
    this.inputElement = document.getElementById(id);
    this.valueSetter = valueSetter;
    this.valueGetter = valueGetter;

    this.inputElement.addEventListener("change", (e) =>
      this.valueSetter(e.target.checked),
    );
  }
  reset() {
    this.inputElement.checked = this.valueGetter();
  }
}

export { BikeGearingInputRange, BikeGearingInputCheckbox };
