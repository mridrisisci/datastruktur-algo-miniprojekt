import { AVLTree } from './avl/AVLTree.js';
import { TreeRenderer } from './view/TreeRenderer.js';

const tree = new AVLTree();
const svg = document.getElementById('treeCanvas');
const renderer = new TreeRenderer(svg);

const input = document.getElementById('valueInput');
const insertBtn = document.getElementById('insertBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

let history = [];
let currentIndex = -1;
let labels = [];
let insertedValues = [];
let nextNodeId = 0;
const insertedSet = new Set();

function layout(node, x, y, gap = 60) {
  if (!node) return;
  node.x = x;
  node.y = y;
  layout(node.left, x - gap, y + 80, gap * 0.7);
  layout(node.right, x + gap, y + 80, gap * 0.7);
}

function clone(node) {
  if (!node) return null;
  return {
    value: node.value,
    id: node.id,
    height: node.height,
    x: node.x,
    y: node.y,
    left: clone(node.left),
    right: clone(node.right)
  };
}

function createNode(value) {
  return {
    value,
    id: nextNodeId++,
    height: 1,
    left: null,
    right: null,
    x: 0,
    y: 0
  };
}

function bstInsert(root, value) {
  if (!root) return createNode(value);
  if (value < root.value) {
    root.left = bstInsert(root.left, value);
  } else if (value > root.value) {
    root.right = bstInsert(root.right, value);
  }
  return root;
}

function findWithParent(root, value) {
  let parent = null;
  let node = root;
  while (node && node.value !== value) {
    parent = node;
    node = value < node.value ? node.left : node.right;
  }
  return { node, parent };
}

function rotateSnapshotRight(root, pivotValue) {
  const { node: y, parent } = findWithParent(root, pivotValue);
  if (!y || !y.left) return root;
  const x = y.left;
  const T2 = x.right;
  x.right = y;
  y.left = T2;
  if (!parent) {
    return x;
  }
  if (parent.left === y) parent.left = x;
  else parent.right = x;
  return root;
}

function rotateSnapshotLeft(root, pivotValue) {
  const { node: x, parent } = findWithParent(root, pivotValue);
  if (!x || !x.right) return root;
  const y = x.right;
  const T2 = y.left;
  y.left = x;
  x.right = T2;
  if (!parent) {
    return y;
  }
  if (parent.left === x) parent.left = y;
  else parent.right = y;
  return root;
}

function render() {
  renderer.reset();
  if (labels[currentIndex]) renderer.showRotationLabel(labels[currentIndex]);
  renderer.drawFromStoredPositions(history[currentIndex]);
}

insertBtn.onclick = () => {
  const v = parseInt(input.value);
  if (isNaN(v)) return;
  if (insertedSet.has(v)) return;
  insertedValues.push(v);
  insertedSet.add(v);

  tree.insert(v);

  history = [];
  labels = [];

  const centerX = 300;
  const startY = 40;

  let unbalancedRoot = null;
  insertedValues.forEach(val => {
    unbalancedRoot = bstInsert(unbalancedRoot, val);
  });
  layout(unbalancedRoot, centerX, startY);
  history.push(clone(unbalancedRoot));
  labels.push('');

  tree.animationSteps.forEach(step => {
    if (step.treeSnapshot) {
      layout(step.treeSnapshot, centerX, startY);
      history.push(clone(step.treeSnapshot));
      labels.push(`${step.rotation} - ${step.phase}`);
    }
  });

  currentIndex = 0;
  render();
};

prevBtn.onclick = () => {
  if (currentIndex > 0) {
    currentIndex--;
    render();
  }
};

nextBtn.onclick = () => {
  if (currentIndex < history.length - 1) {
    currentIndex++;
    render();
  }
};
