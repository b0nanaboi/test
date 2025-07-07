//turns console errors into alerts
/*
window.onerror = function(message, source, lineno, colno, error) {
    alert('Error: ' + message + '\nAt: ' + source + ':' + lineno);
  };
*/



let world = document.querySelector('#world');
let worldarr = [];
let columns = 40; //scaleable to any amount

let layers = {
    sky: 4,
    air: 5,
    dirt: 4
}

let ores = {
    coal: { amount: 0, rarity: 0.2, mindepth: 1, maxdepth: 4, color: '#36454F' },
    iron: { amount: 0, rarity: 0.15, mindepth: 1, maxdepth: 4, color: '#A19D94' },
    copper: { amount: 0, rarity: 0.12, mindepth: 1, maxdepth: 3, color: '#B87333' },
    gold: { amount: 0, rarity: 0.08, mindepth: 2, maxdepth: 4, color: '#FFD700' },
    diamond: { amount: 0, rarity: 0.05, mindepth: 3, maxdepth: 4, color: '#B9F2FF' },
    emerald: { amount: 0, rarity: 0.05, mindepth: 2, maxdepth: 4, color: '#50C878' },
    ruby: { amount: 0, rarity: 0.05, mindepth: 2, maxdepth: 4, color: '#E0115F' },
    uranium: { amount: 0, rarity: 0.03, mindepth: 3, maxdepth: 4, color: '#1A5F7A' },
    mythril: { amount: 0, rarity: 0.02, mindepth: 3, maxdepth: 4, color: '#8FE2FF' }
}

function seededRandom(seed) {
    return function(x, y) {
        let value = seed + x * 374761393 + y * 668265263;
        value = (value ^ (value >> 13)) * 1274126177;
        return (value ^ (value >> 16)) / 4294967296;
    };
} 

function findneighbors(index, row, rowindex, worldarr) { //only useful for air layer
    //neighbors indexes = -1 to x and +1 to x
    console.log(worldarr[rowindex - (layers.air - 1)][index]);
    return {
        right: index + 1 < row.length ? row[index + 1]: null, 
        left: index > 0 ? row[index - 1] : null,
        isbottom: rowindex >= layers.air - 1 && worldarr[rowindex - (layers.air - 1)][index].type === 'air'
    };
}

function updcellclass(x, y, newclass, worldarr) { //newclass has to be string
    if(worldarr[y] && worldarr[y][x]) {
        worldarr[y][x].content = newclass;
    }

    let row = world.children[y];
    if(row) {
        let cell = row.children[x];
        if(cell) {
            cell.className = 'cell';
            cell.classList.add(newclass);
        }
    }
}

function genworld(seed, world, worldarr) {
    let randomseed = seededRandom(seed);

    let totalRows = 0;
    for (let i in layers) {
        totalRows += layers[i];
    }

    for (let y = 0; y < totalRows; y++) {
        let row = [];
        let docrow = document.createElement('div');
        docrow.classList.add('row');
        let house = false;
        let housex = Math.floor(Math.random() * columns);
        if(housex < 2) {
            housex += 2;
        }
        for (let x = 0; x < columns; x++) {
            const neighbors = findneighbors(x, row, y, worldarr);
            const rand = randomseed(x, y);
            let doc = document.createElement('div');
            let classstring = '';
            let content = '';

            // sets the current layer
            let currentLayer = '';
            let accumulatedRows = 0;
            for (let layer in layers) {
                accumulatedRows += layers[layer];
                if (y < accumulatedRows) {
                    currentLayer = layer;
                    break;
                }
            }

            switch (currentLayer) {
                case 'sky': 
                    classstring = 'opensky';
                    if (rand < 0.2) {
                        classstring = 'cloud';
                    }
                    break;
                case 'air': 
                /* house design
                
                O 
            O O O O O
              O O O
              X X O
              */
                classstring = 'openair';
                    if(!house && x === housex && neighbors.isbottom) {
                        classstring = 'house-wall';
                        console.log(x, y);
                        console.log(worldarr);
                        // Roof
                        updcellclass(x + 1, y - 2, 'house-roof', worldarr);
                        updcellclass(x - 3, y - 2, 'house-roof', worldarr);
                        updcellclass(x - 1, y - 2, 'house-roof', worldarr);
                        updcellclass(x, y - 2, 'house-roof', worldarr);
                        updcellclass(x - 1, y - 3, 'house-roof', worldarr);
                        updcellclass(x - 2, y - 2, 'house-roof', worldarr);
                        // Walls
                        updcellclass(x, y - 1, 'house-wall', worldarr);
                        updcellclass(x - 2, y - 1, 'house-wall', worldarr);
                        updcellclass(x - 2, y, 'house-wall', worldarr);
                        // Door
                        updcellclass(x - 1, y - 1, 'house-door', worldarr);
                        updcellclass(x - 1, y, 'house-door', worldarr);
                        house = true;
                        throw 'bad';
                    }

                    if((neighbors.left === null || neighbors.left.content === 'openair') && (neighbors.right === null || neighbors.right.content === 'openair') && (neighbors.isbottom) && classstring !== 'house-wall'){
                        if(rand < 0.1) {
                            //creates tree
                            classstring = 'treetrunk';
                            updcellclass(x, y - 1, 'treetrunk', worldarr);
                            updcellclass(x, y - 2, 'treeleaves', worldarr);
                            updcellclass(x, y - 3, 'treeleaves', worldarr);
                            updcellclass(x - 1, y - 2, 'treeleaves', worldarr);
                            updcellclass(x + 1, y - 2, 'treeleaves', worldarr);
                        }
                    }
                    break;
                case 'dirt':
                    classstring = 'dirt';
                    let ore = genore(rand, y);
                    if(ore !== 'no_ore') {
                        classstring = ore;
                    }
                    break;
                default: 
                    classstring = 'default';
                    break;
            }
            doc.classList.add(classstring, 'cell');
            content = classstring;
            docrow.appendChild(doc);
            row.push(new cellcons(x, y, currentLayer, content));
        }
        world.appendChild(docrow);
        worldarr.push(row);            
    }
    objpop(worldarr);
}

function genore(rand, y) {
    let depth;
    let total = 0;
    for(let i in layers) { //calculate the layer in the dirt were in
        if(i === 'dirt') break;
        total += layers[i];
    }
    depth = y - total; //depth 1-4
    let back;
    for(let i in ores) {
        let o = ores[i];
        if(rand < o.rarity && depth >= o.mindepth && depth <= o.maxdepth) {
            back = i;
            continue;
        }
        break;
    }
    back = back || 'no_ore';
    if(back !== 'no_ore'){ores[back].amount++};
    return back;
}

function objpop(worldarr) {
    for(let y in worldarr) {
        for(let x in worldarr[y]) {
            if(worldarr[y][x].type !== 'dirt') continue;
            for(let ore in ores) {
                if(worldarr[y][x].content === ore) {
                    worldarr[y][x]['ore_obj'] = ores[ore];
                }
            }
        }
    }
}

class cellcons {
    constructor(x, y, type, content) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.content = content;
    }
}

genworld(8923, world, worldarr);