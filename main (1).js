import { AVLTree } from './avl/AVLTree.js';
import { TreeRenderer } from './view/TreeRenderer.js';

const tree = new AVLTree();
const svg = document.getElementById('treeCanvas');
const renderer = new TreeRenderer(svg);

const input = document.getElementById('valueInput');
const insertBtn = document.getElementById('insertBtn');
const searchBtn = document.getElementById('searchBtn');
const deleteBtn = document.getElementById('deleteBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

let history = [];
let currentIndex = -1;
let labels = [];
let insertedValues = [];
let nextNodeId = 0;
let currentOperation = null; // 'insert', 'delete', 'search'
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

function bstInsertIntoClone(root, value) {
  // Insert into a clone without balancing (for showing unbalanced state)
  if (!root) return createNode(value);
  const cloned = {
    value: root.value,
    id: root.id,
    height: root.height,
    left: null,
    right: null,
    x: root.x,
    y: root.y
  };
  if (value < cloned.value) {
    cloned.left = bstInsertIntoClone(root.left, value);
  } else if (value > cloned.value) {
    cloned.right = bstInsertIntoClone(root.right, value);
  }
  return cloned;
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

  const centerX = 300;
  const startY = 80;

  // Snapshot before: Insert into current tree (clone) WITHOUT balancing
  // This shows what the unbalanced state looks like after adding the value
  let unbalancedRoot = bstInsertIntoClone(tree.root, v);

  // Reset history for this insert operation
  history = [];
  labels = [];
  currentOperation = 'insert';

  // Add unbalanced BST snapshot
  layout(unbalancedRoot, centerX, startY);
  history.push(clone(unbalancedRoot));
  labels.push(`Unbalanced BST after inserting ${v}`);

  // Now insert into the actual AVL tree (this will balance it)
  tree.insert(v);

  // Use the rotation snapshots from the animation steps
  tree.animationSteps.forEach(step => {
    if (step.after) {
      layout(step.after, centerX, startY);
      history.push(clone(step.after));
      labels.push(step.label);
    }
  });

  // Always add final balanced state
  const finalTree = clone(tree.cloneTree ? tree.cloneTree(tree.root) : tree.root);
  layout(finalTree, centerX, startY);
  history.push(finalTree);
  labels.push(`Balanced AVL tree after insert ${v}`);

  currentIndex = 0;
  render();
};

searchBtn.onclick = () => {
  const v = parseInt(input.value);
  if (isNaN(v)) return;

  history = [];
  labels = [];
  currentOperation = 'search';

  const centerX = 300;
  const startY = 80; // push tree down so label box doesn't overlap

  // Call searchWithSteps on the tree
  tree.searchWithSteps(v);

  // Build history array from tree.animationSteps
  tree.animationSteps.forEach(step => {
    if (step.after) {
      layout(step.after, centerX, startY);
      history.push(clone(step.after));
      labels.push(step.label);
    }
  });

  // Add final tree snapshot
  const finalTree = clone(tree.cloneTree ? tree.cloneTree(tree.root) : tree.root);
  layout(finalTree, centerX, startY);
  history.push(finalTree);
  labels.push(`After search ${v}`);

  currentIndex = 0;
  render();
};

deleteBtn.onclick = () => {
  const v = parseInt(input.value);
  if (isNaN(v)) return;
  // Allow delete even if set is out of sync; best-effort
  if (insertedSet.has(v)) {
    insertedValues = insertedValues.filter(val => val !== v);
    insertedSet.delete(v);
  }

  history = [];
  labels = [];
  currentOperation = 'delete';

  const centerX = 300;
  const startY = 80; // push tree down so label box doesn't overlap

  // Snapshot before delete (current balanced tree)
  const beforeDelete = clone(tree.cloneTree ? tree.cloneTree(tree.root) : tree.root);
  layout(beforeDelete, centerX, startY);
  history.push(beforeDelete);
  labels.push(`Before delete ${v}`);

  // Call delete on the tree
  tree.delete(v);

  // Build history array from tree.animationSteps
  tree.animationSteps.forEach(step => {
    if (step.after) {
      layout(step.after, centerX, startY);
      history.push(clone(step.after));
      labels.push(step.label);
    }
  });

  // Add final tree snapshot after deletion/balancing
  const finalTree = clone(tree.cloneTree ? tree.cloneTree(tree.root) : tree.root);
  layout(finalTree, centerX, startY);
  history.push(finalTree);
  labels.push(`After delete ${v}`);

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
