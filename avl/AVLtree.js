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
    const tempRightSubtree = newRoot.right;

    newRoot.right = oldRoot;
    oldRoot.left = tempRightSubtree;
 
    this.updateHeight(oldRoot);
    this.updateHeight(newRoot);

    return newRoot;
  }

  rotateLeft(oldRoot) {
    const newRoot = oldRoot.right;
    const tempLeftSubtree = newRoot.left;

    newRoot.left = oldRoot;
    oldRoot.right = tempLeftSubtree;

    this.updateHeight(oldRoot);
    this.updateHeight(newRoot);

    return newRoot;
  }

  rotateLeftRight(rootNode) {
    const preFirstRotationSnapshot = this.cloneTree(this.root);
    rootNode.left = this.rotateLeft(rootNode.left);
    if (this.root === rootNode) this.root = rootNode;

    // svg 
    const postFirstRotationSnapshot = this.cloneTree(this.root);
    this.animationSteps.push({
      label: 'Left Rotation (LR - Step 1)',
      before: preFirstRotationSnapshot,
      after: postFirstRotationSnapshot
    });

    const preSecondRotationSnapshot = this.cloneTree(this.root);
    const intermediate = this.createIntermediateRightRotation(rootNode);
    this.animationSteps.push({
      label: 'Right Rotation (LR - In Progress)',
      before: preSecondRotationSnapshot,
      after: intermediate
    });
    // svg - ends 

    const result = this.rotateRight(rootNode);
    if (this.root === rootNode) this.root = result;

    // svg 
    const postSecondRotationSnapshot = this.cloneTree(this.root);
    this.animationSteps.push({
      label: 'Right Rotation (LR - Complete)',
      before: intermediate,
      after: postSecondRotationSnapshot
    });
    // svg - ends 

    return result;
  }

  rotateRightLeft(rootNode) {
    const preFirstRotationSnapshot = this.cloneTree(this.root);

    rootNode.right = this.rotateRight(rootNode.right);
    if (this.root === rootNode) this.root = rootNode;

    // for svg
    const postFirstRotationSnapshot = this.cloneTree(this.root);
    this.animationSteps.push({
      label: 'Right Rotation (RL - Step 1)',
      before: preFirstRotationSnapshot,
      after: postFirstRotationSnapshot
    });

    const preSecondRotationSnapshot = this.cloneTree(this.root);
    const intermediate = this.createIntermediateLeftRotation(rootNode);
    this.animationSteps.push({
      label: 'Left Rotation (RL - In Progress)',
      before: preSecondRotationSnapshot,
      after: intermediate
    });
    // for svg - ends

    const result = this.rotateLeft(rootNode);
    if (this.root === rootNode) this.root = result;

    // for svg 
    const postSecondRotationSnapshot = this.cloneTree(this.root);
    this.animationSteps.push({
      label: 'Left Rotation (RL - Complete)',
      before: intermediate,
      after: postSecondRotationSnapshot
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

      // for SVG
      const before = this.cloneTree(this.root);
      const intermediate = this.createIntermediateRightRotation(node); // LL-case (visuelt)
      this.animationSteps.push({
        label: 'Right Rotation - In Progress',
        before,
        after: intermediate
      });
      // svg - ends


      const result = this.rotateRight(node); // LL-case -> rotation | new root is set
      if (this.root === node) this.root = result;
      const after = this.cloneTree(this.root);

      // svg 
      this.animationSteps.push({
        label: 'Right Rotation - Complete',
        before: intermediate,
        after
      });
      // svg - ends

      return result;
    }
    if (balanceFactor < -1) {
      if (this.getBalanceFactor(node.right) > 0) {
        return this.rotateRightLeft(node);
      }

      // svg 
      const before = this.cloneTree(this.root);
      const intermediate = this.createIntermediateLeftRotation(node); // RR-case (visuelt)
      this.animationSteps.push({
        label: 'Left Rotation - In Progress',
        before,
        after: intermediate
      });
      // svg - ends 

      const result = this.rotateLeft(node); // RR-case -> rotation | new root is set
      if (this.root === node) this.root = result;

      // svg 
      const after = this.cloneTree(this.root);
      this.animationSteps.push({
        label: 'Left Rotation - Complete',
        before: intermediate,
        after
      });
      // svg - ends 
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

  // show node on canvas
  findNodeById(node, id) {
    if (!node) return null;
    if (node.id === id) return node;
    return this.findNodeById(node.left, id) || this.findNodeById(node.right, id);
  }


}
