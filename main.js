import { AVLTree } from '/avl/avltree.js';
import { TreeRenderer } from '/view/treerenderer.js';

const tree = new AVLTree();
const svg = document.getElementById('treeCanvas');
const renderer = new TreeRenderer(svg);

const input = document.getElementById('valueInput');
const insertBtn = document.getElementById('insertBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

let steps = [];
let currentStep = -1;

function cloneTree(node) {
  if (!node) return null;
  return {
    value: node.value,
    height: node.height,
    left: cloneTree(node.left),
    right: cloneTree(node.right)
  };
}

function takeSnapshot() {
  const snapshot = cloneTree(tree.root);
  steps.push(snapshot);
  currentStep = steps.length - 1;
}

function renderCurrent() {
  renderer.clear();
  if (currentStep >= 0 && currentStep < steps.length) {
    renderer.drawNode(steps[currentStep], 500, 40);
  }
}

insertBtn.addEventListener('click', () => {
  const value = parseInt(input.value);
  if (isNaN(value)) return;

  tree.insert(value);
  takeSnapshot();
  renderCurrent();
});

nextBtn.addEventListener('click', () => {
  if (currentStep < steps.length - 1) {
    currentStep++;
    renderCurrent();
  }
});

prevBtn.addEventListener('click', () => {
  if (currentStep > 0) {
    currentStep--;
    renderCurrent();
  }
});

// Initial empty snapshot (optional)
// takeSnapshot();
// renderCurrent();
