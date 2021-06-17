var x = [];
for(let i = 201; i <= 260; i++) {

    let name = '';
    if(i.toString().length === 1) {
        name += '00' + i.toString()
    } else if (i.toString().length === 2) {
        name += '0' + i.toString()
    } else {
        name = i.toString()
    }

    x.push(`${name}.gif`);
}

console.log(x)