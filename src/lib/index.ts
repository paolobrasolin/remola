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
  if (cod.arity > 0n && dom.arity < 1n) return results; // TODO: debatable
  for (let offset = 0n; offset <= cod.arity - dom.arity; offset++) {
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
    let sig = lho.cod.valueOf();
    sig >>= (rho.dom.arity + offset) * bits;
    sig <<= rho.cod.arity * bits;
    sig |= rho.cod;
    sig <<= offset * bits;
    sig |= lho.cod & (bits ** (offset * bits) - 1n);
    const arity = lho.cod.arity + rho.cod.arity - rho.dom.arity;
    const signature: Signature = {
      dom: Object.assign(lho.dom, { arity: lho.dom.arity }),
      cod: Object.assign(sig, { arity: arity }),
    };
    results.push([offset, signature]);
  });
  return results;
}

export function explore(
  sigs: Sig[],
  store: Map<bigint, Set<bigint>>,
  depth: bigint,
  generators: Signature[],
  bits: bigint
) {
  if (depth < 1n) return;
  const other = new Set<Sig>();
  sigs.forEach((sig) => {
    if (!store.has(sig.valueOf())) store.set(sig.valueOf(), new Set<bigint>());
    generators.forEach((g) => {
      // if (g.dom.arity < 1n) return; // TODO: is this actually right?
      const compositions = listCompositions(
        { dom: Object.assign(0b0n, { arity: 0n }), cod: sig },
        g,
        bits
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
    depth - 1n,
    generators,
    bits
  );
}
