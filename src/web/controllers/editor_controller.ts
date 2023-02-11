import { Controller } from "@hotwired/stimulus";

const DEFAULT = `{
  "0": { "dom": [], "cod": ["A"]},
  "(": { "dom": ["A"], "cod": ["B", "A"]},
  ")": { "dom": ["B", "A"], "cod": ["A"]},
  "1": { "dom": ["A"], "cod": []}
}`;

export default class extends Controller {
  static targets = ["textarea"];
  declare readonly textareaTarget: HTMLTextAreaElement;

  connect() {
    this.textareaTarget.value = DEFAULT;
  }

  disconnect() {}
}
