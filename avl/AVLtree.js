class AVLNode {
    constructor(value) {
        this.value = value;
        this.left = null;
        this.right = null;
        this.height = 1;
    }
}

class AVLTree {
    constructor() {
        /*
        // no nodes exist yet, all nodes are accessible from here

        */ 
        this.root = null;
    }

    getHeight(node) {
        return node ? node.height : 0; // returns height of node or 0 
    }

    getBalance(node) {
        // calculates balancefactor for node & returns OR returns 0 
        return node ? this.getHeight(node.left) - this.getHeight(node.right) : 0; 
    }


    
    rotateRight(y) {
        const x = y.left;
        const T2 = x.right;
        x.right = y;
        y.left = T2;
        y.height = 1 + Math.max(this.getHeight(y.left), this.getHeight(y.right));
        x.height = 1 + Math.max(this.getHeight(x.left), this.getHeight(x.right));
        return x;
    }
    rotateLeft(x) {
        const y = x.right;
        const T2 = y.left;
        y.left = x;
        x.right = T2;
        x.height = 1 + Math.max(this.getHeight(x.left), this.getHeight(x.right));
        y.height = 1 + Math.max(this.getHeight(y.left), this.getHeight(y.right));
        return y;
    }

    insertnode(node, value)
    {
        if (node === null) {
            let newNode = AVLNode(value);
            this.notify("insert", newNode);
            return newNode;
        }

        if (value < node.value) {
            node.left = this.insertnode(node.left, value) // insert node to the left side
        } else if (valur > node.value) {
            // insert node to the right side
            node.right = this.insertnode(node.right, value)
        } else {
            return node; // no duplicates
        }

        // update height & balancefactor
        node.height = 1 + max( height(left), height(right) );
        balance = getBalance(node);

        // LL-rotation
        if (balance > 1 && value < node.left.value) {
            let rotated = this.rotateRight(node);
            this.notify("rotateRight", rotated); // show rotation to frontend
            return rotated;
        }

        // RR-rotation
        if (balance < -1 && value > node.right.value) {
            let rotated = this.rotateLeft(node);
            this.notify("rotateLeft", rotated);
            return rotated
        }
        // lr rotation
        if (balance > 1 && value < node.right.value) {
            node.left = this.rotateLeft(node.left);
            let rotated = this.rotateRight(node);
            this.notify("rotateRightLeft", rotated);
            return rotated
        }

    }


    insertNode(node, value) {
        if (!node) return new AVLNode(value);
        if (value < node.value) node.left = this.insertNode(node.left, value);
        else if (value > node.value) node.right = this.insertNode(node.right, value);
        else return node;

        node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
        const balance = this.getBalance(node);

        if (balance > 1 && value < node.left.value) return this.rotateRight(node);
        if (balance < -1 && value > node.right.value) return this.rotateLeft(node);
        if (balance > 1 && value > node.left.value) {
            node.left = this.rotateLeft(node.left);
            return this.rotateRight(node);
        }
        if (balance < -1 && value < node.right.value) {
            node.right = this.rotateRight(node.right);
            return this.rotateLeft(node);
        }
        return node;
    }

    insert(value) {
        this.root = this.insertNode(this.root, value);
    }

    steps = []
    cloneTree()
    {

    }

    addStep(type, value)
    {

    }
    nextStep() {

    }
}

export { AVLTree, AVLNode };
