export class AVLNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
    this.height = 1;
  }
}

export class AVLTree {
  constructor() {
    this.root = null;
  }

  getHeight(node) {
    return node ? node.height : 0;
  }

  getBalance(node) {
    return node ? this.getHeight(node.left) - this.getHeight(node.right) : 0;
  }

  rightRotate(old_root) {
    const new_root = old_root.left; // 20
    const subtree = new_root.right; // null 

    new_root.right = old_root; // null ?
    old_root.left = subtree; // 20

    old_root.height = 1 + Math.max(this.getHeight(old_root.left), this.getHeight(old_root.right));
    new_root.height = 1 + Math.max(this.getHeight(new_root.left), this.getHeight(new_root.right));

    return new_root;
  }

  leftRotate(old_root) {
    const new_root = old_root.right;
    const subtree = new_root.left;

    new_root.left = old_root;
    old_root.right = subtree;

    old_root.height = 1 + Math.max(this.getHeight(old_root.left), this.getHeight(old_root.right));
    new_root.height = 1 + Math.max(this.getHeight(new_root.left), this.getHeight(new_root.right));

    return new_root;
  }

  insertNode(node, value) {
    if (!node) return new AVLNode(value);

    if (value < node.value) {
      node.left = this.insertNode(node.left, value);
    } else if (value > node.value) {
      node.right = this.insertNode(node.right, value);
    } else {
      return node;
    }

    node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));

    const balance = this.getBalance(node);

    if (balance > 1 && value < node.left.value) {
      return this.rightRotate(node);
    }
    if (balance < -1 && value > node.right.value) {
      return this.leftRotate(node);
    }
    if (balance > 1 && value > node.left.value) {
      node.left = this.leftRotate(node.left);
      return this.rightRotate(node);
    }
    if (balance < -1 && value < node.right.value) {
      node.right = this.rightRotate(node.right);
      return this.leftRotate(node);
    }

    return node;
  }

  insert(value) {
    this.root = this.insertNode(this.root, value);
  }
}
