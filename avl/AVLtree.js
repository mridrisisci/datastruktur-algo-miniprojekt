import { AVLNode } from './AVLNode.js';

export class AVLTree {
  constructor() {
    this.root = null;
    this.animationSteps = [];
  }

  cloneTree(node) {
    if (!node) return null;
    return {
      value: node.value,
      id: node.id,
      height: node.height,
      left: this.cloneTree(node.left),
      right: this.cloneTree(node.right)
    };
  }

  findNodeById(node, id) {
    if (!node) return null;
    if (node.id === id) return node;
    return this.findNodeById(node.left, id) || this.findNodeById(node.right, id);
  }

  createIntermediateRightRotation(oldRoot) {
    const snapshot = this.cloneTree(this.root);
    const target = this.findNodeById(snapshot, oldRoot.id);
    if (!target || !target.left) return snapshot;

    const leftChild = target.left;
    const rightSubtreeOfLeft = leftChild.right;
    const rightOfOld = target.right;

    const duplicateOld = this.cloneTree(oldRoot);
    duplicateOld.left = rightSubtreeOfLeft;
    duplicateOld.right = rightOfOld;

    leftChild.right = duplicateOld;
    return snapshot;
  }

  createIntermediateLeftRotation(oldRoot) {
    const snapshot = this.cloneTree(this.root);
    const target = this.findNodeById(snapshot, oldRoot.id);
    if (!target || !target.right) return snapshot;

    const rightChild = target.right;
    const leftSubtreeOfRight = rightChild.left;
    const leftOfOld = target.left;

    const duplicateOld = this.cloneTree(oldRoot);
    duplicateOld.left = leftOfOld;
    duplicateOld.right = leftSubtreeOfRight;

    rightChild.left = duplicateOld;
    return snapshot;
  }

  /**
   * Get the height of a node
   * @param {AVLNode} node 
   * @returns {number} Height of the node
   */
  getHeight(node) {
    return node ? node.height : 0;
  }

  /**
   * Update the height of a node based on its children
   * @param {AVLNode} node 
   */
  updateHeight(node) {
    if (node) {
      node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
    }
  }

  /**
   * Calculate the balance factor of a node
   * Balance Factor = height(left subtree) - height(right subtree)
   * @param {AVLNode} node 
   * @returns {number} Balance factor
   */
  getBalanceFactor(node) {
    return node ? this.getHeight(node.left) - this.getHeight(node.right) : 0;
  }

  /**
   * Right rotation (LL case)
   *       y                               x
   *      / \     Right Rotation          /  \
   *     x   T3   - - - - - - - >        T1   y
   *    / \                                  / \
   *   T1  T2                               T2  T3
   * @param {AVLNode} y 
   * @returns {AVLNode} New root after rotation
   */
  rotateRight(oldRoot) {
    const newRoot = oldRoot.left;
    const rightSubtreeOfNewRoot = newRoot.right;

    // Perform rotation: left child becomes new root of this subtree
    newRoot.right = oldRoot;
    oldRoot.left = rightSubtreeOfNewRoot;

    // Update heights after links change
    this.updateHeight(oldRoot);
    this.updateHeight(newRoot);

    return newRoot;
  }

  /**
   * Left rotation (RR case)
   *     x                                y
   *    / \      Left Rotation           / \
   *   T1  y     - - - - - - - >        x   T3
   *      / \                          / \
   *     T2  T3                       T1  T2
   * @param {AVLNode} x 
   * @returns {AVLNode} New root after rotation
   */
  rotateLeft(oldRoot) {
    const newRoot = oldRoot.right;
    const leftSubtreeOfNewRoot = newRoot.left;

    // Perform rotation: right child becomes new root of this subtree
    newRoot.left = oldRoot;
    oldRoot.right = leftSubtreeOfNewRoot;

    // Update heights after links change
    this.updateHeight(oldRoot);
    this.updateHeight(newRoot);

    return newRoot;
  }

  /**
   * Left-Right rotation (LR case)
   * First left rotation on left child, then right rotation on root
   *       z                               z                           x
   *      / \                            /   \                        /  \
   *     y   T4  Left Rotate (y)        x    T4  Right Rotate(z)    y      z
   *    / \      - - - - - - - - ->    /  \      - - - - - - - ->  / \    / \
   *   T1  x                          y    T3                     T1  T2 T3  T4
   *      / \                        / \
   *     T2  T3                    T1   T2
   * @param {AVLNode} z 
   * @returns {AVLNode} New root after rotation
   */
  rotateLeftRight(z) {
    const before1 = this.cloneTree(this.root);
    z.left = this.rotateLeft(z.left);
    if (this.root === z) this.root = z;
    const after1 = this.cloneTree(this.root);
    this.animationSteps.push({
      label: 'Left Rotation (LR - Step 1)',
      before: before1,
      after: after1
    });

    const before2 = this.cloneTree(this.root);
    const intermediate = this.createIntermediateRightRotation(z);
    this.animationSteps.push({
      label: 'Right Rotation (LR - In Progress)',
      before: before2,
      after: intermediate
    });

    const result = this.rotateRight(z);
    if (this.root === z) this.root = result;
    const after2 = this.cloneTree(this.root);
    this.animationSteps.push({
      label: 'Right Rotation (LR - Complete)',
      before: intermediate,
      after: after2
    });

    return result;
  }

  /**
   * Right-Left rotation (RL case)
   * First right rotation on right child, then left rotation on root
   *     z                            z                            x
   *    / \                          / \                          /  \
   *   T1  y   Right Rotate (y)    T1   x      Left Rotate(z)   z      y
   *      / \  - - - - - - - - ->     /  \   - - - - - - - ->  / \    / \
   *     x   T4                      T2   y                    T1  T2  T3  T4
   *    / \                              /  \
   *   T2  T3                           T3   T4
   * @param {AVLNode} z 
   * @returns {AVLNode} New root after rotation
   */
  rotateRightLeft(z) {
    const before1 = this.cloneTree(this.root);
    z.right = this.rotateRight(z.right);
    if (this.root === z) this.root = z;
    const after1 = this.cloneTree(this.root);
    this.animationSteps.push({
      label: 'Right Rotation (RL - Step 1)',
      before: before1,
      after: after1
    });

    const before2 = this.cloneTree(this.root);
    const intermediate = this.createIntermediateLeftRotation(z);
    this.animationSteps.push({
      label: 'Left Rotation (RL - In Progress)',
      before: before2,
      after: intermediate
    });

    const result = this.rotateLeft(z);
    if (this.root === z) this.root = result;
    const after2 = this.cloneTree(this.root);
    this.animationSteps.push({
      label: 'Left Rotation (RL - Complete)',
      before: intermediate,
      after: after2
    });

    return result;
  }

  /**
   * Balance a node based on its balance factor
   * @param {AVLNode} node 
   * @returns {AVLNode} Balanced node
   */
  balance(node) {
    if (!node) return node;

    this.updateHeight(node);
    const balanceFactor = this.getBalanceFactor(node);

    // Left heavy
    if (balanceFactor > 1) {
      // Left-Right case
      if (this.getBalanceFactor(node.left) < 0) {
        return this.rotateLeftRight(node);
      }
      // Left-Left case - Right Rotation with intermediate step
      const before = this.cloneTree(this.root);
      const intermediate = this.createIntermediateRightRotation(node);
      this.animationSteps.push({
        label: 'Right Rotation - In Progress',
        before,
        after: intermediate
      });

      const result = this.rotateRight(node);
      if (this.root === node) this.root = result;
      const after = this.cloneTree(this.root);
      this.animationSteps.push({
        label: 'Right Rotation - Complete',
        before: intermediate,
        after
      });
      return result;
    }

    // Right heavy
    if (balanceFactor < -1) {
      // Right-Left case
      if (this.getBalanceFactor(node.right) > 0) {
        return this.rotateRightLeft(node);
      }
      // Right-Right case - Left Rotation with intermediate step
      const before = this.cloneTree(this.root);
      const intermediate = this.createIntermediateLeftRotation(node);
      this.animationSteps.push({
        label: 'Left Rotation - In Progress',
        before,
        after: intermediate
      });

      const result = this.rotateLeft(node);
      if (this.root === node) this.root = result;
      const after = this.cloneTree(this.root);
      this.animationSteps.push({
        label: 'Left Rotation - Complete',
        before: intermediate,
        after
      });
      return result;
    }

    return node;
  }

  /**
   * Insert a value into the AVL tree (recursive helper)
   * @param {AVLNode} node 
   * @param {number} value 
   * @returns {AVLNode} Root of the subtree
   */
  insertNode(node, value) {
    // Standard BST insertion
    if (!node) {
      return new AVLNode(value);
    }

    if (value < node.value) {
      node.left = this.insertNode(node.left, value);
    } else if (value > node.value) {
      node.right = this.insertNode(node.right, value);
    } else {
      // Duplicate values not allowed
      return node;
    }

    // Balance the node
    return this.balance(node);
  }

  /**
   * Insert a value into the AVL tree
   * @param {number} value 
   */
  insert(value) {
    this.animationSteps = [];
    this.root = this.insertNode(this.root, value);
  }

  /**
   * Perform in-order traversal (for debugging/verification)
   * @param {AVLNode} node 
   * @param {Array} result 
   * @returns {Array} Sorted values
   */
  inorderTraversal(node = this.root, result = []) {
    if (node) {
      this.inorderTraversal(node.left, result);
      result.push(node.value);
      this.inorderTraversal(node.right, result);
    }
    return result;
  }

  /**
   * Get the minimum value node in a subtree
   * @param {AVLNode} node 
   * @returns {AVLNode} Node with minimum value
   */
  getMinValueNode(node) {
    let current = node;
    while (current && current.left) {
      current = current.left;
    }
    return current;
  }

  /**
   * Get the maximum value node in a subtree
   * @param {AVLNode} node 
   * @returns {AVLNode} Node with maximum value
   */
  getMaxValueNode(node) {
    let current = node;
    while (current && current.right) {
      current = current.right;
    }
    return current;
  }

  /**
   * Search for a value in the tree
   * @param {number} value 
   * @returns {AVLNode|null} Node with the value or null
   */
  search(value) {
    let current = this.root;
    while (current) {
      if (value === current.value) {
        return current;
      } else if (value < current.value) {
        current = current.left;
      } else {
        current = current.right;
      }
    }
    return null;
  }

  /**
   * Delete a node from the AVL tree (recursive helper)
   * @param {AVLNode} node 
   * @param {number} value 
   * @returns {AVLNode} Root of the subtree
   */
  deleteNode(node, value) {
    if (!node) return node;

    // Standard BST deletion
    if (value < node.value) {
      node.left = this.deleteNode(node.left, value);
    } else if (value > node.value) {
      node.right = this.deleteNode(node.right, value);
    } else {
      // Node to be deleted found

      // Case 1: Node with only one child or no child
      if (!node.left) {
        return node.right;
      } else if (!node.right) {
        return node.left;
      }

      // Case 2: Node with two children
      // Get the inorder successor (smallest in the right subtree)
      const minNode = this.getMinValueNode(node.right);
      node.value = minNode.value;
      node.right = this.deleteNode(node.right, minNode.value);
    }

    // Balance the node
    return this.balance(node);
  }

  /**
   * Delete a value from the AVL tree
   * @param {number} value 
   */
  delete(value) {
    this.animationSteps = [];
    this.root = this.deleteNode(this.root, value);
  }
}
