# Matrix

Class for handling matricies easily.

#### Initialization

```
const matrix = new Matrix(4, 5);

// matrix.values has 4 rows and 5 columns
```

By default `Matrix` is initialized with all zeros. You can also initialize it with a value like this.

```
const matrix = new Matrix(4, 5, 8);

// matrix.values has 4 rows and 5 columns which is filled with all 8s
```

If you just want the raw arrays, and not the `Matrix` wrapper, you can do the same initilaizations this way.

```

// 5 by 5 matrix of zeros
const zeros_matrix = Matrix.zeros(5, 5);

// 2 by 3 matrix of 5s
const fives_matrix = Matrix.full(2, 3, 5);

```

### Accessing / Setting a Matrix

#### `matrix.get(row, col)`

Get a single cell.

#### `matrix.set(row, col)`

Set a single cell.

#### `matrix.getRow(row)`

Get a single row by index.

#### `matrix.setRow(row, val)`

Set an entire single row by index with a value.

#### `matrix.getCol(col)`

Get a single col by index.

#### `matrix.setCol(col, val)`

Set an entire single column by index with a value.

#### `matrix.getRows(from, to)`

Get multiple rows by indicies.

#### `matrix.shape()`

Return dimensions of matrix.

#### `matrix.shuffle()`

Shuffle the rows of the matrix.