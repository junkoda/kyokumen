/**
 * kyokumen.js: A library for shogi documents on the web
 * Author:      Jun Koda (2016)
 * Website:     https://github.com/junkoda/kyokumen
 */

window.addEventListener('load', eventWindowLoaded, false);

const axisLine = 0.2;

const nrow = 9;
const Piece = { l:'香', n:'桂', s:'銀', g:'金', k:'玉', r:'飛', b:'角', p:'歩', '+l':'成香', '+n':'成桂', '+s':'成銀', '+r':'龍', '+b':'馬', '+p':'と'};
const numKanji = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八'];
const SENTE = '☗';
const GOTE = '☖';
const pieceAscii = { 108:'l', 110:'n', 115:'s', 103:'g', 107:'k', 114:'r', 98:'b', 112:'p', 76:'L', 78:'N', 83:'S', 71:'G', 75:'K', 82:'R', 66:'B', 80:'P', 43:'+', 32:''};

var editor = {ix:0, iy:0}

function eventWindowLoaded() {
  drawKyokumens();
  setupMoves();

  initEditor();
  //document.addEventListener('keypress', eventKeyPress);
  //document.addEventListener('keydown',  eventKeyDown);
  //window.addEventListener('keydown', onKeyDown);

  var kyokumen = document.getElementById("board");
  kyokumen.addEventListener('keydown',  eventKeyDown);
  kyokumen.addEventListener('keypress', eventKeyPress);
}

function printMousePos(event) {
  var kyokumen = this;
  var rect = kyokumen.getBoundingClientRect();
  var width = getWidth(kyokumen);
  var w = width/nrow;
  var margin = getMargin(kyokumen);
  //console.log('x ' + (event.clientX - rect.left - margin[3]));
  //console.log('y ' + (event.clientY - rect.top));



  //console.log(this)
  //var kyokumen = getBoard(this);
  //var width = getWidth(kyokumen);
  //var margin = getMargin(kyokumen);
  //console.log(margin);
  var ix = Math.floor((event.clientX - rect.left - margin[3])/w);
  var iy = Math.floor((event.clientY - rect.top  - margin[0])/w);
  //console.log(ix + ' ' + iy)
  moveCursor(ix, iy);
}

function eventKeyPress(event) {
  console.log('key press ' + event.which);
  //console.log(event.ctrlKey);
  /**
   * Keyboard short cut with ctrl
   */
  if(event.ctrlKey) {
    console.log('ctrl + ' + event.which);
    // Keyboard shortcut with ctrl
    switch(event.which) {
      case 1: // 'ctrl + a' begining of line
        moveCursor(0, editor.iy);
        break;
      case 2: // 'ctrl + b' back
        moveCursor(editor.ix - 1, editor.iy);
        break;
      case 4: // 'ctrl + d' delete
        editor.ban[nrow*editor.iy + editor.ix] = '';
        refreshKyokumen();
        break;
      case 5: // 'ctrl + e' end of line
        moveCursor(nrow - 1, editor.iy);
        break;
      case 6: // 'ctrl + f' forward
        moveCursor(editor.ix + 1, editor.iy);
        break;
      case 14: // 'ctrl + n' down
        moveCursor(editor.ix, editor.iy + 1);
        break;
      case 16: // 'ctrl + p' up
        moveCursor(editor.ix, editor.iy - 1);
        break;
    }
  }
  else if (event.shiftKey && event.which == 13) {
    // shift + return
    // create a figure (ToDO!!!)
    alert('shift + return')
  }
  else {
    key = pieceAscii[event.which];
    if(key === undefined) return;

    //console.log(key);

    index = nrow*editor.iy + editor.ix;
    if(editor.ban[index] === '+' && key != '+' && key !== '') {
      // Add piece alphabet after +
      editor.ban[index] += key;
    } 
    else {
      editor.ban[index] = key;
    }


    console.log(editor.ban[index]);
    refreshKyokumen();
    moveCursor(editor.ix + 1, editor.iy);
 
  }

}

function refreshKyokumen() {
  sfen = setSfenText(editor.ban);

  clearKyokumen(editor.kyokumen, 'koma');
  clearKyokumen(editor.kyokumen, 'nari-goma');
  drawPieces(editor.kyokumen, editor.width, editor.margin, sfen);
}

function setSfenText(ban) {
  var num = 0;
  var text = '';
  for(var iy=0; iy<nrow; iy++) {
    for(var ix=0; ix<nrow; ix++) {
      var index = nrow*iy + ix;
      if(ban[index]) {
        if(num > 0) {
          text += num;
          num = 0;
        }
        text += ban[index];
      }
      else {
        num++;
      }

    }
    if(num > 0) {
      text += num;
      num = 0;
    }
    if(iy < nrow - 1)
      text += '/'
  }

  text += ' b - 1'

  var sfenText = document.getElementById("sfen");
  //sfenText.setAttribute('value', text);
  sfenText.innerHTML = text;

  return text;
}

/*
 * Move Cursor when an arrow key pressed
 */
function eventKeyDown(event) {
  switch(event.which) {
    case 37:
      // left arrow
      moveCursor(editor.ix - 1, editor.iy);
      break;
    case 38:
      // up arrow
      moveCursor(editor.ix, editor.iy - 1);
      break;
    case 39:
      // right arrow
      moveCursor(editor.ix + 1, editor.iy);
      break;
    case 40:
      // down arrow
      moveCursor(editor.ix, editor.iy + 1);
      break;
    case 8:
      // backspace
      editor.ban[nrow*editor.iy + editor.ix] = '';
      refreshKyokumen();
      moveCursor(editor.ix - 1, editor.iy);
      event.preventDefault();
      break;
    case 46:
      // delete
      editor.ban[nrow*editor.iy + editor.ix] = '';
      refreshKyokumen();
      break;
  }

  //console.log('key down ' + event.which);
}

/**
 *   Editor
 */

function initEditor() {
  editor.ban = new Array(nrow*nrow);

  var kyokumen = document.getElementById("board");
  editor.kyokumen = kyokumen;
  editor.width = getWidth(kyokumen);
  editor.margin = getMargin(kyokumen);
  editor.w = editor.width / nrow;

  createCursor()
}

function createCursor() {
  var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('id', 'cursor');
  //rect.setAttribute('x', editor.margin[1] + editor.ix*editor.w + 2);
  //rect.setAttribute('y', editor.margin[0] + editor.iy*editor.w + 2);
  rect.setAttribute('width', editor.w / 4);
  rect.setAttribute('height', editor.w - 4);

  editor.kyokumen.appendChild(rect); 
  editor.cursor = rect;
  moveCursor(0, 0);
}

/*
 * Move cursor to a new position ix, iy
 */
function moveCursor(ix, iy) {
  if(ix < 0) {
    ix = nrow - 1;
    iy--;
  }
  else if(ix >= nrow) {
    ix = 0;
    iy++;
  }

  if(iy < 0 || iy >= nrow)
    return;
   
  cursor = editor.cursor;
  cursor.setAttribute('x', editor.margin[1] + ix*editor.w + 2);
  cursor.setAttribute('y', editor.margin[0] + iy*editor.w + 2);

  editor.ix = ix;
  editor.iy = iy;
}

/**
 * Find all tags with class='kyokumen' and draw the kyokumens
 */
function drawKyokumens() {
  var kyokumens = document.getElementsByClassName('kyokumen');

  var n = kyokumens.length;
  for (var i = 0; i < n; i++) {
    kyokumens[i].addEventListener('click', printMousePos);
    drawKyokumen(kyokumens[i]);
  }
}

/**
 * Find all tags with class='mv' and attach event listener drawMove
 */
function setupMoves() {
  var moves = document.getElementsByClassName('mv');
  var n = moves.length;
  for (var i = 0; i < moves.length; i++) {
    moves[i].addEventListener('mouseover', drawMove, false);
  }
}

/**
 *Variables:
 * *kyokumen* is an <svg> tag with class='kyokumen' and an sfen attribute
 * e.g.: <svg id='zu1' class='kyokumen'
 *         sfen='lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b'>
 *        </svg>
 * *width*is the width of the svg element, which is the length of the board in pixcels
 */

function drawKyokumen(kyokumen) {
  var width = getWidth(kyokumen);
  var margin = getMargin(kyokumen);
  kyokumen.style.width = String(width + margin[1] + margin[3]) + 'px';
  kyokumen.style.height = String(width + margin[0] + margin[2]) + 'px';
  kyokumen.style.padding = '0'

  // Save original value of width and margin as w and mar respectively
  kyokumen.setAttribute("data-width",  width);
  kyokumen.setAttribute("data-margin",  margin);

  drawBan(kyokumen, width, margin);        // Box and lines
  drawNumbersCol(kyokumen, width, margin); // Axis label ９、８、･･･、１
  drawNumbersRow(kyokumen, width, margin); // Axis label 一、二、･･･、九
  drawPieces(kyokumen, width, margin, null);
}

/**
 * Draw move
 */
function drawMove() {
  /**
   * 'this' is a class='mv' tag width board='board id' and sfen
   */

  var kyokumen = getBoard(this);
  if (!kyokumen) return;
  var sfen = this.getAttribute('data-sfen');
  if (!sfen) {
    console.log('Error: unable to get sfen in move:');
    console.log(this);
  }



  // Remove existing pieces
  clearKyokumen(kyokumen, 'koma');
  clearKyokumen(kyokumen, 'nari-goma');
  clearKyokumen(kyokumen, 'sente');
  clearKyokumen(kyokumen, 'gote');

  var width = getWidth(kyokumen);
  var margin = getMargin(kyokumen);
    kyokumen.style.width = width + margin[1] + margin[3];
  kyokumen.style.height = width + margin[0] + margin[2];

  drawPieces(kyokumen, width, margin, sfen);
}

/**
 * Remove class=koda child elements from kyokumen
 * Args:
 *     kyokumen: a DOM element
 *     cls (string): class name 'koma', 'nari-goma', ...
 */
function clearKyokumen(kyokumen, cls) {
  var komas = kyokumen.getElementsByClassName(cls);
  while (komas.length > 0) {
    kyokumen.removeChild(komas[0]);
    komas = kyokumen.getElementsByClassName(cls);
  }
}



/**
 * Draw a square and lines for shogi-ban
 */
function drawBan(kyokumen, width, margin) {
  //kyokumen.setAttribute('height', width);

  var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('class', 'ban');
  rect.setAttribute('x', margin[1]);
  rect.setAttribute('y', margin[0]);
  rect.setAttribute('width', width);
  rect.setAttribute('height', width);
  kyokumen.appendChild(rect);

  var w = width / nrow;

  // 横線
  for (var i = 1; i < nrow; i++) {
    var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('class', 'sen');
    line.setAttribute('x1', margin[1]);
    line.setAttribute('x2', margin[1] + width);
    line.setAttribute('y1', margin[0] + w * i);
    line.setAttribute('y2', margin[0] + w * i);
    kyokumen.appendChild(line);
  }

  // 縦線
  for(var i=1; i<nrow; i++) {
    var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', margin[1] + w * i);
    line.setAttribute('x2', margin[1] + w * i);
    line.setAttribute('class', 'sen');
    line.setAttribute('y1', margin[0]);
    line.setAttribute('y2', margin[0] + width);
    kyokumen.appendChild(line);
  }
}

/**
 *  Draw 9 ... 1 on top magin
 */
function drawNumbersCol(kyokumen, width, margin) {
  var w = width / nrow;
  label = ['９', '８', '７', '６', '５', '４', '３', '２', '１'];

  for(var i=0; i<nrow; i++) {
    var num = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    num.setAttribute('class', 'num');
    num.setAttribute('x', margin[1] + w * (i + 0.5));
    num.setAttribute('y', margin[0] + -w * axisLine - 2);

    num.setAttribute('text-anchor', 'middle');
    num.setAttribute('dominant-baseline', 'bottom');
    var text = document.createTextNode(label[i]);
    num.appendChild(text);
    kyokumen.appendChild(num);
  }
}

/**
 *  Draw 一、二、･･･、九 on left margin
 */
function drawNumbersRow(kyokumen, width, margin) {
  var w = width / nrow;

  for(var i = 0; i < nrow; i++) {
    var num = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    num.setAttribute('class', 'num');
    num.setAttribute('x', margin[1] + width + w * axisLine + 2);
    num.setAttribute('y', margin[0] + w * (i + 0.5));

    num.setAttribute('text-anchor', 'left');
    num.setAttribute('dominant-baseline', 'middle') ;
    var text = document.createTextNode(numKanji[i]);
    num.appendChild(text);
    kyokumen.appendChild(num);
  }
}

/**
 * Parse sfen string and draw pieces
 */
function drawPieces(kyokumen, width, margin, sfen) {
  // e.g. sfen='lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b'>
  // for example for initial
  if (!sfen)
    sfen = kyokumen.getAttribute('data-sfen'); // kyokumen.dataset.sfen not working in firefox

  var w = width / nrow;
  var n = sfen.length;
  var ix = 0;
  var iy = 0;

  // Pices on board
  var i;
  for (i = 0; i < n; i++) {
    p = sfen.charAt(i);
    if (p == '+') {
      p = sfen.substring(i, i + 2);
      i++;
    }

    var number = Number(p);
    if (p == '/') { // Next row
      ix = 0;
      iy++;
    }
    else if (number) { // n black squares
      ix += number;
    }
    else if (p == ' ') { // End of board discription
      break;
    }
    else {
      drawPiece(kyokumen, margin, w, ix, iy, p);
      ix++;
    }
  }

  i = skipTeban(sfen, i);

  i = DrawSente(kyokumen, width, margin, sfen, i);
  i = DrawGote(kyokumen, width, margin, sfen, i);
}

/**
 * Draw one piece
 * Args:
 *       w:  width / nrow
 *       ix: 0...9, column index
 *       iy: 0...9, row index
 *       p:  sfen character 'p', 'P', ..., or promoted '+p', '+P', .. 
 */
function drawPiece(kyokumen, margin, w, ix, iy, p) {
  var pieceText = Piece[p.toLowerCase()];

  if (pieceText) {
    var x = margin[1] + w * (ix + 0.5);
    var y = margin[0] + w * (iy + 0.5);
    var piece = document.createElementNS('http://www.w3.org/2000/svg', 'text');

    if (p.charAt(0) == '+') {
      piece.setAttribute('class', 'nari-goma');
    }
    else {
      piece.setAttribute('class', 'koma');
    }

    //piece.setAttribute('x', x - 2);
    piece.setAttribute('x', x);
    piece.setAttribute('y', y);

    if (isGote(p)) {
      // Rotate Gote's piece
      var transformation = 'translate(' + String(x) + ' ' + String(y) + ') ';
      if(pieceText.length == 2) {
        // Shrink the height of 成香、成桂、成銀
        transformation += ' scale(1.0 0.5)';
      }
      transformation += 'rotate(180)';
      transformation += 'translate(' + String(-x) + ' ' + String(-y) + ') ';

      piece.setAttribute('transform', transformation);
    }
    else if (pieceText.length == 2) {
      // Shrink the height of Sente's 成香、成桂、成銀
      var transformation = 'translate(' + String(x) + ' ' + String(y) + ') ';
      transformation += ' scale(1.0 0.5)';
      transformation += 'translate(' + String(-x) + ' ' + String(-y) + ') ';
      piece.setAttribute('transform', transformation);
    }

    piece.setAttribute('text-anchor', 'middle');
    piece.setAttribute('dominant-baseline', 'central');
    var text = document.createTextNode(pieceText);

    piece.appendChild(text);
    kyokumen.appendChild(piece);
  }
  else {
    console.log('Error: unknown piece, ' + p);
  }
}

/**
 * Returns true if the character is lower case.
 * True for 'p', '+p', 'l', ...
 * False for 'P', '+P', 'L', ...
 */
function isGote(character) {
  return (character == character.toLowerCase());
}

/**
 * Skip [space]b or w[space] in sfen string sfen[i] and later
 * Args:
 *     sfen (str): sfen string
 *     i (int): position of character to analysis
 * Returns:
 *     index i after [space]b/w[space]
 */
function skipTeban(sfen, i) {
  var n = sfen.length;
  while (i < n) {
    p = sfen.charAt(i);
    if (p == ' ')
      i++;
    else if (p == 'b' || p == 'w') {
      i++;
    }
    else
      break;
  }
  return i;
}

/**
 * Draw <svg sente='☗先手'> atrribute with Sente's pieces in hand.
 */
function DrawSente(kyokumen, width, margin, sfen, i) {
  var n = sfen.length;
  var sente = kyokumen.getAttribute('data-sente');
  if (!sente)
    sente = SENTE;
  sente += ' ';

  while (i < n) {
    var p = sfen.charAt(i);
    number = parseInt(sfen.substring(i, n));
    if (number) {
      sente += numKanji[number - 1];
      i += String(number).length;
    }
    else if (p === '-' || isGote(p)) {
      break;
    }
    else {
      sente += Piece[p.toLowerCase()];
      i++;
    }
  }
  
  var label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  label.setAttribute('class', 'sente');
  label.setAttribute('x', margin[1] + (1 + 1.5 / nrow) * width + 4);
  label.setAttribute('y', margin[0]);
  label.setAttribute('dominant-baseline', 'central');
  var text = document.createTextNode(sente);
  label.appendChild(text);
  kyokumen.appendChild(label);

  return i;
}

/**
 * Draw <svg gote='☖後手'> attribute with Gote's pieces in hand.
 */
function DrawGote(kyokumen, width, margin, sfen, i) {
  var n = sfen.length;
  var gote = kyokumen.getAttribute('data-gote');
  if (!gote)
    gote = GOTE;
  gote += ' ';

  while (i < n) {
    var p = sfen.charAt(i);
    if(p === '-' || p === ' ') break;

    number = parseInt(sfen.substring(i, n));
    if(number) {
      gote += numKanji[number - 1];
      i += String(number).length;
    }
    else {
      gote += Piece[p.toLowerCase()];
      i++;
    }
  }
  
  var label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  label.setAttribute('class', 'gote');
  label.setAttribute('x', margin[1] - 0.4 * width / nrow);
  label.setAttribute('y', margin[0]);
  label.setAttribute('dominant-baseline', 'text-before-edge');
  var text = document.createTextNode(gote);
  label.appendChild(text);
  kyokumen.appendChild(label);

  return i;
}

function getWidth(kyokumen) {
  var owidth = kyokumen.getAttribute("data-width");
  if(owidth) {
    return Number(owidth);
  }

  var str_width = document.defaultView.getComputedStyle(kyokumen, null).width;
  var width = parseFloat(str_width);

  if(!width) {
    console.log('Error in width: ' + str_width);
    return undefined;
  }

  return width;
}

function getMargin(kyokumen) {
  /**
   *  top-bottom left-right
   *  top right-left bottom
   *  top right botton left
   */

  var margin = [];

  var omargin = kyokumen.getAttribute("data-margin");
  if (omargin) {
    return omargin.split(',').map(Number);
  }

  var sm = document.defaultView.getComputedStyle(kyokumen, null).padding

  var n = sm.length;


  if (n == 1) {
    m = parseFloat(sm[0]);
    margin = [m, m, m, m];
  }
  else if (n == 2) {
    t = parseFloat(sm[0]);
    l = parseFloat(sm[1]);
    margin = [t, l, t, l];
  }
  else if (n == 3) {
    margin = [parseFloat(sm[0]), parseFloat(sm[1]), parseFloat(sm[2]), parseFloat(sm[1])];
  }
  else if (n == 4) {
    margin = [parseFloat(sm[0]), parseFloat(sm[1]), parseFloat(sm[2]), parseFloat(sm[3])];
  }
  else {
    margin = [30, 60, 10, 60];
  }

  return margin;
}

function getBoard(o) {
  if (o.tagName == 'svg')
    return o;

  var boardid = o.getAttribute('data-board');
  if (!boardid) {
    console.log('Error: attribute board not defined');
    console.log(o);
    return;
  }

  var kyokumen = document.getElementById(boardid);
  if (!kyokumen) {
    console.log('Error: board not found with id= ' + boardid);
    return;
  }

  return kyokumen;
}

