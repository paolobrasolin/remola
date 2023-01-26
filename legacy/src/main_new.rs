use petgraph::data::FromElements;
use petgraph::dot::{Config, Dot};
use petgraph::graph::{DiGraph, NodeIndex, UnGraph};
use petgraph::visit::NodeIndexable;
use petgraph::{algo, prelude::*};

fn main() {
    let g = DiGraph::<i32, ()>::from_edges(&[(0, 1), (0, 1), (1, 2), (2, 3), (1, 0), (3, 0)]);

    let root = g.from_index(0);
    let ways: Vec<_> = algo::all_simple_paths::<Vec<_>, _>(&g, root, root, 0, Some(30)).collect();

    println!("{:?}", ways)
}
