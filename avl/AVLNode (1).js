export class AVLNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
    this.height = 1;
    this.id = AVLNode.nextId++;
    this.x = 0;
    this.y = 0;
  }

  static nextId = 0;
}
