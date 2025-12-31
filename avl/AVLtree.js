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

  getHeight(node) {
    return node ? node.height : 0;
  }

  updateHeight(node) {
    if (node) {
      node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
    }
  }

  getBalanceFactor(node) {
    return node ? this.getHeight(node.left) - this.getHeight(node.right) : 0;
  }

  rotateRight(oldRoot) {
    const newRoot = oldRoot.left;
    const rightSubtreeOfNewRoot = newRoot.right;

    newRoot.right = oldRoot;
    oldRoot.left = rightSubtreeOfNewRoot;

    this.updateHeight(oldRoot);
    this.updateHeight(newRoot);

    return newRoot;
  }

  rotateLeft(oldRoot) {
    const newRoot = oldRoot.right;
    const leftSubtreeOfNewRoot = newRoot.left;

    newRoot.left = oldRoot;
    oldRoot.right = leftSubtreeOfNewRoot;

    this.updateHeight(oldRoot);
    this.updateHeight(newRoot);

    return newRoot;
  }

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

  balance(node) {
    if (!node) return node;

    this.updateHeight(node);
    const balanceFactor = this.getBalanceFactor(node);

    if (balanceFactor > 1) {
      if (this.getBalanceFactor(node.left) < 0) {
        return this.rotateLeftRight(node);
      }
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

    if (balanceFactor < -1) {
      if (this.getBalanceFactor(node.right) > 0) {
        return this.rotateRightLeft(node);
      }
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

  insertNode(node, value) {
    if (!node) {
      return new AVLNode(value);
    }

    if (value < node.value) {
      node.left = this.insertNode(node.left, value);
    } else if (value > node.value) {
      node.right = this.insertNode(node.right, value);
    } else {
      return node;
    }

    return this.balance(node);
  }

  insert(value) {
    this.animationSteps = [];
    this.root = this.insertNode(this.root, value);
  }

  inorderTraversal(node = this.root, result = []) {
    if (node) {
      this.inorderTraversal(node.left, result);
      result.push(node.value);
      this.inorderTraversal(node.right, result);
    }
    return result;
  }


}
