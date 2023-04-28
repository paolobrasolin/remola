import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  logEvent({ type, detail }: CustomEvent) {
    console.log(type, detail);
  }
}
