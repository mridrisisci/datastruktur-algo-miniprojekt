export class TreeRenderer {

    constructor(svgElement) {
        this.svg = svgElement;
    }

    clear() {
        this.svg.innerHTML = "";
    }

    // Compute positions for all nodes and return a map: value -> {x,y,node}
    layoutPositions(node, x = 500, y = 40, levelGap = 60, positions = {}) {
        if (!node) return positions;
        const leftX = x - levelGap * (3 - levelGap / 60);
        const rightX = x + levelGap * (3 - levelGap / 60);
        const nextY = y + 70;

        positions[node.value] = { x, y, node };

        if (node.left) this.layoutPositions(node.left, leftX, nextY, levelGap * 0.7, positions);
        if (node.right) this.layoutPositions(node.right, rightX, nextY, levelGap * 0.7, positions);
        return positions;
    }

    // Draw a static snapshot (full tree)
    drawSnapshot(root, x = 500, y = 40, levelGap = 60) {
        this.clear();
        if (!root) return;
        const pos = this.layoutPositions(root, x, y, levelGap);
        // draw edges
        for (const key in pos) {
            const item = pos[key];
            const n = item.node;
            if (n.left) {
                const child = pos[n.left.value];
                if (child) this.drawLine(item.x, item.y, child.x, child.y);
            }
            if (n.right) {
                const child = pos[n.right.value];
                if (child) this.drawLine(item.x, item.y, child.x, child.y);
            }
        }
        // draw nodes
        for (const key in pos) {
            const item = pos[key];
            this.drawCircle(item.x, item.y, item.node.value);
        }
    }

    // Animate transition from one snapshot to another over duration (ms)
    animateTransition(fromRoot, toRoot, duration = 400) {
        // compute layouts
        const fromPos = fromRoot ? this.layoutPositions(fromRoot) : {};
        const toPos = toRoot ? this.layoutPositions(toRoot) : {};

        // clear svg and create elements at from positions (or to positions if missing)
        this.clear();

        // create edges for target (we'll animate lines)
        const edgeElements = {};
        for (const key in toPos) {
            const item = toPos[key];
            const n = item.node;
            if (n.left) {
                const child = toPos[n.left.value];
                if (child) {
                    const id = `e-${n.value}-${child.node.value}`;
                    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                    line.setAttribute('id', id);
                    const fx = (fromPos[n.value] || item).x;
                    const fy = (fromPos[n.value] || item).y;
                    const cx = (fromPos[n.left.value] || child).x;
                    const cy = (fromPos[n.left.value] || child).y;
                    line.setAttribute('x1', fx);
                    line.setAttribute('y1', fy);
                    line.setAttribute('x2', cx);
                    line.setAttribute('y2', cy);
                    this.svg.appendChild(line);
                    edgeElements[id] = { line, from: { x1: fx, y1: fy, x2: cx, y2: cy }, to: { x1: item.x, y1: item.y, x2: child.x, y2: child.y } };
                }
            }
            if (n.right) {
                const child = toPos[n.right.value];
                if (child) {
                    const id = `e-${n.value}-${child.node.value}`;
                    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                    line.setAttribute('id', id);
                    const fx = (fromPos[n.value] || item).x;
                    const fy = (fromPos[n.value] || item).y;
                    const cx = (fromPos[n.right.value] || child).x;
                    const cy = (fromPos[n.right.value] || child).y;
                    line.setAttribute('x1', fx);
                    line.setAttribute('y1', fy);
                    line.setAttribute('x2', cx);
                    line.setAttribute('y2', cy);
                    this.svg.appendChild(line);
                    edgeElements[id] = { line, from: { x1: fx, y1: fy, x2: cx, y2: cy }, to: { x1: item.x, y1: item.y, x2: child.x, y2: child.y } };
                }
            }
        }

        // create nodes for target
        const nodeElements = {};
        for (const key in toPos) {
            const item = toPos[key];
            const start = fromPos[key] || item;
            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute('cx', start.x);
            circle.setAttribute('cy', start.y);
            circle.setAttribute('r', 20);
            circle.setAttribute('id', `n-${key}`);
            this.svg.appendChild(circle);
            const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
            label.setAttribute('x', start.x);
            label.setAttribute('y', start.y + 4);
            label.setAttribute('text-anchor', 'middle');
            label.setAttribute('font-size', '14');
            label.setAttribute('id', `t-${key}`);
            label.textContent = item.node.value;
            this.svg.appendChild(label);
            nodeElements[key] = { circle, label, from: { x: start.x, y: start.y }, to: { x: item.x, y: item.y } };
        }

        // animate
        const startTime = performance.now();
        const dur = duration;

        const step = (time) => {
            const t = Math.min(1, (time - startTime) / dur);
            for (const k in nodeElements) {
                const el = nodeElements[k];
                const cx = el.from.x + (el.to.x - el.from.x) * t;
                const cy = el.from.y + (el.to.y - el.from.y) * t;
                el.circle.setAttribute('cx', cx);
                el.circle.setAttribute('cy', cy);
                el.label.setAttribute('x', cx);
                el.label.setAttribute('y', cy + 4);
            }
            for (const k in edgeElements) {
                const e = edgeElements[k];
                const x1 = e.from.x1 + (e.to.x1 - e.from.x1) * t;
                const y1 = e.from.y1 + (e.to.y1 - e.from.y1) * t;
                const x2 = e.from.x2 + (e.to.x2 - e.from.x2) * t;
                const y2 = e.from.y2 + (e.to.y2 - e.from.y2) * t;
                e.line.setAttribute('x1', x1);
                e.line.setAttribute('y1', y1);
                e.line.setAttribute('x2', x2);
                e.line.setAttribute('y2', y2);
            }
            if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }

    drawCircle(x, y, text) {
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", x);
        circle.setAttribute("cy", y);
        circle.setAttribute("r", 20);
        this.svg.appendChild(circle);

        const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
        label.setAttribute("x", x);
        label.setAttribute("y", y+4);
        label.setAttribute("text-anchor", "middle");
        label.setAttribute("font-size", "14");
        label.textContent = text;
        this.svg.appendChild(label);
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
