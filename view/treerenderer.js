export class TreeRenderer {
  constructor(svgElement) {
    this.svg = svgElement;
    // Keep a reference to SVG elements per logical AVL node id
    this.nodeElements = new Map();
    // Label element for showing rotation type
    this.rotationLabel = null;
  }

  clear() {
    // Only clear connecting lines so <g> node elements can be reused
    const lines = this.svg.querySelectorAll('line');
    lines.forEach(line => line.remove());
  }

  // Completely reset the SVG and forget all cached node elements.
  // Used when navigating backwards/forwards in history where we
  // simply want to redraw the tree from scratch.
  reset() {
    this.svg.innerHTML = "";
    this.nodeElements.clear();
    this.rotationLabel = null;
  }

  // Show a label indicating which rotation type is being animated
  showRotationLabel(rotationType) {
    if (this.rotationLabel) {
      this.rotationLabel.remove();
    }
    
    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("x", 50);
    label.setAttribute("y", 30);
    label.setAttribute("font-size", "18");
    label.setAttribute("fill", "#ff5722");
    label.setAttribute("font-weight", "bold");
    label.textContent = `Rotation: ${rotationType.toUpperCase()}`;
    this.svg.appendChild(label);
    this.rotationLabel = label;
  }

  drawNode(node, x, y, levelGap = 60) {
    if (!node) return;

    // Store calculated layout position on the node for later animation use
    node.x = x;
    node.y = y;

    const leftX = x - levelGap;
    const rightX = x + levelGap;
    const nextY = y + 80;

    if (node.left) {
      this.drawLine(x, y, leftX, nextY);
      this.drawNode(node.left, leftX, nextY, levelGap * 0.7);
    }
    if (node.right) {
      this.drawLine(x, y, rightX, nextY);
      this.drawNode(node.right, rightX, nextY, levelGap * 0.7);
    }

    this.drawOrUpdateNode(node);
  }

  // Draw the entire tree assuming that each node already has
  // an x/y position assigned. This is used when stepping
  // through precomputed animation frames.
  drawFromStoredPositions(node) {
    if (!node) return;

    if (node.left) {
      this.drawLine(node.x, node.y, node.left.x, node.left.y);
      this.drawFromStoredPositions(node.left);
    }
    if (node.right) {
      this.drawLine(node.x, node.y, node.right.x, node.right.y);
      this.drawFromStoredPositions(node.right);
    }

    this.drawOrUpdateNode(node);
  }

  drawOrUpdateNode(node) {
    let group = this.nodeElements.get(node.id);

    if (!group) {
      group = document.createElementNS("http://www.w3.org/2000/svg", "g");
      group.setAttribute("data-node-id", node.id);

      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("r", 20);
      // Animate movement when cx/cy change
      circle.style.transition = "cx 0.4s ease, cy 0.4s ease";

      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.textContent = node.value;
      // Animate movement of the text label together with the circle
      label.style.transition = "x 0.4s ease, y 0.4s ease";

      group.appendChild(circle);
      group.appendChild(label);
      this.svg.appendChild(group);
      this.nodeElements.set(node.id, group);
    }

    const circle = group.querySelector('circle');
    const label = group.querySelector('text');

    if (circle) {
      circle.setAttribute("cx", node.x);
      circle.setAttribute("cy", node.y);
    }

    if (label) {
      label.setAttribute("x", node.x);
      // Small offset so the number is vertically centered
      label.setAttribute("y", node.y + 5);
      label.textContent = node.value;
    }
  }

  drawLine(x1, y1, x2, y2) {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    this.svg.appendChild(line);
  }
}
