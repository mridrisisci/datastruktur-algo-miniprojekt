let NODE_ID_COUNTER = 1;

export class AVLNode {
  constructor(value) {
    this.value = value; // receives from frontend
    this.left = null;
    this.right = null;
    this.height = 1;
    // Each node gets a stable id so the SVG element can be reused
    this.id = NODE_ID_COUNTER++;
    // Logical position used by the SVG renderer (not part of the AVL algorithm)
    this.x = 0;
    this.y = 0;
  }
}

export class AVLTree {
  constructor() {
    this.root = null;
    // Collected when a rotation happens and later used for SVG animation
    this.animationSteps = [];
    // Used to track intermediate tree states during double rotations
    this.intermediateRoots = [];
  }

  // Record a rotation snapshot with phase and target (final or intermediate)
  recordStep(rotation, phase, target, nodes) {
    this.animationSteps.push({ rotation, phase, target, nodes });
  }

  getHeight(node) {
    return node ? node.height : 0;
  }

  getBalance(node) {
    return node ? this.getHeight(node.left) - this.getHeight(node.right) : 0;
  }

  rightRotate(old_root, rotation = 'LL', target = 'final') {
    const new_root = old_root.left;
    const temp_right_subtree = new_root.right;

    // before
    this.recordStep(rotation, 'before', target, [
      { node: old_root, startX: old_root.x, startY: old_root.y },
      { node: new_root, startX: new_root.x, startY: new_root.y }
    ]);

    // mid (pointer reassignment will give old_root a second incoming ref)
    this.recordStep(rotation, 'mid', target, [
      { node: old_root, startX: old_root.x, startY: old_root.y },
      { node: new_root, startX: new_root.x, startY: new_root.y }
    ]);

    new_root.right = old_root;
    old_root.left = temp_right_subtree;

    // after
    this.recordStep(rotation, 'after', target, [
      { node: new_root, startX: new_root.x, startY: new_root.y },
      { node: old_root, startX: old_root.x, startY: old_root.y }
    ]);

    // height updates (logic unchanged)
    old_root.height = 1 + Math.max(this.getHeight(old_root.left), this.getHeight(old_root.right));
    new_root.height = 1 + Math.max(this.getHeight(new_root.left), this.getHeight(new_root.right));

    return new_root;
  }

  leftRotate(old_root, rotation = 'RR', target = 'final') {
    const new_root = old_root.right;
    const new_node_right = new_root.left;

    // before
    this.recordStep(rotation, 'before', target, [
      { node: old_root, startX: old_root.x, startY: old_root.y },
      { node: new_root, startX: new_root.x, startY: new_root.y }
    ]);

    // mid (pointer reassignment will give old_root a second incoming ref)
    this.recordStep(rotation, 'mid', target, [
      { node: old_root, startX: old_root.x, startY: old_root.y },
      { node: new_root, startX: new_root.x, startY: new_root.y }
    ]);

    new_root.left = old_root;
    old_root.right = new_node_right;

    // after
    this.recordStep(rotation, 'after', target, [
      { node: new_root, startX: new_root.x, startY: new_root.y },
      { node: old_root, startX: old_root.x, startY: old_root.y }
    ]);

    old_root.height = 1 + Math.max(this.getHeight(old_root.left), this.getHeight(old_root.right));
    new_root.height = 1 + Math.max(this.getHeight(new_root.left), this.getHeight(new_root.right));

    return new_root;
  }

  insertNode(node, value) {
    // if no node, it creates a new node
    if (!node) return new AVLNode(value); // first node is created

    /*
    checks which side of the root node to insert the node-leaf.
    */
    if (value < node.value) {
      node.left = this.insertNode(node.left, value);
    } else if (value > node.value) {
      node.right = this.insertNode(node.right, value);
    } else {
      return node;
    }

    // calculates height of node-leaf
    node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));

    const balance = this.getBalance(node);

    /* 
    checks if a rotation is needed.
    At this point we know a rotation will happen (LL, RR, LR, RL case),
    and the visual layer can later use animationSteps to show it.
    */
    if (balance > 1 && value < node.left.value) {
      // LL case: single right rotation
      return this.rightRotate(node, 'LL', 'final');
    }
    if (balance < -1 && value > node.right.value) {
      // RR case: single left rotation
      return this.leftRotate(node, 'RR', 'final');
    }
    if (balance > 1 && value > node.left.value) {
      // LR case: left rotation on left child, then right rotation on node
      node.left = this.leftRotate(node.left, 'LR', 'intermediate');
      // After first rotation in LR case, save the intermediate tree state
      this.intermediateRoots.push(this.cloneTree(node));
      return this.rightRotate(node, 'LR', 'final');
    }
    if (balance < -1 && value < node.right.value) {
      // RL case: right rotation on right child, then left rotation on node
      node.right = this.rightRotate(node.right, 'RL', 'intermediate');
      // After first rotation in RL case, save the intermediate tree state
      this.intermediateRoots.push(this.cloneTree(node));
      return this.leftRotate(node, 'RL', 'final');
    }

    return node;
  }

  cloneTree(node) {
    if (!node) return null;
    const cloned = new AVLNode(node.value);
    cloned.id = node.id;
    cloned.height = node.height;
    cloned.x = node.x;
    cloned.y = node.y;
    cloned.left = this.cloneTree(node.left);
    cloned.right = this.cloneTree(node.right);
    return cloned;
  }

  insert(value) {
    // receives value from front-end "insert" button
    // Clear any previous rotation steps before a new insertion
    this.animationSteps = [];
    this.intermediateRoots = [];
    this.root = this.insertNode(this.root, value);
  }
}
