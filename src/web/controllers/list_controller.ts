import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["container"];
  declare readonly containerTarget: HTMLSelectElement;

  debouncedChangeTimeout: undefined | number;
  debouncedChangeTimeoutMs = 250;

  connect() {
    this.containerTarget.addEventListener("change", (event) => {
      const target = event.target as HTMLSelectElement;
      const selectedOptions = Array.from(target.selectedOptions);
      selectedOptions.shift();
      selectedOptions.forEach((option) => (option.selected = false));
    });
    this.containerTarget.addEventListener("change", () => {
      clearTimeout(this.debouncedChangeTimeout);
      this.debouncedChangeTimeout = setTimeout(
        this.debouncedChangeHandler.bind(this),
        this.debouncedChangeTimeoutMs,
        {} // FIXME: disambiguate polymorphism like a non-monkey
      );
    });
  }

  ingestOptions({
    detail: { options },
  }: CustomEvent<{ options: { label: string; value: string }[] }>) {
    while (this.containerTarget.options.length > 0)
      this.containerTarget.remove(0);

    options.forEach((item) => {
      const option = document.createElement("option");
      option.value = item.value;
      option.textContent = item.label;
      this.containerTarget.appendChild(option);
    });
  }

  disconnect() {
    //
  }

  debouncedChangeHandler() {
    if (this.containerTarget.selectedOptions.length < 1) return;
    const selection = Array.from(this.containerTarget.selectedOptions)[0].value;
    this.dispatch("selectionChanged", { detail: { selection } });
  }
}
