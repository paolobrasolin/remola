import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["handle", "panel", "region"];
  declare readonly handleTarget: HTMLButtonElement;
  declare readonly panelTargets: HTMLElement[];
  declare readonly regionTarget: HTMLElement;

  connect() {
    this.handleTarget.addEventListener("touchmove", (e) => {
      if (e.touches.length > 1) return;
      this.resize(e.touches[0].clientX, e.touches[0].clientY);
    });

    this.handleTarget.addEventListener("drag", (e) => {
      e.preventDefault();
      if (e.screenX === 0) return; // Drops last event
      this.resize(e.clientX, e.clientY);
    });

    window.addEventListener("resize", () => {
      const bound = this.regionTarget.getBoundingClientRect();
      this.resize(bound.width * 0.4, bound.height * 0.5);
    });
  }

  resize(clientX: number, clientY: number) {
    const bound = this.regionTarget.getBoundingClientRect();
    const x = clientX - bound.left;
    const y = clientY - bound.top;
    this.regionTarget.style.gridTemplateColumns = `${x}px ${bound.width - x}px`;
    this.regionTarget.style.gridTemplateRows = `${y}px ${bound.height - y}px`;
    this.handleTarget.style.left = `calc(${x}px - 15px)`;
    this.handleTarget.style.top = `calc(${y}px - 15px)`;
  }

  switch({ currentTarget }: Event) {
    if (!currentTarget) return;

    const tabEl = currentTarget as HTMLElement;
    const tabId = tabEl.id;

    const tablistEl = tabEl.parentElement;
    if (!tablistEl) return;

    const otherTabsSel = `[role=tab]:not(#${tabId})`;
    const otherTabsEls = tablistEl.querySelectorAll<HTMLElement>(otherTabsSel);

    const panelId = tabEl.getAttribute("aria-controls");
    if (!panelId) return;

    const panelEl = document.getElementById(panelId);
    if (!panelEl) return;

    const regionEl = panelEl.parentElement;
    if (!regionEl) return;

    const otherPanelsSel = `[role=tabpanel]:not(#${panelId})`;
    const otherPanelsEls =
      regionEl.querySelectorAll<HTMLElement>(otherPanelsSel);

    tabEl.ariaCurrent = "true";
    otherTabsEls.forEach((n) => (n.ariaCurrent = null));
    panelEl.hidden = false;
    otherPanelsEls.forEach((n) => (n.hidden = true));
  }
}
