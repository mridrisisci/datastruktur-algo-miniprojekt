export class TreeRenderer {
  constructor(svg) {
    this.svg = svg;
    this.nodeRadius = 25;
  }

  /**
   * Clear the SVG canvas
   */
  reset() {
    while (this.svg.firstChild) {
      this.svg.removeChild(this.svg.firstChild);
    }
  }

  /**
   * Create an SVG element with attributes
   * @param {string} tag 
   * @param {object} attrs 
   * @returns {SVGElement}
   */
  createSVGElement(tag, attrs = {}) {
    const element = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [key, value] of Object.entries(attrs)) {
      element.setAttribute(key, value);
    }
    return element;
  }

  /**
   * Draw a line between two points
   * @param {number} x1 
   * @param {number} y1 
   * @param {number} x2 
   * @param {number} y2 
   * @param {string} color 
   */
  drawLine(x1, y1, x2, y2, color = '#666') {
    const line = this.createSVGElement('line', {
      x1: x1,
      y1: y1,
      x2: x2,
      y2: y2,
      stroke: color,
      'stroke-width': 2
    });
    this.svg.appendChild(line);
  }

  /**
   * Draw a circle (node)
   * @param {number} x 
   * @param {number} y 
   * @param {string} fillColor 
   * @param {string} strokeColor 
   */
  drawCircle(x, y, fillColor = '#4CAF50', strokeColor = '#2E7D32') {
    const circle = this.createSVGElement('circle', {
      cx: x,
      cy: y,
      r: this.nodeRadius,
      fill: fillColor,
      stroke: strokeColor,
      'stroke-width': 2
    });
    this.svg.appendChild(circle);
  }

  /**
   * Draw text at a position
   * @param {number} x 
   * @param {number} y 
   * @param {string} text 
   * @param {string} color 
   */
  drawText(x, y, text, color = 'white') {
    const textElement = this.createSVGElement('text', {
      x: x,
      y: y + 5,
      'text-anchor': 'middle',
      'font-size': '16',
      'font-weight': 'bold',
      fill: color
    });
    textElement.textContent = text;
    this.svg.appendChild(textElement);
  }

  /**
   * Draw a node with its value
   * @param {object} node 
   */
  drawNode(node) {
    if (!node) return;

    // Draw edges to children first (so they appear behind nodes)
    if (node.left) {
      this.drawLine(node.x, node.y, node.left.x, node.left.y);
    }
    if (node.right) {
      this.drawLine(node.x, node.y, node.right.x, node.right.y);
    }

    // Draw the node circle
    this.drawCircle(node.x, node.y);

    // Draw the value text
    this.drawText(node.x, node.y, node.value.toString());

    // Recursively draw children
    if (node.left) this.drawNode(node.left);
    if (node.right) this.drawNode(node.right);
  }

  /**
   * Draw the tree from stored positions (used for animation snapshots)
   * @param {object} root 
   */
  drawFromStoredPositions(root) {
    if (!root) return;

    const queue = [root];
    const edges = [];
    const nodes = [];

    // Collect all edges and nodes
    while (queue.length > 0) {
      const node = queue.shift();
      nodes.push(node);

      if (node.left) {
        edges.push({ from: node, to: node.left });
        queue.push(node.left);
      }
      if (node.right) {
        edges.push({ from: node, to: node.right });
        queue.push(node.right);
      }
    }

    // Draw edges first
    edges.forEach(edge => {
      this.drawLine(edge.from.x, edge.from.y, edge.to.x, edge.to.y);
    });

    // Draw nodes with special coloring based on operation state
    nodes.forEach(node => {
      let fillColor = '#4CAF50';  // default green
      let strokeColor = '#2E7D32';

      // Search operation colors
      if (node.isSearchFound) {
        fillColor = '#4CAF50';  // green for found
        strokeColor = '#1B5E20';
      } else if (node.isSearchCurrent) {
        fillColor = '#FF9800';  // orange for current node in search
        strokeColor = '#E65100';
      }

      // Delete operation colors
      if (node.isBeingDeleted) {
        fillColor = '#F44336';  // red for being deleted
        strokeColor = '#C62828';
      }

      // Rotation markers (visual only; structure stays valid)
      if (node.isRotationPivot) {
        strokeColor = '#7E57C2'; // purple border for pivot
        fillColor = '#B39DDB';
      } else if (node.isRotationChild) {
        strokeColor = '#FB8C00'; // orange border for child
        fillColor = '#FFD180';
      } else if (node.isRotationExtra) {
        strokeColor = '#29B6F6'; // light blue border for extra/grandchild
        fillColor = '#B3E5FC';
      }

      this.drawCircle(node.x, node.y, fillColor, strokeColor);
      this.drawText(node.x, node.y, node.value.toString());
    });
  }

  /**
   * Show a rotation label on the canvas
   * @param {string} label 
   */
  showRotationLabel(label) {
    if (!label) return;
    // Dynamically size the label box so long text stays readable
    const paddingX = 14;
    const paddingY = 10;
    const minWidth = 220;
    const charWidth = 7; // rough average width per character at font-size 15
    const width = Math.max(minWidth, paddingX * 2 + label.length * charWidth);
    const height = 32 + paddingY; // more compact to reduce overlap
    const x = 12;
    const y = 8; // keep box near the top to avoid overlapping the tree
    const centerX = x + width / 2;
    const centerY = y + height / 2 + 4; // slight offset to visually center text

    const rect = this.createSVGElement('rect', {
      x,
      y,
      width,
      height,
      fill: '#2196F3',
      rx: 6,
      ry: 6
    });
    this.svg.appendChild(rect);

    const textElement = this.createSVGElement('text', {
      x: centerX,
      y: centerY,
      'text-anchor': 'middle',
      'font-size': '15',
      'font-weight': 'bold',
      fill: 'white'
    });
    textElement.textContent = label;
    this.svg.appendChild(textElement);
  }

  /**
   * Highlight a specific node
   * @param {object} node 
   * @param {string} color 
   */
  highlightNode(node, color = '#FF5722') {
    if (!node) return;
    this.drawCircle(node.x, node.y, color, '#D84315');
    this.drawText(node.x, node.y, node.value.toString());
  }

  /**
   * Draw height information next to nodes (for debugging)
   * @param {object} node 
   */
  drawHeightInfo(node) {
    if (!node) return;

    const textElement = this.createSVGElement('text', {
      x: node.x + this.nodeRadius + 10,
      y: node.y,
      'font-size': '12',
      fill: '#666'
    });
    textElement.textContent = `h:${node.height}`;
    this.svg.appendChild(textElement);

    if (node.left) this.drawHeightInfo(node.left);
    if (node.right) this.drawHeightInfo(node.right);
  }

  /**
   * Draw balance factor next to nodes (for debugging)
   * @param {object} node 
   * @param {function} getBalanceFactor 
   */
  drawBalanceFactorInfo(node, getBalanceFactor) {
    if (!node) return;

    const bf = getBalanceFactor(node);
    const textElement = this.createSVGElement('text', {
      x: node.x - this.nodeRadius - 10,
      y: node.y,
      'font-size': '12',
      'text-anchor': 'end',
      fill: Math.abs(bf) > 1 ? '#F44336' : '#666'
    });
    textElement.textContent = `bf:${bf}`;
    this.svg.appendChild(textElement);

    if (node.left) this.drawBalanceFactorInfo(node.left, getBalanceFactor);
    if (node.right) this.drawBalanceFactorInfo(node.right, getBalanceFactor);
  }
}
