import { indicesToGenerator } from ".";

type Arity = bigint;
type Signature = bigint;
type BitSize = bigint;

interface Generator {
  arity: Arity;
  domain: Signature;
  coarity: Arity;
  codomain: Signature;
}

export type HumanGrammar = {
  [key: string]: {
    dom: string[];
    cod: string[];
  };
};

export type MachineGrammar = {
  bits: BitSize;
  alphabet: Map<symbol, Signature>;
  generators: Map<symbol, Generator>;
};

export function humanToMachineGrammar(grammar: HumanGrammar): MachineGrammar {
  const alphabet = encodeTypesInGrammar(grammar);
  const bits = BigInt(1 + Math.floor(Math.log2(alphabet.size)));
  const generators = encodeGeneratorsInGrammar(grammar, alphabet, bits);
  return { bits, alphabet, generators };
}

export function listTypesInGrammar(grammar: HumanGrammar): Set<symbol> {
  const types = new Set<symbol>();
  Object.values(grammar).forEach(({ dom, cod }) => {
    dom.forEach((type) => types.add(Symbol.for(type)));
    cod.forEach((type) => types.add(Symbol.for(type)));
  });
  return types;
}

export function encodeTypesInGrammar(
  grammar: HumanGrammar
): Map<symbol, Signature> {
  const types = new Map<symbol, Signature>();
  [...listTypesInGrammar(grammar)].forEach((type, index) => {
    types.set(type, BigInt(index + 1));
  });
  return types;
}

export function encodeGeneratorsInGrammar(
  grammar: HumanGrammar,
  alphabet: Map<symbol, Signature>,
  bits: BitSize
): Map<symbol, Generator> {
  return new Map(
    Object.entries(grammar).map(([key, { dom, cod }]) => [
      Symbol.for(key),
      indicesToGenerator(
        dom.map((k) => alphabet.get(Symbol.for(k))!),
        cod.map((k) => alphabet.get(Symbol.for(k))!),
        bits
      ),
    ])
  );
}
