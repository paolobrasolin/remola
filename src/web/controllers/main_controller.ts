import { Controller } from "@hotwired/stimulus";
import {
  HumanGrammar,
  Signature,
  humanToMachineGrammar,
  indicesToGenerator,
} from "../../lib/encoding";
import { explore } from "../../lib/generation";

export default class extends Controller {
  ingestGrammar({
    detail: { grammar },
  }: CustomEvent<{ grammar: HumanGrammar }>) {
    const machineGrammar = humanToMachineGrammar(grammar);

    const seed = [indicesToGenerator([], [], machineGrammar.bits)];
    const store = new Map<bigint, Set<bigint>>();

    const generators = [...machineGrammar.generators.values()];
    explore(seed, store, 4n, generators, machineGrammar.bits);

    const paths = this.findPaths(store, 0b00n, 0b00n, 10);
    const options = paths.map((v, i) => {
      return { value: i.toString(), label: v.toString() };
    });
    this.dispatch("optionsChanged", { detail: { options } });
  }

  findPaths(
    adjMat: Map<Signature, Set<Signature>>,
    startNode: Signature,
    endNode: Signature,
    maxPathLength: number,
    stopOnEndNode = true
  ): Signature[][] {
    const result: Signature[][] = [];

    function dfs(path: Signature[]): void {
      const currentNode = path[path.length - 1];

      // Base case: If path length (excluding the starting node) is equal to or greater than maxPathLength, stop.
      if (path.length - 1 >= maxPathLength) return;

      // Add the path to the result if it ends at the specified endNode.
      if (path.length > 1 && currentNode === endNode) {
        result.push(path.slice());
        if (stopOnEndNode) return;
      }

      const neighbors = adjMat.get(currentNode) || new Set<Signature>();
      for (const neighbor of neighbors) {
        path.push(neighbor);
        dfs(path);
        path.pop();
      }
    }

    dfs([startNode]);
    return result;
  }
}
