const fs = require('fs');
const path = require('path');

const fullfile = path.join(__dirname, 'public', 'svg');
console.log(fullfile);
const f = fs.readdirSync(fullfile, () => {});
console.log(f);