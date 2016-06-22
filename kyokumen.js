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

function eventWindowLoaded() {
  drawKyokumens();
  setupMoves();
}

/**
 * Find all tags with class='kyokumen' and draw the kyokumens
 */
function drawKyokumens() {
  var kyokumens = document.getElementsByClassName('kyokumen');

  var n = kyokumens.length;
  for (var i = 0; i < n; i++) {
    kyokumens[i].addEventListener('click', drawMove, false);
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
 * Draw move
 */
function drawMove() {
  /**
   * 'this' is a class='mv' tag width board='board id' and sfen
   */

  var kyokumen = getBoard(this);
  if (!kyokumen) return;
  var sfen = this.getAttribute('sfen');
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

  drawPieces(kyokumen, width, sfen);
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
 *Variables:
 * *kyokumen* is an <svg> tag with class='kyokumen' and an sfen attribute
 * e.g.: <svg id='zu1' class='kyokumen'
 *         sfen='lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b'>
 *        </svg>
 * *width*is the width of the svg element, which is the length of the board in pixcels
 */

function drawKyokumen(kyokumen) {
  var width = getWidth(kyokumen);

  drawBan(kyokumen, width);        // Box and lines
  drawNumbersCol(kyokumen, width); // Axis label ９、８、･･･、１
  drawNumbersRow(kyokumen, width); // Axis label 一、二、･･･、九
  drawPieces(kyokumen, width, null);
}

/**
 * Draw a square and lines for shogi-ban
 */
function drawBan(kyokumen, width) {
  kyokumen.setAttribute('height', width);

  var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('class', 'ban');
  rect.setAttribute('x', '0');
  rect.setAttribute('y', '0');
  rect.setAttribute('width', width);
  rect.setAttribute('height', width);
  kyokumen.appendChild(rect);

  var w = width / nrow;

  // 横線
  for (var i = 1; i < nrow; i++) {
    var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('class', 'sen');
    line.setAttribute('x1', '0');
    line.setAttribute('x2', width);
    line.setAttribute('y1', w * i);
    line.setAttribute('y2', w * i);
    kyokumen.appendChild(line);
  }

  // 縦線
  for(var i=1; i<nrow; i++) {
    var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', w * i);
    line.setAttribute('x2', w * i);
    line.setAttribute('class', 'sen');
    line.setAttribute('y1', '0');
    line.setAttribute('y2', width);
    kyokumen.appendChild(line);
  }
}

/**
 *  Draw 9 ... 1 on top magin
 */
function drawNumbersCol(kyokumen, width) {
  var w = width / nrow;
  label = ['９', '８', '７', '６', '５', '４', '３', '２', '１'];

  for(var i=0; i<nrow; i++) {
    var num = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    num.setAttribute('class', 'num');
    num.setAttribute('x', w * (i + 0.5));
    num.setAttribute('y', -w * axisLine - 2);

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
function drawNumbersRow(kyokumen, width) {
  var w = width / nrow;

  for(var i=0; i<nrow; i++) {
    var num = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    num.setAttribute('class', 'num');
    num.setAttribute('x', width + w * axisLine + 2);
    num.setAttribute('y', w * (i + 0.5));

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
function drawPieces(kyokumen, width, sfen) {
  // e.g. sfen='lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b'>
  // for example for initial
  if (!sfen)
    sfen = kyokumen.getAttribute('sfen');

  var w = width / nrow;
  var n = sfen.length;
  var ix = 0;
  var iy = 0;

  // Pices on board
  var i;
  for (i = 0; i < n; i++) {
    p = sfen.charAt(i);
    if(p == '+') {
      p = sfen.substring(i, i + 2);
      i++;
    }

    var number = Number(p);
    if(p == '/') { // Next row
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
      drawPiece(kyokumen, w, ix, iy, p);
      ix++;
    }
  }

  i = skipTeban(sfen, i);

  i = DrawSente(kyokumen, width, sfen, i);
  i = DrawGote(kyokumen, width, sfen, i);
}

/**
 * Draw one piece
 * Args:
 *       w:  width / nrow
 *       ix: 0...9, column index
 *       iy: 0...9, row index
 *       p:  sfen character 'p', 'P', ..., or promoted '+p', '+P', .. 
 */
function drawPiece(kyokumen, w, ix, iy, p) {
  var pieceText = Piece[p.toLowerCase()];

  if (pieceText) {
    var x = w * (ix + 0.5);
    var y = w * (iy + 0.5);
    var piece = document.createElementNS('http://www.w3.org/2000/svg', 'text');

    if (p.charAt(0) == '+') {
      piece.setAttribute('class', 'nari-goma');
    }
    else {
      piece.setAttribute('class', 'koma');
    }

    piece.setAttribute('x', x - 2);
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
    piece.setAttribute('dominant-baseline', 'middle');
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
  while (i<n) {
    p = sfen.charAt(i);
    if(p == ' ')
      i++;
    else if(p == 'b' || p == 'w') {
      console.log('Teban is ' + p);
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
function DrawSente(kyokumen, width, sfen, i) {
  var n = sfen.length;
  var sente = kyokumen.getAttribute('sente');
  if(!sente)
    sente = SENTE;
  sente += ' ';

  while (i < n) {
    var p = sfen.charAt(i);
    number = parseInt(sfen.substring(i,n));
    if(number) {
      sente += numKanji[number - 1];
      i += String(number).length;
    }
    else if(isGote(p)) {
      break;
    }
    else {
      sente += Piece[p.toLowerCase()];
      i++;
    }
  }
  
  var label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  label.setAttribute('class', 'sente');
  label.setAttribute('x', (1 + 1.2/nrow)*width + 4);
  label.setAttribute('y', 0);
  label.setAttribute('dominant-baseline', 'text-after-edge');
  var text = document.createTextNode(sente);
  label.appendChild(text);
  kyokumen.appendChild(label);

  return i;
}

/**
 * Draw <svg gote='☖後手'> attribute with Gote's pieces in hand.
 */
function DrawGote(kyokumen, width, sfen, i) {
  var n = sfen.length;
  var gote = kyokumen.getAttribute('gote');
  if(!gote)
    gote = GOTE;
  gote += ' ';

  while(i<n) {
    var p = sfen.charAt(i);
    if(p == ' ') break;

    number = parseInt(sfen.substring(i,n));
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
  label.setAttribute('x', -0.2*width/nrow);
  label.setAttribute('y', 0);
  label.setAttribute('dominant-baseline', 'text-before-edge');
  var text = document.createTextNode(gote);
  label.appendChild(text);
  kyokumen.appendChild(label);

  return i;
}

function getWidth(kyokumen) {
  var str_width = document.defaultView.getComputedStyle(kyokumen, null).width;
  var width = parseFloat(str_width);

  if(!width) {
    console.log('Error in width: ' + str_width);
    return undefined;
  }

  return width;
}

function getBoard(o) {
  if(o.tagName == 'svg')
    return o;

  var boardid = o.getAttribute('board');
  if(!boardid) {
    console.log('Error: attribute board not defined');
    console.log(o);
    return;
  }

  var kyokumen = document.getElementById(boardid);
  if(!kyokumen) {
    console.log('Error: board not found with id= ' + boardid);
    return;
  }

  return kyokumen;
}

