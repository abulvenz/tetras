import F from './fn';
import m from 'mithril';
import tagl from 'tagl-mithril';
import templates from './template';
import images from "images/*.png";

// prettier-ignore
const { address, aside, footer, header, h1, h2, h3, h4, h5, h6, hgroup, main, nav, section, article, blockquote, dd, dir, div, dl, dt, figcaption, figure, hr, li, ol, p, pre, ul, a, abbr, b, bdi, bdo, br, cite, code, data, dfn, em, i, kdm, mark, q, rb, rp, rt, rtc, ruby, s, samp, small, span, strong, sub, sup, time, tt, u, wbr, area, audio, img, map, track, video, embed, iframe, noembed, object, param, picture, source, canvas, noscript, script, del, ins, caption, col, colgroup, table, tbody, td, tfoot, th, thead, tr, button, datalist, fieldset, form, formfield, input, label, legend, meter, optgroup, option, output, progress, select, textarea, details, dialog, menu, menuitem, summary, content, element, slot, template } = tagl(m);

const config = {
    initialHeartbeat: 1000,
    nCols: 10,
    nRows: 20,
};

let exid = n => `$ex${"00".substring(0, 2 - String(n).length) + String(n)}`;

let heartBeatInterval = config.initialHeartbeat;

let gameOverMessage = 'press a,d to rotate, arrow keys to navigate, b boss mode';

let bossmode = false;

let score = 0;
let removedLines = 0;
let level = 0;

const type = Object.freeze({
    EMPTY: 'empty',
    PART: 'part',
    BLOCKED: 'blocked',
    BURST: 'burst',
});

const colorStyle = ({ r, g, b, a }) => `background-color:rgba(${r * 255},${g * 255},${b * 255},${a});`;

const clone = obj => JSON.parse(JSON.stringify(obj));

let createPart = () => {
    let part = clone(templates[Math.trunc(Math.random() * templates.length)]);
    let cells = part.parts;
    return {
        row: 0,
        col: config.nCols / 2,
        rotateRight: () => {
            cells = cells.map(cell => {
                return { row: cell.col, col: -cell.row };
            });
        },
        rotateLeft: () => {
            cells = cells.map(cell => {
                return { row: -cell.col, col: cell.row };
            });
        },
        cells: () => cells,
        color: part.color,
        form: part.form
    };
};

let currentPart = createPart();

const emptyField = () => {
    return {
        type: type.EMPTY,
        color: null
    };
};

const emptyRow = row =>
    F.range(0, config.nCols).map(emptyField);

const field = F.range(0, config.nRows).map(row => emptyRow(row));

const traverseCells = fn => field.map((row, ridx) => row.map((cell, cidx) => fn(cell, ridx, cidx)));

const deletePart = cell => (cell.type = cell.type === type.PART ? type.EMPTY : cell.type);

const partCells = part => part.cells().map(cell => field[cell.row + part.row][cell.col + part.col]);

const drawPart = part => partCells(part).forEach(cell => {
    cell.type = type.PART;
    cell.color = part.color;
});

const fixPart = part => partCells(part).forEach(cell => {
    cell.type = type.BLOCKED;
    cell.form = part.form;
    return cell;
});

const getBounds = part => {
    const bound = (prop, red) =>
        part
            .cells()
            .map(cell => cell[prop] + part[prop])
            .reduce((acc, val) => red(acc, val));
    return {
        minCol: bound('col', Math.min),
        minRow: bound('row', Math.min),
        maxCol: bound('col', Math.max),
        maxRow: bound('row', Math.max),
    };
};

const use = (obj, fn) => fn(obj);

const outOfBounds = part =>
    use(getBounds(part), bounds =>
        [bounds.minCol < 0, bounds.maxCol >= config.nCols, bounds.maxRow >= config.nRows, bounds.minRow < 0].some(
            e => e
        )
    );

const hit = part => outOfBounds(part) || partCells(part).some(cell => cell.type !== type.EMPTY);

const moveHorizontally = (part, inc) => {
    part.col += inc;
    if (hit(part)) {
        part.col -= inc;
    }
};

const rotate = (part, direction) => {
    const rotations = direction > 0 ? ['rotateLeft', 'rotateRight'] : ['rotateRight', 'rotateLeft'];
    part[rotations[0]]();
    if (hit(part)) {
        part[rotations[1]]();
    }
};

const evaluate = () => {
    const completeLines = field
        .map((row, idx) => (row.every(cell => cell.type === type.BLOCKED) ? idx : undefined))
        .filter(e => !!e);
    completeLines.reverse().forEach(idx => field.splice(idx, 1));
    completeLines.forEach(row => (field.length <= config.nRows ? field.unshift(emptyRow(0)) : 0));

    removedLines += completeLines.length;

    score += completeLines.length * completeLines.length;

    while (level < removedLines / 10) {
        level++;
        heartBeatInterval *= 0.66;
    }
};

const coordList = () => {
    let coords = [];
    const contains = (row, col) => coords.some(e => e.row === row && e.col === col);
    return {
        add: (row, col) => {
            if (contains(row, col))
                return false;
            else {
                coords.push({ row, col });
                return true;
            }
        },
        coords
    };
};


let t = coordList();
t.add(1, 1);
t.add(1, 1);
console.log(t.coords)


const burstBeat = () => {
    traverseCells((cell, row, col) => {
        if (cell.type === type.BURST) {
            cell.form++;
            score++;
            if (cell.form >= 25) {
                cell.type = type.EMPTY;
                for (let r = row; r > 0; r--) {
                    field[r][col] = field[r - 1][col];
                }
                field[0][col] = emptyField();
            }
            return true;
        }
        return false;
    });
    m.redraw();
};

setInterval(burstBeat, 100);


const evaluateFancy = () => {

    const inField = ({ row, col }) => {
        return row >= 0 && row < config.nRows && col >= 0 && col < config.nCols;
    };

    const neighbors = (row, col) => {
        return [
            { row: row - 1, col },
            { row: row + 1, col },
            { row, col: col - 1 },
            { row, col: col + 1 },
        ].filter(inField);
    };

    const evaluateField = form => ({ row, col }) => field[row][col].form === form;

    const terminal = ({ row, col }) => col === config.nCols - 1;

    const evaluateRow = idx => {
        if (field[idx][0].type === type.BLOCKED) {

            const addRec = (coords, row, col, form) => {
                if (coords.add(row, col))
                    neighbors(row, col)
                        .filter(evaluateField(form))
                        .forEach(neighbor => addRec(coords, neighbor.row, neighbor.col, form));
            };

            const visitedCoords = coordList();
            addRec(visitedCoords, idx, 0, field[idx][0].form);

            if (visitedCoords.coords.some(terminal)) {
                visitedCoords.coords.forEach((cell, idx) => {
                    field[cell.row][cell.col].type = type.BURST;
                    field[cell.row][cell.col].form = idx % 25;
                });
            }
        }
    };

    for (let idx = config.nRows - 1; idx > 0; idx--) {
        evaluateRow(idx);
    }
};

const moveDown = part => {
    part.row += 1;
    if (hit(part)) {
        part.row -= 1;
        fixPart(part);
        evaluate();
        evaluateFancy();
        return createPart();
    }
    return part;
};

const drawGameOver = () => {
    gameOverMessage = 'Game Over';
};

const newGame = () => {
    removedLines = 0;
    level = 0;
    gameOverMessage = '';
    heartBeatInterval = config.initialHeartbeat;
    traverseCells(cell => (cell.type = type.EMPTY));
    currentPart = createPart();
    heartbeat();
};

const heartbeat = () => {
    if (bossmode) return;
    traverseCells(deletePart);
    currentPart = moveDown(currentPart);

    if (hit(currentPart)) {
        drawGameOver();
        return;
    }

    drawPart(currentPart);

    m.redraw();
    setTimeout(heartbeat, heartBeatInterval);
};

setTimeout(heartbeat, heartBeatInterval);

document.addEventListener('keydown', e => {
    traverseCells(deletePart);
    switch (e.keyCode) {
        case 37: // left
            moveHorizontally(currentPart, -1);
            break;
        case 39: // right
            moveHorizontally(currentPart, 1);
            break;
        case 38: // up
            break;
        case 40: // down
            currentPart = moveDown(currentPart);
            e.preventDefault();
            e.stopPropagation();
            break;
        case 65: // a
            rotate(currentPart, 1);
            break;
        case 66: // b
            bossmode = !bossmode;
            if (!bossmode) heartbeat();
            break;
        case 68: // d
            rotate(currentPart, -1);
            break;
        case 78: // n
            newGame();
            break;
        case 83:
            evaluateFancy();
            break;
        default:
            console.log(e.keyCode)
            break;
    }

    drawPart(currentPart);
    m.redraw();
});

const flatMap = (arr, fn) => arr.reduce((acc, x) => acc.concat(fn(x)), []);

let supportsTouch = ("ontouchstart" in window) || window.navigator.msMaxTouchPoints > 0;
let showControls = supportsTouch;


const wrapCommand = cmd => e => {
    traverseCells(deletePart);
    cmd(e);
    drawPart(currentPart);
};

m.mount(document.body, {
    view(vnode) {
        return !bossmode
            ? div(/*{ style: colorStyle({ r: (1000 - heartBeatInterval) / 1000, g: 0, b: 0, a: .25 }) },*/
                div.wrapper([
                    div.gamefield({ border: '0' }, flatMap(field, row => row.map(cell => div.box[cell.type][cell.type === type.BURST ? exid(cell.form) : ''](cell.type === type.PART || cell.type === type.BLOCKED ? { style: colorStyle(cell.color) } : {}, ' ')))),
                    div.score.empty(gameOverMessage, button({ onclick: e => showControls = !showControls }, 'mobile controls')),
                    showControls ? [
                        div.floater(
                            div.left(
                                button.control({ onclick: wrapCommand(e => rotate(currentPart, 1)) }, h2(m.trust('&cularr;'))),
                                span.hspace(' '),
                                button.control({ onclick: wrapCommand(e => rotate(currentPart, -1)) }, h2(m.trust('&curarr;')))
                            ),
                            div.right(
                                button.control({ onclick: wrapCommand(e => moveHorizontally(currentPart, -1)) }, h2(m.trust('&larr;'))),
                                span.hspace(' '),
                                button.control({ onclick: wrapCommand(e => currentPart = moveDown(currentPart)) }, h2(m.trust('&darr;'))),
                                span.hspace(' '),
                                button.control({ onclick: wrapCommand(e => moveHorizontally(currentPart, 1)) }, h2(m.trust('&rarr;'))))
                        )
                    ] : null,
                    div.score.empty(span.score('Level ', level), span.score(' Score ', score)),
                ]))
            : div.bosscreen(div.wrapper('/home $ ', span.blink('_')));
    },
});
