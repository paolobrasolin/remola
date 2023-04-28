import { Controller } from "@hotwired/stimulus";
import {
  Composable,
  HumanGrammar,
  humanToMachineGrammar,
  indicesToGenerator,
} from "../../lib/encoding";
import { explore } from "../../lib/generation";

export default class extends Controller {
  logEvent({
    type,
    detail: { grammar },
  }: CustomEvent<{ grammar: HumanGrammar }>) {
    console.log(type, grammar);
    const machineGrammar = humanToMachineGrammar(grammar);

    const seed: Composable[] = [
      indicesToGenerator([], [], machineGrammar.bits),
    ];
    const store = new Map<bigint, Set<bigint>>();

    const generators = [...machineGrammar.generators.values()];
    explore(seed, store, 4n, generators, machineGrammar.bits);

    console.log(store);
  }
}
