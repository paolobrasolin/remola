import {
  encodeTypesInGrammar,
  HumanGrammar,
  humanToMachineGrammar,
  listTypesInGrammar,
  MachineGrammar,
} from "./grammar";

test("listTypesInGrammar", () => {
  const grammar: HumanGrammar = {
    "0": { dom: [], cod: ["A"] },
    "(": { dom: ["A"], cod: ["B", "A"] },
    ")": { dom: ["B", "A"], cod: ["A"] },
    "1": { dom: ["A"], cod: [] },
  };
  expect(listTypesInGrammar(grammar)).toStrictEqual(
    new Set([Symbol.for("A"), Symbol.for("B")])
  );
});

test("encodeTypesInGrammar", () => {
  const grammar: HumanGrammar = {
    "0": { dom: [], cod: ["A"] },
    "(": { dom: ["A"], cod: ["B", "A"] },
    ")": { dom: ["B", "A"], cod: ["A"] },
    "1": { dom: ["A"], cod: [] },
  };
  expect(encodeTypesInGrammar(grammar)).toStrictEqual(
    new Map([
      [Symbol.for("A"), 0b01n],
      [Symbol.for("B"), 0b10n],
    ])
  );
});

test("humanToMachineGrammar", () => {
  const grammar: HumanGrammar = {
    "0": { dom: [], cod: ["A"] },
    "(": { dom: ["A"], cod: ["B", "A"] },
    ")": { dom: ["B", "A"], cod: ["A"] },
    "1": { dom: ["A"], cod: [] },
  };

  const expected: MachineGrammar = {
    bits: 2n,
    alphabet: new Map([
      [Symbol.for("A"), 0b01n],
      [Symbol.for("B"), 0b10n],
    ]),
    generators: new Map([
      [
        Symbol.for("0"),
        { arity: 0n, domain: 0b0n, coarity: 1n, codomain: 0b01n },
      ],
      [
        Symbol.for("("),
        { arity: 1n, domain: 0b01n, coarity: 2n, codomain: 0b01_10n },
      ],
      [
        Symbol.for(")"),
        { arity: 2n, domain: 0b01_10n, coarity: 1n, codomain: 0b01n },
      ],
      [
        Symbol.for("1"),
        { arity: 1n, domain: 0b01n, coarity: 0n, codomain: 0b0n },
      ],
    ]),
  };

  expect(humanToMachineGrammar(grammar)).toStrictEqual(expected);
});
