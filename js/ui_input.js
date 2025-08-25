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
    try {
      const inputValue = parseFloat(e.target.value);
      if (!isNaN(inputValue)) {
        this.valueSetter(this.valueFromInput(inputValue));
        this.setTextValue();
      }
    } catch (error) {
      console.error('Input validation error:', error);
    }
  }
  setInputValue() {
    this.inputElement.value = this.valueToInput(this.valueGetter());
  }
  setTextValue() {
    if (this.spanElement) {
      try {
        this.spanElement.innerText = this.toHuman(this.inputElement.value);
      } catch (error) {
        console.error('Text display error:', error);
        this.spanElement.innerText = 'Error';
      }
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
