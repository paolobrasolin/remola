import { Controller } from "@hotwired/stimulus";
import {
  Composable,
  HumanGrammar,
  MachineGrammar,
  Signature,
  humanToMachineGrammar,
  indicesToGenerator,
} from "../../lib/encoding";
import { explore, exploreWithEdges } from "../../lib/generation";

export default class extends Controller {
  humanGrammar!: HumanGrammar;
  machineGrammar!: MachineGrammar;
  graphStore!: Map<bigint, Map<Signature, [bigint, symbol, Composable]>>;
  diagramsStore!: [Signature, [bigint, symbol, Composable]][][];

  ingestGrammar({
    detail: { grammar },
  }: CustomEvent<{ grammar: HumanGrammar }>) {
    this.humanGrammar = grammar;
    this.machineGrammar = humanToMachineGrammar(grammar);
    this.graphStore = new Map();
    this.diagramsStore = [];

    exploreWithEdges(
      [indicesToGenerator([], [], this.machineGrammar.bits)], // seeding w/ empty signature
      this.graphStore,
      6n, //up to depth 4
      [...this.machineGrammar.generators.values()],
      this.machineGrammar.bits
    );

    this.diagramsStore = this.findPaths(this.graphStore, 0b00n, 0b00n, 10);

    const options = this.diagramsStore.map((dia, i) => {
      const label = dia
        .map(([sig, [off, name, com]]) => {
          const sup = off
            .toString()
            .split("")
            .map((d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[parseInt(d)]);
          return `${Symbol.keyFor(name)}${sup}`;
        })
        .join(" ; ");
      return { value: i.toString(), label: label };
    });

    this.dispatch("optionsChanged", { detail: { options } });
    this.dispatch("graphChanged", {
      detail: {
        graph: this.graphStore,
        humanGrammar: this.humanGrammar,
        machineGrammar: this.machineGrammar,
      },
    });
  }

  findPaths(
    adjMat: Map<Signature, Map<Signature, [bigint, symbol, Composable]>>,
    headSignature: Signature,
    tailSignature: Signature,
    maxPathLength: number,
    stopOnEndNode = true
  ): [Signature, [bigint, symbol, Composable]][][] {
    const result: [Signature, [bigint, symbol, Composable]][][] = [];

    function dfs(path: [Signature, [bigint, symbol, Composable]][]): void {
      const [currentNodeSig, _] = path[path.length - 1];

      // Base case: If path length (excluding the starting node) is equal to or greater than maxPathLength, stop.
      if (path.length - 1 >= maxPathLength) return;

      // Add the path to the result if it ends at the specified tailSignature.
      if (path.length > 1 && currentNodeSig === tailSignature) {
        result.push(path.slice());
        if (stopOnEndNode) return;
      }

      const neighbors =
        adjMat.get(currentNodeSig) ||
        new Map<Signature, [bigint, symbol, Composable]>();
      for (const neighbor of neighbors) {
        path.push(neighbor);
        dfs(path);
        path.pop();
      }
    }

    dfs([
      [
        headSignature,
        [
          0b0n,
          Symbol.for("~"),
          { arity: 0n, domain: 0n, coarity: 0n, codomain: 0n },
        ],
      ],
    ]);

    // TODO: somehow remove the need for ~ instead of shifting it out
    result.forEach((p) => p.shift());
    return result;
  }

  ingestSelection({
    detail: { selection },
  }: CustomEvent<{ selection: string }>) {
    const diagram = this.diagramsStore[parseInt(selection)];
    const humanGrammar = this.humanGrammar;
    const machineGrammar = this.machineGrammar;
    this.dispatch("diagramChanged", {
      detail: { diagram, humanGrammar, machineGrammar },
    });
  }
}
