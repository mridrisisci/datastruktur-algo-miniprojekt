import { AVLTree } from "./avl/AVLtree.js";
import { TreeRenderer } from "./view/treerenderer.js";

const svg = document.getElementById("treeCanvas");
const renderer = new TreeRenderer(svg);

let tree = new AVLTree();

const input = document.getElementById("valueInput");
const insertBtn = document.getElementById("insertBtn");

insertBtn.addEventListener("click", () => {
    const value = parseInt(input.value);
    if (isNaN(value)) return;

    // brug den rene AVL-implementering
    tree.insert(value);

    // tegn altid det nu balancerede træ
    renderer.clear();
    renderer.drawSnapshot(tree.root, 500, 40, 60);
});
