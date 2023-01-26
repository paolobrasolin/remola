require "set"

INPUT = [
  {
    label: :"0",
    source: [],
    target: [:A],
  },
  {
    label: :"(",
    source: [:A],
    target: [:B, :A],
  },
  {
    label: :")",
    source: [:B, :A],
    target: [:A],
  },
  {
    label: :"1",
    source: [:A],
    target: [],
  },
]

alphabet = {}

INPUT.each do |generator|
  generator[:source].each { |s| alphabet[s] ||= alphabet.size + 1 }
  generator[:target].each { |s| alphabet[s] ||= alphabet.size + 1 }
end

bits = 1 + Math.log2(alphabet.size).floor()

DATA = INPUT.map do |i|
  {
    arity: i[:source].size,
    domain: i[:source].map(&alphabet).each.with_index.sum { |n, i| n << i * 2 },
    coarity: i[:target].size,
    codomain: i[:target].map(&alphabet).each.with_index.sum { |n, i| n << i * 2 },
  }
end

dia = {
  arity: 0,
  domain: 0b0,
  coarity: 5,
  codomain: 0b11_01_10_01_10,
}

gen = {
  arity: 2,
  domain: 0b10_01,
  coarity: 1,
  codomain: 0b01,
}

def list_compositions(dia, gen)
  compositions = []
  (0...dia[:coarity] - gen[:arity] + 1).each do |offset|
    l = gen[:arity] * 2
    o = offset * 2
    body = (dia[:codomain] & (2.pow(l + o) - 1)) >> o
    if body == gen[:domain]
      head = dia[:codomain] >> l + o
      tail = dia[:codomain] & (2.pow(o) - 1)
      new_sig = (((head << (gen[:coarity] * 2)) + gen[:codomain]) << offset * 2) + tail
      compositions << [
        offset,
        {
          arity: dia[:arity],
          domain: dia[:domain],
          coarity: dia[:coarity] - gen[:arity] + gen[:coarity],
          codomain: new_sig,
        },
      ]

      # puts(
      #   "%1$b ~ %2$0*3$b/%4$0*5$b @ %6$d ~> %7$b" %
      #   [
      #     dia[:codomain],
      #     gen[:domain],
      #     (gen[:arity] * 2),
      #     gen[:codomain],
      #     (gen[:coarity] * 2),
      #     offset,
      #     new_sig,
      #   ]
      # )
    end
  end
  compositions
end

# puts list_compositions(dia, gen)

stuff = {}

def ohboi(sigs, store, depth:)
  return unless depth > 0
  other = Set.new
  sigs.each do |(coarity, codomain)|
    store[[coarity, codomain]] ||= Set.new
    DATA.each do |g|
      list_compositions({ coarity: coarity, codomain: codomain }, g).each do |offset, f|
        store[[coarity, codomain]].add([f[:coarity], f[:codomain]])
        other.add([f[:coarity], f[:codomain]])
      end
    end
  end
  ohboi(other - store.keys, store, depth: depth - 1)
end

ohboi([[0, 0b0]], stuff, depth: 16)

puts DATA

stuff.each do |k, v|
  puts "%2$0*1$b => %3$s" % [2 * (k[0]), k[1], v]
end
