export class AVLNode {
  constructor(value) {
    this.value = value; // receives from frontend
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
    const new_node_left = new_root.right; // null 

    new_root.right = old_root; // 30
    old_root.left = new_node_left; // 10

    /*
    eksemplet er med værdierne: 30,20,10 
    old root = 30 -> height = 1 + (0,0) === height is 1
    new root = 20 -> height = 1 + (1,1) === height is 2
    */
    old_root.height = 1 + Math.max(this.getHeight(old_root.left), this.getHeight(old_root.right)); 
    new_root.height = 1 + Math.max(this.getHeight(new_root.left), this.getHeight(new_root.right));

    return new_root;
  }

  leftRotate(old_root) {
    const new_root = old_root.right;
    const new_node_right = new_root.left;

    new_root.left = old_root;
    old_root.right = new_node_right;

    old_root.height = 1 + Math.max(this.getHeight(old_root.left), this.getHeight(old_root.right));
    new_root.height = 1 + Math.max(this.getHeight(new_root.left), this.getHeight(new_root.right));

    return new_root;
  }

  insertNode(node, value) {
    // if no node, it creates a new node
    if (!node) return new AVLNode(value);

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
    checks if a rotation is neededd
    */
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
    // receives value from front-end "insert" button
    this.root = this.insertNode(this.root, value);
  }
}
