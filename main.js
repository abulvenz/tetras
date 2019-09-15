import fn from './fn';

import m from 'mithril';
import tagl from 'tagl-mithril';
import templates from './template';

// prettier-ignore
const { address, aside, footer, header, h1, h2, h3, h4, h5, h6, hgroup, main, nav, section, article, blockquote, dd, dir, div, dl, dt, figcaption, figure, hr, li, ol, p, pre, ul, a, abbr, b, bdi, bdo, br, cite, code, data, dfn, em, i, kdm, mark, q, rb, rp, rt, rtc, ruby, s, samp, small, span, strong, sub, sup, time, tt, u, wbr, area, audio, img, map, track, video, embed, iframe, noembed, object, param, picture, source, canvas, noscript, script, del, ins, caption, col, colgroup, table, tbody, td, tfoot, th, thead, tr, button, datalist, fieldset, form, formfield, input, label, legend, meter, optgroup, option, output, progress, select, textarea, details, dialog, menu, menuitem, summary, content, element, slot, template } = tagl(m);

let heartBeatInterval = 700;

const nCols = 10;
const nRows = 20;

let score = 0;
let level = 0;

const type = Object.freeze({
    EMPTY: 'empty',
    PART: 'part',
    BLOCKED: 'blocked'
});

const clone = obj => JSON.parse(JSON.stringify(obj));

let createPart = () => {
    let cells = clone(templates[Math.trunc(Math.random() * templates.length)]);
    return {
        row: 0,
        col: nCols / 2,
        rotateRight: () => {
            cells = cells.map(cell => { return { row: cell.col, col: -cell.row } });
        },
        rotateLeft: () => {
            cells = cells.map(cell => { return { row: -cell.col, col: cell.row } });
        },
        cells: () => cells
    }
};

let currentPart = createPart();

const emptyRow = row => fn.range(0, nCols).map(col => {
    return {
        type: type.EMPTY
    };
});

const field = fn.range(0, nRows)
    .map(row => emptyRow(row));

const traverseCells = fn => field.map(row => row.map(cell => fn(cell)));

const deletePart = cell => cell.type = (cell.type === type.PART ? type.EMPTY : cell.type);

const partCells = part => part.cells()
    .map(cell => field[cell.row + part.row][cell.col + part.col]);

const drawPart = part =>
    partCells(part).forEach(cell => cell.type = type.PART);

const fixPart = part =>
    partCells(part).forEach(cell => cell.type = type.BLOCKED);

const getBounds = part => {
    const bound = (prop, red) => part.cells()
        .map(cell => cell[prop] + part[prop])
        .reduce((acc, val) => red(acc, val));
    return {
        minCol: bound('col', Math.min),
        minRow: bound('row', Math.min),
        maxCol: bound('col', Math.max),
        maxRow: bound('row', Math.max)
    };
}

const use = (obj, fn) => fn(obj);

const outOfBounds = part => use(getBounds(part), bounds =>
    [bounds.minCol < 0, bounds.maxCol >= nCols, bounds.maxRow >= nRows].some(e => e));

const moveHorizontally = (part, inc) => {
    part.col += inc;
    if (outOfBounds(part)) {
        part.col -= inc;
    }
};

const rotate = (part, direction) => {
    const rotations = direction > 0 ? ['rotateLeft', 'rotateRight'] : ['rotateRight', 'rotateLeft'];
    part[rotations[0]]();
    if (outOfBounds(part)) {
        part[rotations[1]]();
    }
}

const hit = part => outOfBounds(part) || partCells(part).some(cell => cell.type !== type.EMPTY);

const evaluate = () => {
    const completeLines = field.map((row, idx) => row.every(cell => cell.type === type.BLOCKED) ? idx : undefined).filter(e => !!e);
    completeLines.forEach(idx => field.splice(idx, 1));
    completeLines.forEach(row => field.unshift(emptyRow(0)))

    score += completeLines.length;

    while (level < score / 10) {
        level ++;
        heartBeatInterval /= 2;
    }
};

const moveDown = part => {
    part.row += 1;
    if (hit(part)) {
        part.row -= 1;
        fixPart(part);

        evaluate();

        return createPart();
    }
    return part;
};

const heartbeat = () => {
    traverseCells(deletePart);
    currentPart = moveDown(currentPart);
    drawPart(currentPart); window
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
            break;
        case 65: // a
            rotate(currentPart, 1);
            break;
        case 68: // d            
            rotate(currentPart, -1);
            break;
        default:
            break;
    }

    drawPart(currentPart);
    m.redraw();
});

const flatMap = (arr, fn) => arr.reduce((acc, x) => acc.concat(fn(x)), []);

m.mount(document.body, {
    view(vnode) {
        return [
            div.gamefield({ border: '0' },
                flatMap(field, row => row.map(cell => div.box[cell.type](' ')))
            ),
            label.score('Level',level), label.score('Score',score)
        ];
    }
}
);