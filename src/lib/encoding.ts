export type Arity = bigint;
export type Signature = bigint;
export type BitSize = bigint;

export interface Composable {
  name?: symbol;
  arity: Arity;
  domain: Signature;
  coarity: Arity;
  codomain: Signature;
}

// NOTE: that's a BAD name, overriding existing stuff
export type Generator = Composable;

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

export function indicesToSignature(indices: bigint[], bits: bigint): Signature {
  return indices.reduce((p, c, i) => p + (c << (BigInt(i) * bits)), 0n);
}

export function indicesToGenerator(
  domIndices: bigint[],
  codIndices: bigint[],
  bits: bigint,
  name?: symbol
): Generator {
  return {
    name: name,
    arity: BigInt(domIndices.length),
    domain: indicesToSignature(domIndices, bits),
    coarity: BigInt(codIndices.length),
    codomain: indicesToSignature(codIndices, bits),
  };
}

export function humanToMachineGrammar(grammar: HumanGrammar): MachineGrammar {
  const alphabet = encodeTypesInGrammar(grammar);
  const bits = alphabet.size
    ? BigInt(1 + Math.floor(Math.log2(alphabet.size)))
    : 0n;
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
        bits,
        Symbol.for(key)
      ),
    ])
  );
}
