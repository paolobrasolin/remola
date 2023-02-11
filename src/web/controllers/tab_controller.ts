import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
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
