export const greet = (name: string): string => `Hello ${name}!`;

export type Sig = bigint & { arity: bigint };

interface Signature {
  dom: Sig;
  cod: Sig;
}

export function indicesToDomain(indices: bigint[], bits: bigint): Sig {
  return Object.assign(
    indices.reduce((p, c, i) => p + (c << (BigInt(i) * bits)), 0n),
    { arity: BigInt(indices.length) }
  );
}

export function sigFromIdcs(
  domIdcs: bigint[],
  codIdcs: bigint[],
  bits: bigint
): Signature {
  return {
    dom: indicesToDomain(domIdcs, bits),
    cod: indicesToDomain(codIdcs, bits),
  };
}

export function listCompositionOffsets(
  cod: Sig,
  dom: Sig,
  bits: bigint
): bigint[] {
  const results: bigint[] = [];
  for (let offset = 0n; offset <= cod.arity - dom.arity + 1n; offset++) {
    const bitLength = dom.arity * bits;
    const bitOffset = offset * bits;
    const body = (cod & (bits ** (bitLength + bitOffset) - 1n)) >> bitOffset;
    if (body == dom) results.push(offset);
  }
  return results;
}

export function listCompositions(
  lho: Signature,
  rho: Signature,
  bits: bigint
): [bigint, Signature][] {
  const results: [bigint, Signature][] = [];
  listCompositionOffsets(lho.cod, rho.dom, bits).forEach((offset) => {
    const l = rho.dom.arity * bits;
    const o = offset * bits;
    const body = (lho.cod & (bits ** (l + o) - 1n)) >> o;
    if (body == rho.dom) {
      const head = lho.cod >> (l + o);
      const tail = lho.cod & (bits ** o - 1n);
      const codomain =
        (((head << (rho.cod.arity * bits)) + rho.cod) << (offset * bits)) +
        tail;
      const signature: Signature = {
        dom: Object.assign(lho.dom, { arity: lho.dom.arity }),
        cod: Object.assign(codomain, {
          arity: lho.cod.arity - rho.dom.arity + rho.cod.arity,
        }),
      };
      results.push([offset, signature]);
    }
  });
  return results;
}

const PAR = {
  lRoot: sigFromIdcs([], [1n], 2n),
  lNest: sigFromIdcs([1n], [2n, 1n], 2n),
  rNest: sigFromIdcs([2n, 1n], [1n], 2n),
  rRoot: sigFromIdcs([1n], [], 2n),
};

export function explore(
  sigs: Sig[],
  store: Map<bigint, Set<bigint>>,
  depth: bigint
) {
  if (depth < 1n) return;
  const other = new Set<Sig>();
  sigs.forEach((sig) => {
    if (!store.has(sig.valueOf())) store.set(sig.valueOf(), new Set<bigint>());
    Object.values(PAR).forEach((g) => {
      // if (g.dom.arity < 1n) return; // TODO: is this actually right?
      const compositions = listCompositions(
        { dom: Object.assign(0b0n, { arity: 0n }), cod: sig },
        g,
        2n
      );
      compositions.forEach(([_, f]) => {
        store.get(sig.valueOf())?.add(f.cod.valueOf());
        other.add(f.cod);
      });
    });
  });

  explore(
    [...other].filter((x) => !store.has(x.valueOf())),
    store,
    depth - 1n
  );
}
