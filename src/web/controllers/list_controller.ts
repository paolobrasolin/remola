import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["container"];
  declare readonly containerTarget: HTMLSelectElement;

  connect() {
    //
    this.bindCountLimiter();
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

  bindCountLimiter() {
    this.containerTarget.addEventListener("change", (event) => {
      const target = event.target as HTMLSelectElement;
      const selectedOptions = Array.from(target.selectedOptions);
      selectedOptions.shift();
      selectedOptions.forEach((option) => (option.selected = false));
    });
  }

  disconnect() {
    //
  }
}
