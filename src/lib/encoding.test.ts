import {
  encodeTypesInGrammar,
  humanToMachineGrammar,
  indicesToSignature,
  listTypesInGrammar,
  HumanGrammar,
  MachineGrammar,
} from "./encoding";

describe("indicesToSignature", () => {
  test.each([
    { bits: 1, idcs: [], exp: 0b0 },
    { bits: 1, idcs: [1], exp: 0b1 },
    { bits: 1, idcs: [1, 1], exp: 0b11 },
    { bits: 1, idcs: [1, 1, 1], exp: 0b111 },
    { bits: 2, idcs: [], exp: 0b00 },
    { bits: 2, idcs: [1], exp: 0b01 },
    { bits: 2, idcs: [2], exp: 0b10 },
    { bits: 2, idcs: [1, 1], exp: 0b0101 },
    { bits: 2, idcs: [1, 2], exp: 0b1001 },
    { bits: 2, idcs: [2, 1], exp: 0b0110 },
    { bits: 2, idcs: [2, 2], exp: 0b1010 },
  ])("$bits bits: $idcs => $exp", ({ bits, idcs, exp }) => {
    const res = indicesToSignature(idcs.map(BigInt), BigInt(bits));
    expect(res).toBe(BigInt(exp));
  });
});

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
        {
          name: Symbol.for("0"),
          arity: 0n,
          domain: 0b0n,
          coarity: 1n,
          codomain: 0b01n,
        },
      ],
      [
        Symbol.for("("),
        {
          name: Symbol.for("("),
          arity: 1n,
          domain: 0b01n,
          coarity: 2n,
          codomain: 0b01_10n,
        },
      ],
      [
        Symbol.for(")"),
        {
          name: Symbol.for(")"),
          arity: 2n,
          domain: 0b01_10n,
          coarity: 1n,
          codomain: 0b01n,
        },
      ],
      [
        Symbol.for("1"),
        {
          name: Symbol.for("1"),
          arity: 1n,
          domain: 0b01n,
          coarity: 0n,
          codomain: 0b0n,
        },
      ],
    ]),
  };

  expect(humanToMachineGrammar(grammar)).toStrictEqual(expected);
});
