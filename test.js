
class Matrix {

    constructor(h, w, v = 0) {

        this.values = Matrix.full2d(h, w, v);
        
    }

    // Get a single cell
    get(row, col) {
        return this.values[row][col];
    }

    // Set a single cell
    set(row, col, val) {
        if(row >= this.values.length || col >= this.values[0].length) {
            throw new Error('Set index out of bounds.');
        } else {
            this.values[row][col] = val;
        }
    }

    // Set a row with a specific value
    setRow(row, val) {
        if(row >= this.values.length) {
            throw new Error('Set row index out of bounds.');
        } else {
            for(let i = 0; i < this.values[row].length; i++) {
                this.values[row][i] = val;
            }
        }
    }

    // Set a row with an existing array
    setRowFromArray(row, array) {

        // Check to make sure dimensions are equal
        if(this.values[row].length !== array.length) {
            throw new Error('Row assignment cannot be done because dimensions are not equal.');
        }

        // Set values
        this.values[row] = array;
    }

    // Set a column with a specific value
    setCol(col, val) {
        if(col >= this.values[0].length) {
            throw new Error('Set column index out of bounds.');
        } else {
            for(let i = 0; i < this.values.length; i++) {
                this.values[i][col] = val;
            }
        }
    }

    // Set a column from an existing array
    setColFromArray(col, array) {

        // Check to make sure dimensions are equal
        if(this.values.length !== array.length) {
            throw new Error('Column assignment cannot be done because dimensions are not equal.');
        }

        // Set values
        for(let i = 0; i < array.length; i++) {
            this.set(i, col, array[i]);
        }

    }

    // Return a single row from the trialseq
    getRow(row) {
        return this.values[row];
    }

    // Return a single column from the trialseq
    getCol(col) {
        return this.values.map(row => row[col]);
    }

    // Get column by criteria
    getColByCriteria(col, fn) {

        return this.getCol(col).filter(fn);

    }

    // Get all rows and columns by column criteria
    getRowsAndColumnsByCriteria(fn) {

        var rows = [];
        for(let i = 0; i < this.values.length; i++) {
            if(fn(this.getRow(i))) {
                rows.push(this.values[i]);
            }
        }
        return rows.length > 0 ? Matrix.initFromMatrix(rows) : null;

    }

    // Get multiple rows
    getRows(from, to) {
        var rows = [];
        for(let i = from; i < to; i++) {
            rows.push(this.values[i]);
        }
        return rows;
    }

    // Get the shape of the matrix
    shape() {
        return [this.values.length, this.values[0].length];
    }

    // Shuffle the trial sequence
    shuffle() {
        this.values = this.values.sort(() => Math.random() - 0.5)
    }

    // Scan an array to see if there are multiple in a row
    static scan(array, length) {
        var count = 0,
            value = array[0];

        return array.some(function (a) {
            if (value !== a) {
                count = 0;
                value = a;
            }
            return ++count === length;
        });
    }

    // Shuffle an array (not in place)
    static shuffleArray(arr) {
        var j, x, i;
        for (i = arr.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            x = arr[i];
            arr[i] = arr[j];
            arr[j] = x;
        }
        return arr;
    }

    // Create an array of zeros
    static zeros(len) {
        var a = new Array(len);
        for(let i = 0; i < len; ++i) a[i] = 0;
        return a;
    }

    // Create an array filled with a particular value
    static full(len, val) {
        var a = new Array(len);
        for(let i = 0; i < len; ++i) a[i] = val;
        return a;
    }

    // Create a 2d matrix of zeros
    static zeros2d(height, width) {

        var rows = [];
        for(let i = 0; i < height; i++) {

            // Init rows
            var row = [];

            // Append columns
            for(let ii = 0; ii < width; ii++) { row.push(0) }

            // Append to matrix
            rows.push(row);

        }

        return rows

    }

    // Create a 2d matrix with a specified value
    static full2d(height, width, val) {

        var rows = [];
        for(let i = 0; i < height; i++) {

            // Init rows
            var row = [];

            // Append columns
            for(let ii = 0; ii < width; ii++) { row.push(val) }

            // Append to matrix
            rows.push(row);

        }

        return rows

    }

    // Concat multiple Matrix instances together
    static append(matricies) {

        // If we only have 1 matrix then just return that
        if(matricies.length === 1) {
            return matricies[0];
        }

        // Validate array of inputs
        matricies.forEach(matrix => {

            // Check to make sure all array items are of the Matrix class
            if(matrix instanceof Matrix === false) {
                throw new Error('All array items must be an instance of Matrix class.');
            }

        })

        // Validate that all matricies have the same number of columns
        const [ , columns] = matricies[0].shape();
        matricies.forEach(matrix => {

            let [ , cols] = matrix.shape();
            if(columns !== cols) {
                throw new Error('Matrix columns are not equal.');
            }

        })

        // Merge raw values
        var rawArray = [];
        matricies.forEach(_m => { rawArray = [...rawArray, ..._m.values] });

        return Matrix.initFromMatrix(rawArray);

    }

    // Initialize an instance of this class from an existing matrix
    static initFromMatrix(matrix) {

        // Validate that it is a matrix
        if(matrix instanceof Array === false) {
            throw new Error('Cannot build from non-array type.');
        }

        // Validate that we have at least 1 row and at least 1 column
        if(matrix.length === 0 || matrix[0].length === 0) {
            throw new Error('Matrix must have at least 1 row and 1 column');
        }

        const rows = matrix.length;
        const columns = matrix[0].length;

        // Build new matrix
        var m = new Matrix(rows, columns);
        for(let r = 0; r < rows; r++) {
            // Validate that column dims are always equal
            if(matrix[r].length !== columns) {
                throw new Error('Matrix dimensions are not equivalent.');
            }
            m.setRowFromArray(r, matrix[r]);
        }

        return m;

    }

    // Create a range of numbers as an array by increment
    static range(from, to, step) {
        return [ ...Array(Math.floor((to - from) / step) + 1) ].map((_, i) => from + i * step);
    }

    // Calculate mean of an array
    static mean(arr) {
        return arr.reduce((acc, val) => acc + val, 0) / arr.length;
    }

    // Get the sum of an array
    static sum(arr) {
        return arr.reduce((acc, val) => acc + val, 0)
    }

    // Get a random integer between two values
    static randInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
    }

    // Print the matrix as a table to the console
    print() {
        console.table(this.values);
    }

}


const sizeof = require('object-sizeof');

const matrix = new Matrix(500, 500);
console.log(sizeof(JSON.stringify(matrix.values)));

console.log(sizeof('Hello World'));
console.log(sizeof('SGVsbG8gV29ybGQ='));