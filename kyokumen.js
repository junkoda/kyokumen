/**
 * kyokumen.js: A library for shogi documents on the web
 * Author:      Jun Koda (2016)
 * Website:     https://github.com/junkoda/kyokumen
 */


if (typeof kyokumenJs == 'undefined') {

kyokumenJs = {
  ver: '0.0.2',
  senteMark: '☗',
  goteMark: '☖',
};

(function () {
const nrow = 9;
const Piece = { l:'香', n:'桂', s:'銀', g:'金', k:'玉', r:'飛', b:'角', p:'歩', '+l':'成香', '+n':'成桂', '+s':'成銀', '+r':'龍', '+b':'馬', '+p':'と'};
const numKanji = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八'];


function main() {
  window.addEventListener('load', eventWindowLoaded, false);

  const defaultCSS = 'https://junkoda.github.io/kyokumen/' + kyokumenJs.ver + '/kyokumen.css';

  loadDefaultCSS(defaultCSS);

  function eventWindowLoaded() {
    setupKyokumens();
    setupMoves();
  }

  /**
   * Find all tags with class='kyokumen' and create kyokumens
   */
  function setupKyokumens() {
    var figs = document.getElementsByClassName('kyokumen');

    var n = figs.length;
    for (var i = 0; i < n; i++)
      createKyokumen(figs[i]);
  }

  /**
   * Find all tags with class='mv' and attach event listener drawMove
   */
  function setupMoves() {
    var moves = document.getElementsByClassName('mv');

    var n = moves.length;
    for (var i = 0; i < moves.length; i++)
      moves[i].addEventListener('mouseover', drawMove, false);
  }
}


/**
 * Create a new SVG node in a given fig
 */
function createKyokumenSvg(fig) {
  var s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  s.setAttribute('class', 'kyokumen-svg');

  var figId = fig.getAttribute('id');
  if (figId) {
    s.setAttribute('id', figId + '-svg');
  }

  fig.appendChild(s);

  return s;
}


/**
 *Variables:
 * *fig* is an <figure> element with class='kyokumen' and an sfen attribute
 * e.g.: <figure id='fig1' class='kyokumen'
 *         sfen='lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b 1'>
 *       </figure>
 * *width*is the width of the board in pixcels
 */

function getWidth(fig, svg) {
  var owidth = fig.getAttribute('data-width');
  if (owidth) {
    return Number(owidth);
  }

  var strWidth = document.defaultView.getComputedStyle(svg, null).width;
  var width = parseFloat(strWidth);

  if (!width) {
    console.log('Error in width: ' + strWidth);
    return undefined;
  }

  return width;
}

function getPadding(fig, svg) {
  /**
   * Return an array of [padding-top, padding-right, padding-bottom, padding-top]
   */

  var omargin = fig.getAttribute('data-padding');
    
  if (omargin) {
    return omargin.split(',').map(Number);
  }

  svg = svg || getKyokumenSvg(fig);

  var margin = [0, 0, 0, 0];

  style = document.defaultView.getComputedStyle(svg, null)

  margin[0] = parseFloat(style.paddingTop);
  margin[1] = parseFloat(style.paddingRight);
  margin[2] = parseFloat(style.paddingBottom);
  margin[3] = parseFloat(style.paddingLeft);

  return margin;
}

/*
 * Create a kyokumen object and display it in the fig element
 */
function createKyokumen(fig) {
  var svg = createKyokumenSvg(fig);
  const width = getWidth(fig, svg);
  const margin = getPadding(fig, svg);
  const sfen = fig.getAttribute('data-sfen');
  const sente = fig.getAttribute('data-sente');
  const gote = fig.getAttribute('data-gote');
  const title = fig.getAttribute('data-title');
  // sente, gote can be falsy, default will be used.
    
  svg.style.width = String(width + margin[1] + margin[3]) + 'px';
  svg.style.height = String(width + margin[0] + margin[2]) + 'px';
  svg.style.padding = '0';

  /*
   * kyokumen object
   */
  fig.kyokumen = {
    'svg': svg,
    'width': width,
    'margin': margin,
    'sente': sente,
    'gote': gote,
    'title': title,
    'clear': function() {
      svg = this.svg;
      clearKyokumen(svg, 'koma');
      clearKyokumen(svg, 'nari-goma');
      clearKyokumen(svg, 'sente');
      clearKyokumen(svg, 'gote');
    },
    'draw': function(sfen, sente, gote, title) {
      this.clear();
      drawPieces(this, sfen, sente, gote, title);
    }
  };

  drawBan(svg, width, margin);        // Box and lines
  drawNumbersCol(svg, width, margin); // Axis label ９、８、･･･、１
  drawNumbersRow(svg, width, margin); // Axis label 一、二、･･･、九
  drawPieces(fig.kyokumen, sfen, sente, gote, title);
}

/**
 * Draw move
 */
function drawMove() {
  /**
   * @this is a class='mv' tag width board='board id' and sfen
   */

  var fig = getFig(this);
  if (!fig) return;

  var kyokumen = fig.kyokumen;

  var sfen = this.getAttribute('data-sfen');
  if (!sfen) {
    console.log('Error: unable to get sfen in move:');
    console.log(this);
  }

  var sente = this.getAttribute('data-sente') || fig.getAttribute('data-sente');
  var gote = this.getAttribute('data-gote') || fig.getAttribute('data-gote');
  var title = this.getAttribute('data-title') || fig.getAttribute('data-title');

  var svg = kyokumen.svg;

  // Remove existing pieces
  kyokumen.draw(sfen, sente, gote, title);
}


/**
 * Draw a square and lines for shogi-ban
 */
function drawBan(svg, width, margin) {
  var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('class', 'ban');
  rect.setAttribute('x', margin[3]);
  rect.setAttribute('y', margin[0]);
  rect.setAttribute('width', width);
  rect.setAttribute('height', width);
  svg.appendChild(rect);

  var w = width / nrow;

  // 横線
  for (var i = 1; i < nrow; i++) {
    var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('class', 'sen');
    line.setAttribute('x1', margin[3]);
    line.setAttribute('x2', margin[3] + width);
    line.setAttribute('y1', margin[0] + w * i);
    line.setAttribute('y2', margin[0] + w * i);
    svg.appendChild(line);
  }

  // 縦線
  for (var i = 1; i < nrow; i++) {
    var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', margin[3] + w * i);
    line.setAttribute('x2', margin[3] + w * i);
    line.setAttribute('class', 'sen');
    line.setAttribute('y1', margin[0]);
    line.setAttribute('y2', margin[0] + width);
    svg.appendChild(line);
  }
}

/**
 *  Draw 9 ... 1 on top magin
 */
function drawNumbersCol(svg, width, margin) {
  const offsetNumCol = kyokumenJs.offsetNumCol || 0.26;

  var w = width / nrow;
  label = ['９', '８', '７', '６', '５', '４', '３', '２', '１'];

  for (var i = 0; i < nrow; i++) {
    var num = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    num.setAttribute('class', 'num');
    num.setAttribute('x', margin[3] + w * (i + 0.5));
    num.setAttribute('y', margin[0] - w*offsetNumCol); // + -w * axisLine - 2);


    num.setAttribute('text-anchor', 'middle');
    //num.setAttribute('dominant-baseline', 'middle');
    var text = document.createTextNode(label[i]);
    num.appendChild(text);
    svg.appendChild(num);
  }
}

/**
 *  Draw 一、二、･･･、九 on left margin
 */
function drawNumbersRow(svg, width, margin) {
  const offsetNumRow = kyokumenJs.offsetNumRow || 0.55;
  var w = width / nrow;

  for (var i = 0; i < nrow; i++) {
    var num = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    num.setAttribute('class', 'num');
    num.setAttribute('x', margin[3] + width + w*offsetNumRow);
    num.setAttribute('y', margin[0] + w * (i + 0.5));

    num.setAttribute('text-anchor', 'middle');
    num.setAttribute('dominant-baseline', 'central');
    var text = document.createTextNode(numKanji[i]);
    num.appendChild(text);
    svg.appendChild(num);
  }
}

/**
 * Parse sfen string and draw pieces
 */
function drawPieces(kyokumen, sfen, sente, gote, title) {
  // e.g. sfen='lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b'>
  // for example for initial

  kyokumen.sfen = sfen;
  if(sente) kyokumen.sente = sente;
  if(gote) kyokumen.gote = gote;
  if(title) kyokumen.title = title;

  var svg = kyokumen.svg;
  const width = kyokumen.width;
  const margin = kyokumen.margin;
  sfen= kyokumen.sfen;

  const w = width / nrow;
  const n = sfen.length;

  // Pices on board
  var i;
  var ix = 0;
  var iy = 0;

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
      drawPiece(svg, margin, w, ix, iy, p);
      ix++;
    }
  }

  i = skipTeban(sfen, i);

  i = DrawSente(svg, width, margin, sfen, kyokumen.sente, i);
  i = DrawGote(svg, width, margin, sfen, kyokumen.gote, i);

  kyokumen.sfen = sfen;
}

/**
 * Draw one piece
 * Args:
 *       w:  width / nrow
 *       ix: 0...9, column index
 *       iy: 0...9, row index
 *       p:  sfen character 'p', 'P', ..., or promoted '+p', '+P', ..
 */
function drawPiece(svg, margin, w, ix, iy, p) {
  var pieceText = Piece[p.toLowerCase()];

  if (pieceText) {
    var x = margin[3] + w * (ix + 0.5);
    var y = margin[0] + w * (iy + 0.5);
    var piece = document.createElementNS('http://www.w3.org/2000/svg', 'text');

    if (p.charAt(0) == '+') {
      piece.setAttribute('class', 'nari-goma');
    }
    else {
      piece.setAttribute('class', 'koma');
    }

    piece.setAttribute('x', x);
    piece.setAttribute('y', y);

    if (isGote(p)) {
      // Rotate Gote's piece
      var transformation = 'translate(' + String(x) + ' ' + String(y) + ') ';
      if (pieceText.length == 2) {
        // Shrink the height of Gote's 成香、成桂、成銀
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
    svg.appendChild(piece);
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
function DrawSente(svg, width, margin, sfen, sente, i) {
  const w = width/nrow;
  var n = sfen.length;

  if (!sente)
    sente = ' 先手 ';
  else
    sente = ' ' + sente + ' ';

  while (i < n) {
    var p = sfen.charAt(i);
    if(p === '-' || p === ' ')
      break;

    number = parseInt(sfen.substring(i, n));
    if (number) {
      sente += numKanji[number - 1];
      i += String(number).length;
    }
    else if (isGote(p)) {
      break;
    }
    else {
      sente += Piece[p.toLowerCase()];
      i++;
    }
  }

  var komark = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
  komark.setAttribute('class', 'komark');
  komark.appendChild(document.createTextNode(kyokumenJs.senteMark));


  var label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  label.setAttribute('class', 'sente');
  label.setAttribute('x', margin[3] + width + w + (margin[1] - w)/2);
  //label.setAttribute('x', margin[1] + (1 + 1.5 / nrow) * width + 4);
  label.setAttribute('y', margin[0]);
  label.setAttribute('dominant-baseline', 'central');
  var text = document.createTextNode(sente);
  label.appendChild(komark);
  label.appendChild(text);

  svg.appendChild(label);

  return i;
}

/**
 * Draw <svg gote='☖後手'> attribute with Gote's pieces in hand.
 */
function DrawGote(svg, width, margin, sfen, gote, i) {
  var n = sfen.length;
  //var gote = ' ' + kyokumen.getAttribute('data-gote');
  if (!gote)
    gote = ' 後手 ';
  else
    gote = ' ' + gote + ' ';

  while (i < n) {
    var p = sfen.charAt(i);
    if (p === '-' || p === ' ') {
      i++;
      break;
    }

    number = parseInt(sfen.substring(i, n));
    if (number) {
      gote += numKanji[number - 1];
      i += String(number).length;
    }
    else {
      gote += Piece[p.toLowerCase()];
      i++;
    }
  }

  var komark = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
  komark.setAttribute('class', 'komark');
  komark.appendChild(document.createTextNode(kyokumenJs.goteMark));

  var label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  label.setAttribute('class', 'gote');
  label.setAttribute('x', margin[3]/2);
  label.setAttribute('y', margin[0]);
  label.setAttribute('dominant-baseline', 'central');
  var text = document.createTextNode(gote);
  label.appendChild(komark);
  label.appendChild(text);

  svg.appendChild(label);

  return i;
}

/**
  * Remove class=cls child elements from kyokumen
  * Args:
  *     kyokumen: a DOM element
  *     cls (string): class name 'koma', 'nari-goma', ...
  */
function clearKyokumen(svg, cls) {
  var komas = svg.getElementsByClassName(cls);
  while (komas.length > 0) {
    svg.removeChild(komas[0]);
    komas = svg.getElementsByClassName(cls);
  }
}


/**
  * Return <figure class="kyokumen"> object -- kyokumenFig
  * When o is a class="mv", return the kyokumenFig specified by the 'data-board' attr
  * When o is itself a figure opject return o.
  */
function getFig(o) {
  if (o.tagName == 'FIGURE')
    return o;

  var boardid = o.getAttribute('data-board');

  var kyokumenFig = document.getElementById(boardid);
  if (!kyokumenFig) {
    console.log('Error: board not found with id= ' + boardid);
    return;
  }

  return kyokumenFig;
}


function loadDefaultCSS(filename)
{
  var link = document.createElement('link');
  link.href = filename;
  link.type = "text/css";
  link.rel = "stylesheet";

  head = document.getElementsByTagName('head')[0];

  firstlink = head.getElementsByTagName('link')[0];
  if (firstlink) {
    head.insertBefore(link, firstlink)
  }
  else {
    head.appendChild(link); 
  }
}

main();
}());

}



