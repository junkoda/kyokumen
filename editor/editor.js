/**
 * edirot.js:   A SFEN edior
 * Author:      Jun Koda (2016)
 * Website:     https://github.com/junkoda/kyokumen
 */

if (typeof sfenEditorJs == 'undefined') {
var sfenEditorJs = {
  senteHand: [], // 先手持ち駒
  goteHand: [], // 後手持ち駒
};

(function () {

const nrow = 9;
const pieceAscii = { 108:'l', 110:'n', 115:'s', 103:'g', 107:'k', 114:'r', 98:'b', 112:'p', 76:'L', 78:'N', 83:'S', 71:'G', 75:'K', 82:'R', 66:'B', 80:'P', 43:'+', 32:''};
const Piece = { l:'香', n:'桂', s:'銀', g:'金', k:'玉', r:'飛', b:'角', p:'歩', '+l':'成香', '+n':'成桂', '+s':'成銀', '+r':'龍', '+b':'馬', '+p':'と'};

var editor = sfenEditorJs;

function main () {
  if(! kyokumenJs ) {
    console.log('Error; kyokumenJS not loaded');
    return;
  }

  window.addEventListener('load', eventWindowLoaded, false);

  function eventWindowLoaded() {
    var fig = document.getElementById("sfen-editor");
    editor.init(fig);


    fig.addEventListener('keydown',  eventKeyDown);
    fig.addEventListener('keypress', eventKeyPress);
    fig.addEventListener('mousedown', eventMouseDown);

    var sfenText = document.getElementById("sfen");
    sfenText.addEventListener('keyup', eventTextDown);

    updateKyokumenFromText();
  }
}

/**
 *   Editor
 */

sfenEditorJs.init = function(fig) {
  var kyokumen = fig.kyokumen;

  this.ban = new Array(nrow*nrow);
  this.fig = fig;
  this.kyokumen = kyokumen;
  this.width = kyokumen.width;
  this.margin = kyokumen.margin;
  this.w = this.width / nrow;

  createCursor(this)
}

sfenEditorJs.set = function(sfen) {
  sfen = sfen || 'lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b - 1"'

  constructBan(sfen);
  refreshKyokumen();
}


function createCursor(e) {
  var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('id', 'cursor');
  rect.setAttribute('width', editor.w - 4);
  rect.setAttribute('height', editor.w - 4);

  e.kyokumen.svg.appendChild(rect); 
  e.cursor = rect;
  moveCursor(-1, -1);
}

/*
 * Move cursor to a new position ix, iy
 */
function moveCursor(ix, iy) {
  var cursor = editor.cursor;
  if(ix < 0 && iy < 0) {
    editor.ix = ix;
    editor.iy = iy;
    cursor.setAttribute('visibility', 'hidden');
    return;
  }

  /*
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
  */
  if(0 <= ix && ix < nrow && 0 <= iy && iy < nrow) {
    cursor.setAttribute('visibility', 'visible');
    cursor.setAttribute('x', editor.margin[3] + ix*editor.w + 2);
    cursor.setAttribute('y', editor.margin[0] + iy*editor.w + 2);

    editor.ix = ix;
    editor.iy = iy;
  }
}


/*
 * Move a piece at (editor.ix, editor.iy) to (ix, iy)
 */
function movePiece(ix, iy)
{
  if(ix < 0 || iy < 0 || editor.ix < 0 || editor.iy < 0) {
    console.log('Error; movePiece coordinate is negative.')
    return false;
  }
  else if(ix == editor.ix && iy == editor.iy)
    return true;
  
  console.log('movePiece');

  // current focus
  var iban1 = editor.iy*nrow + editor.ix;
  var p1 = editor.ban[iban1];
  const gote1 = isGote(p1);

  if(!p1)
    return false;

  // destination
  const iban2 = nrow*iy + ix;
  const p2 = editor.ban[iban2];
  const gote2 = isGote(p2);

  if(p2 != '') {
    if(gote1 == gote2)
      return true; // Cannot take your own piece
    
    console.log(gote1)

    if(gote1) {
      editor.goteHand.push(p2.toUpperCase());
    }
    else {
      console.log('push to senteHand');
      editor.senteHand.push(p2.toLowerCase());
    }
  }

  editor.ban[iban1] = '';
  editor.ban[iban2] = p1;

  //refreshKyokumen();
  updateKyokumenFromBan();

  return true;
}

function movePieceSente()
{
  // move focused piece (editor.ix, editor.iy) to Sente's hand
  console.log('movePiece Sente');

  // current focus
  const iban = editor.iy*nrow + editor.ix;
  const p = editor.ban[iban];

  if(!p)
    return false;

  editor.senteHand.push(p.toUpperCase());
  editor.ban[iban] = '';

  refreshKyokumen();

  return true;
}

function movePieceGote()
{
  console.log('movePiece Gote');

  // current focus
  const iban = editor.iy*nrow + editor.ix;
  const p = editor.ban[iban];

  if(!p)
    return false;

  editor.goteHand.push(p.toLowerCase());
  editor.ban[iban] = '';

  refreshKyokumen();

  return true;
}

/*
 * Construct a sfen text from ban[] and set it to text box
 */
function constructText(ban) {
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

  text += ' b ';
  for(var i=0; i<editor.senteHand.length; i++)
    text += editor.senteHand[i].toUpperCase();
  for(var i=0; i<editor.goteHand.length; i++)
    text += editor.goteHand[i].toLowerCase();

  if(editor.senteHand.length == 0 && editor.goteHand.length == 0)
    text += '-';

  text += ' 1';

  var sfenText = document.getElementById("sfen");
  sfenText.innerHTML = text;

  return text;
}

function skipTeban(sfen, i) {
  var n = sfen.length;
  while (i < n) {
    p = sfen.charAt(i);
    console.log(p);

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

function isGote(character) {
  return (character == character.toLowerCase());
}

function constructSenteHand(sfen, i) {
  const n = sfen.length;

  editor.senteHand = [];

  while (i < n) {
    var p = sfen.charAt(i);

    if(p === '-' || p === ' ')
      break;

    if (!(Piece[p.toLowerCase()] || parseInt(p))) {
      i++;
      continue;
    }

    number = parseInt(sfen.substring(i, n));
    if (number) {
      for(var k=0; k<number; k++)
        editor.senteHand.push(p.toLowerCase());

      i += String(number).length;
    }
    else if (isGote(p)) {
      break;
    }
    else {
      editor.senteHand.push(p.toLowerCase());
      i++;
    }
  }

  console.log('sente', editor.senteHand);

  return i;
}

function constructGoteHand(sfen, i) {
  const n = sfen.length;

  editor.goteHand = [];

  while (i < n) {
    var p = sfen.charAt(i);
    if (p === '-' || p === ' ') {
      i++;
      break;
    }

    if (!(Piece[p.toLowerCase()] || parseInt(p))) {
      i++;
      continue;
    }

    number = parseInt(sfen.substring(i, n));
    if (number) {
      for(var k=0; k<number; k++)
        editor.goteHand.push(p);
      i += String(number).length;
    }
    else {
      editor.goteHand.push(p);
      i++;
    }
  }

  console.log('gote', editor.goteHand);

  return i;
}

/*
 * Construct ban, senteHand, goteHand arrays from sfen string
 */
function constructBan(sfen) {
  const n = sfen.length;

  // Pices on board
  var i;
  var ix = 0;
  var iy = 0;
  var iban = 0;

  for (i = 0; i < n; i++) {
    p = sfen.charAt(i);

    if (!(Piece[p.toLowerCase()] || parseInt(p) || p === ' '))
      continue;

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
      for(k=0; k<number; k++)
        editor.ban[iban + k] = '';
      iban += number;
      ix += number;
    }
    else if (p == ' ') { // End of board discription
      break;
    }
    else {
      editor.ban[iban] = p;
      ix++;
      iban ++;
    }
  }

  //console.log(editor.ban);

  i = skipTeban(sfen, i);

  i = constructSenteHand(sfen, i);
  i = constructGoteHand(sfen, i);
}

/*
 *  Event responce funtions
 */

function eventKeyPress(event) {
  //console.log('key press ' + event.which);
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
  else if (event.which == 13) {
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


    //console.log(editor.ban[index]);
    refreshKyokumen();
    moveCursor(editor.ix + 1, editor.iy);
 
  }
}


function eventMouseDown(event) {
  //var svg = this;
  var svg = editor.kyokumen.svg;
  var rect = svg.getBoundingClientRect();
  var width = editor.kyokumen.width;
  var w = width/nrow;
  var margin = editor.kyokumen.margin;

  var ix = Math.floor((event.clientX - rect.left - margin[3])/w);
  var iy = Math.floor((event.clientY - rect.top  - margin[0])/w);

  console.log(ix, iy);

  if (editor.ix >= 0 && editor.iy >= 0) {
    // focused
    if (0 <= ix && ix < nrow && 0 <= iy && iy < nrow)
      movePiece(ix, iy);
    else if (0 <= iy && iy < nrow && ix < 0)
      movePieceGote();
    else if (0 <= iy && iy < nrow && ix >= nrow)
      movePieceSente();
    
    moveCursor(-1, -1);
  } 
  else
    // focus (ix, iy)
    moveCursor(ix, iy);
}


function refreshKyokumen() {
  sfen = constructText(editor.ban);
  editor.kyokumen.draw(sfen);
}

function updateKyokumenFromBan() {
  var sfenText = document.getElementById("sfen");

  sfen = constructText(editor.ban);
  sfenText.value = sfen;
  editor.kyokumen.draw(sfen);
}

function updateKyokumenFromText() {
  var sfenText = document.getElementById("sfen");
  console.log('sfenText', sfenText.value);

  constructBan(sfenText.value);

  console.log(editor.ban);

  sfen = constructText(editor.ban);
  sfenText.value = sfen;
  editor.kyokumen.draw(sfen);
}
/*
 * Move Cursor when an arrow key pressed
 */
function eventKeyDown(event) {
  console.log(event.which);

  switch(event.which) {
    case 27:
      // Esc
      moveCursor(-1, -1);
      break;
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

function eventTextDown(event) {
  console.log(event.which);
  if (event.which == 13) {
    updateKyokumenFromText();
  }
}


main();
}());
}




