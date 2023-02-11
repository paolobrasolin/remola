import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["test"];
  declare readonly testTarget: HTMLDivElement;

  connect() {
    this.testTarget.innerText = "Hello world.";
  }

  disconnect() {
    return;
  }
}
