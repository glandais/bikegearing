export class BikeGearingInputRange {
  inputElement: HTMLInputElement;
  spanElement: HTMLElement | null;
  toHuman: (v: string) => string;
  valueSetter: (v: number) => void;
  valueGetter: () => number;
  valueFromInput: (v: number) => number;
  valueToInput: (v: number) => number;

  constructor(
    id: string,
    toHuman: (v: string) => string,
    valueGetter: () => number,
    valueSetter: (v: number) => void,
    valueFromInput: (v: number) => number = (v) => v,
    valueToInput: (v: number) => number = (v) => v
  ) {
    const inputEl = document.getElementById(id);
    if (!inputEl || !(inputEl instanceof HTMLInputElement)) {
      throw new Error(`Input element with id '${id}' not found`);
    }
    this.inputElement = inputEl;
    this.spanElement = document.getElementById(id + "Value");
    this.toHuman = toHuman;
    this.valueSetter = valueSetter;
    this.valueGetter = valueGetter;
    this.valueFromInput = valueFromInput;
    this.valueToInput = valueToInput;

    this.inputElement.addEventListener("input", (e) => this.onInput(e));
  }

  onInput(e: Event): void {
    try {
      const target = e.target as HTMLInputElement;
      const inputValue = parseFloat(target.value);
      if (!isNaN(inputValue)) {
        this.valueSetter(this.valueFromInput(inputValue));
        this.setTextValue();
      }
    } catch (error) {
      console.error("Input validation error:", error);
    }
  }

  setInputValue(): void {
    this.inputElement.value = String(this.valueToInput(this.valueGetter()));
  }

  setTextValue(): void {
    if (this.spanElement) {
      try {
        this.spanElement.innerText = this.toHuman(this.inputElement.value);
      } catch (error) {
        console.error("Text display error:", error);
        this.spanElement.innerText = "Error";
      }
    }
  }

  reset(): void {
    this.setInputValue();
    this.setTextValue();
  }
}

export class BikeGearingInputCheckbox {
  inputElement: HTMLInputElement;
  valueSetter: (v: boolean) => void;
  valueGetter: () => boolean;

  constructor(
    id: string,
    valueGetter: () => boolean,
    valueSetter: (v: boolean) => void
  ) {
    const inputEl = document.getElementById(id);
    if (!inputEl || !(inputEl instanceof HTMLInputElement)) {
      throw new Error(`Checkbox element with id '${id}' not found`);
    }
    this.inputElement = inputEl;
    this.valueSetter = valueSetter;
    this.valueGetter = valueGetter;

    this.inputElement.addEventListener("change", (e) => {
      const target = e.target as HTMLInputElement;
      this.valueSetter(target.checked);
    });
  }

  reset(): void {
    this.inputElement.checked = this.valueGetter();
  }
}
