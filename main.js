import { AVLTree } from './avl/AVLTree.js';
import { TreeRenderer } from './view/TreeRenderer.js';

const tree = new AVLTree();
const svg = document.getElementById('treeCanvas');
const renderer = new TreeRenderer(svg);

const input = document.getElementById('valueInput');
const insertBtn = document.getElementById('insertBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

// Collected animation steps for the most recent rotation
let animationSteps = [];

// History of visual frames (including intermediate rotation
// positions) so the user can step backwards/forwards with
// Previous/Next.
let history = [];
let currentIndex = -1;
// Track which rotation corresponds to which frame index
let rotationInfo = [];

// Simple layout function that assigns x/y positions to each logical node.
// The AVL algorithm does not care about these coordinates – they are only
// used by the SVG renderer and rotation animation.
function layoutTree(node, x, y, levelGap = 60) {
  if (!node) return;

  node.x = x;
  node.y = y;

  const leftX = x - levelGap;
  const rightX = x + levelGap;
  const nextY = y + 80;

  if (node.left) {
    layoutTree(node.left, leftX, nextY, levelGap * 0.7);
  }
  if (node.right) {
    layoutTree(node.right, rightX, nextY, levelGap * 0.7);
  }
}

// Animate SVG nodes to visualize AVL rotation based on computed steps
function animateSteps(steps) {
  const DURATION = 400; // 400 ms makes the rotation clearly visible

  steps.forEach(step => {
    step.nodes.forEach(nodeStep => {
      const group = svg.querySelector(`[data-node-id="${nodeStep.id}"]`);
      if (!group) return;

      // Highlight nodes that are part of the rotation
      group.classList.add('rotating');
      setTimeout(() => {
        group.classList.remove('rotating');
      }, DURATION);
    });
  });
}

function cloneNode(node) {
  if (!node) return null;
  return {
    value: node.value,
    height: node.height,
    id: node.id,
    x: node.x,
    y: node.y,
    left: cloneNode(node.left),
    right: cloneNode(node.right)
  };
}

function updateNavButtons() {
  prevBtn.disabled = currentIndex <= 0;
  nextBtn.disabled = currentIndex === -1 || currentIndex >= history.length - 1;
}

// Render a single snapshot from history using the stored
// x/y positions on each node.
function renderSnapshot(snapshot) {
  renderer.reset();
  if (!snapshot) return;
  
  // Show rotation label if applicable
  if (currentIndex >= 0 && rotationInfo[currentIndex] && rotationInfo[currentIndex].type) {
    renderer.showRotationLabel(rotationInfo[currentIndex].type);
  }
  
  renderer.drawFromStoredPositions(snapshot);
}

// Build a series of intermediate frames for the latest
// insertion based on animationSteps. Each rotation gets its own
// set of frames so you can see LR, RL cases as two separate rotations.
function buildFramesForLatestInsert() {
  const FRAMES_PER_ROTATION = 5;

  // If there is no root yet, nothing to record
  if (!tree.root) return;

  const finalSnapshot = cloneNode(tree.root);

  // No rotations: just store the final state
  if (!tree.animationSteps || tree.animationSteps.length === 0) {
    history.push(finalSnapshot);
    rotationInfo.push({ type: null });
    return;
  }

  // Helper to build an id -> node map for a given tree snapshot
  const buildIdMap = (root) => {
    const map = new Map();
    const stack = [root];
    while (stack.length) {
      const n = stack.pop();
      if (!n) continue;
      map.set(n.id, n);
      if (n.left) stack.push(n.left);
      if (n.right) stack.push(n.right);
    }
    return map;
  };

  const finalIdMap = buildIdMap(finalSnapshot);

  // For double rotations (LR, RL), we need to handle intermediate positions
  // tree.intermediateRoots contains snapshots after first rotation in LR/RL
  let intermediateIndex = 0;

  // Process each rotation step
  tree.animationSteps.forEach((step, stepIndex) => {
    // Determine end positions for this rotation
    let endSnapshot;
    
    // For the last rotation in a double rotation, use the intermediate tree
    if (stepIndex > 0 && intermediateIndex < tree.intermediateRoots.length) {
      endSnapshot = cloneNode(tree.intermediateRoots[intermediateIndex]);
      intermediateIndex++;
    } else {
      // For single rotations or the last rotation of double rotation, use final
      endSnapshot = finalSnapshot;
    }

    const endIdMap = buildIdMap(endSnapshot);

    const moveInfo = {
      type: step.type,
      nodes: step.nodes.map(nodeStep => {
        const endNode = endIdMap.get(nodeStep.id);
        return {
          id: nodeStep.id,
          startX: nodeStep.startX,
          startY: nodeStep.startY,
          endX: endNode ? endNode.x : nodeStep.startX,
          endY: endNode ? endNode.y : nodeStep.startY
        };
      })
    };

    // Generate frames for this specific rotation: t=0 to t=1
    for (let i = 0; i <= FRAMES_PER_ROTATION; i++) {
      const t = i / FRAMES_PER_ROTATION;
      const frameSnapshot = cloneNode(finalSnapshot);
      const frameIdMap = buildIdMap(frameSnapshot);

      moveInfo.nodes.forEach(m => {
        const node = frameIdMap.get(m.id);
        if (!node) return;
        node.x = m.startX + (m.endX - m.startX) * t;
        node.y = m.startY + (m.endY - m.startY) * t;
      });

      history.push(frameSnapshot);
      rotationInfo.push({ type: step.type, isIntermediateFrame: i < FRAMES_PER_ROTATION });
    }
  });
}

insertBtn.addEventListener('click', () => {
  const value = parseInt(input.value);
  if (isNaN(value)) return;

  // Perform logical insertion + possible rotations in the AVL tree
  tree.insert(value);

  // Assign x/y positions to all nodes for the FINAL tree structure
  layoutTree(tree.root, 500, 40);

  // For LR/RL cases, also layout the intermediate roots
  tree.intermediateRoots.forEach(root => {
    layoutTree(root, 500, 40);
  });

  // Reset history and rotation info for new insertion
  history = [];
  rotationInfo = [];

  // Redraw the tree with final positions
  renderer.clear();
  renderer.drawNode(tree.root, 500, 40);

  // Build animation frames for each rotation step
  buildFramesForLatestInsert();

  // Move to the first frame after building history
  if (history.length > 0) {
    currentIndex = 0;
    renderSnapshot(history[0]);
    updateNavButtons();
  }
});

prevBtn.addEventListener('click', () => {
  if (currentIndex <= 0) return;
  currentIndex--;
  const snapshot = history[currentIndex];
  renderSnapshot(snapshot);
  updateNavButtons();
});

nextBtn.addEventListener('click', () => {
  if (currentIndex === -1 || currentIndex >= history.length - 1) return;
  currentIndex++;
  const snapshot = history[currentIndex];
  renderSnapshot(snapshot);
  updateNavButtons();
});

// Initialize navigation button state on load
updateNavButtons();
