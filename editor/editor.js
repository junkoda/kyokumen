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
const PieceNum = {o:0, k:1, r:2, b:3, g:4, s:5, n:6, l:7, p:8};
const PieceArray = ['o', 'k', 'r', 'b', 'g', 's', 'n', 'l', 'p'];
const numKanji = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八'];
const Promotable = {p: true, l: true, n: true, s: true, r: true, b:true, g: false, k: false, o: false}

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
    fig.addEventListener('click', eventMouseDown);
    fig.addEventListener("dblclick", eventDoubleClick);
    //ban = fig.getElementsByClassName('ban')[0];
    //ban.addEventListener('mousedown', eventMouseDown);
    //editor.banRect = ban;

    var sfenText = document.getElementById("sfen");
    sfenText.addEventListener('keyup', eventTextDown);

    updateKyokumenFromText(null);
  }
}

/**
 *   Editor
 */

sfenEditorJs.init = function(fig) {
  var kyokumen = fig.kyokumen;

  kyokumen.svg.removeEventListener('click', kyokumen.reset);

  this.ban = new Array(nrow*nrow);
  this.fig = fig;
  this.kyokumen = kyokumen;
  this.width = kyokumen.width;
  this.margin = kyokumen.margin;
  this.w = this.width / nrow;
  this.focus = null;

  createCursor(this)
}

sfenEditorJs.set = function(sfen) {
  sfen = sfen || '';

  if (sfen === 'hirate') {
    sfen =='lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b - 1'
  }
  
  updateKyokumenFromText(sfen);
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
    editor.focus = null;
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

    p = editor.ban[iy*nrow + ix];
    editor.ix = ix;
    editor.iy = iy;
    editor.focus = {type: 'ban', ix: ix, iy: iy, p: p};
  }
}

/*
 * Move piece from Sente's hand to board
 */
function movePieceFromSente(ix, iy)
{
  var i = editor.focus.i;
  var p = editor.focus.p

  const iban2 = nrow*iy + ix;
  var p2 = editor.ban[iban2];
  if(p2) {
    moveCursor(ix, iy);
    return false;
  }

  editor.senteHand.splice(i, 1);
  editor.ban[iban2] = p.toUpperCase();

  return true;
}

/*
 * Move piece from Sente's hand to board
 */
function movePieceFromGote(ix, iy)
{
  var i = editor.focus.i;
  var p = editor.focus.p

  const iban2 = nrow*iy + ix;
  var p2 = editor.ban[iban2];
  if(p2) {
    moveCursor(ix, iy);
    return false;
  }

  editor.goteHand.splice(i, 1);
  editor.ban[iban2] = p;

  return true;
}
/*
 * Move a piece at (editor.ix, editor.iy) to (ix, iy)
 */
function movePiece(ix, iy)
{
  if(editor.focus === null)
    return;

  if(editor.focus.type === 'sente') {
    if(!movePieceFromSente(ix, iy))
      return;
  }
  else if(editor.focus.type === 'gote') {
    if(!movePieceFromGote(ix, iy))
      return;
  }
  else if(editor.focus.type === 'ban') {
    if(ix == editor.ix && iy == editor.iy)
      return; // destination is equal to source
    else if(!editor.focus.p) {
      return; // no piece in the focused square
    }

    // current focus
    var iban1 = editor.iy*nrow + editor.ix;
    var p1 = editor.ban[iban1];
    const gote1 = isGote(p1);

    // destination
    const iban2 = nrow*iy + ix;
    var p2 = editor.ban[iban2];
    const gote2 = isGote(p2);

    if(p2 != '') {
      if(gote1 == gote2) {
        moveCursor(ix, iy);
        return;
      }
    
      p2 = toPlain(p2); 

      if(p2 && gote1) {
        editor.goteHand.push(p2);
      }
      else if(p2) {
        editor.senteHand.push(p2);
      }
    }

    editor.ban[iban1] = '';
    editor.ban[iban2] = p1;
  }

  updateKyokumenFromBan();

  moveCursor(-1, -1);
  return true;
}

function movePieceToSente()
{
  // move focused piece (editor.ix, editor.iy) to Sente's hand

  // current focus
  if(editor.focus === null || !editor.focus.p)
    return;
  else if(editor.focus.type === 'sente')
    return;

  const p = editor.focus.p;
  editor.senteHand.push(p.toLowerCase());

  if(editor.focus.type === 'ban') {
    const iban = editor.focus.iy*nrow + editor.focus.ix;
    editor.ban[iban] = '';
  }
  else if(editor.focus.type === 'gote') {
    editor.goteHand.splice(editor.focus.i, 1);
  }

  moveCursor(-1, -1);
  updateKyokumenFromBan();
}

function movePieceToGote()
{
  if(editor.focus === null)
    return;
  else if(!editor.focus.p)
    return;
  else if(editor.focus.type === 'gote')
    return;

  const p = editor.focus.p;
  editor.goteHand.push(p.toLowerCase());

  if(editor.focus.type === 'ban') {
    const iban = editor.focus.iy*nrow + editor.focus.ix;
    editor.ban[iban] = '';
  }
  else if(editor.focus.type === 'sente') {
    editor.senteHand.splice(editor.focus.i, 1);
  }

  moveCursor(-1, -1);
  updateKyokumenFromBan();
}

function constructTextInHand(a)
{
  var text = '';
  for(var i=0; i<a.length; i++) {
    text += a[i];
    var num = 1;
    for(var j=i+1; j<a.length; j++) {
      if(a[i] === a[j]) {
        num++;
      }
      else
        break;
    }
    if(num > 1) {
      i += (num - 1);
      text += num.toString();
    }
  }

  return text;
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

  editor.senteHand = sortPieces(editor.senteHand);
  editor.goteHand = sortPieces(editor.goteHand);

  text += constructTextInHand(editor.senteHand).toUpperCase();
  text += constructTextInHand(editor.goteHand).toLowerCase();

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

/*
 * construct editor.senteHand array from sfen string
 */
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

  for(var i = 0; i <nrow*nrow; i++)
    editor.ban[i] = '';

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

  i = skipTeban(sfen, i);

  i = constructSenteHand(sfen, i);
  i = constructGoteHand(sfen, i);
}

/*
 *  Event responce funtions
 */

function eventKeyPress(event) {
  /**
   * Keyboard short cut with ctrl
   */
  if(event.ctrlKey) {
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
  else {
    key = pieceAscii[event.which];
    if(key === undefined) return;

    index = nrow*editor.iy + editor.ix;
    if(editor.ban[index] === '+' && key != '+' && key !== '') {
      // Add piece alphabet after +
      editor.ban[index] += key;
    } 
    else {
      editor.ban[index] = key;
    }

    updateKyokumenFromBan();
    moveCursor(editor.ix + 1, editor.iy);
  }
}


function eventMouseDown(event) {
  var svg = editor.kyokumen.svg;
  var rect = svg.getBoundingClientRect();

  var width = editor.kyokumen.width;
  var w = width/nrow;
  var margin = editor.kyokumen.margin;

  var ix = Math.floor((event.clientX - rect.left - margin[3])/w);
  var iy = Math.floor((event.clientY - rect.top  - margin[0])/w);

  if (editor.focus && editor.focus.p) {
    // focused
    if (0 <= ix && ix < nrow && 0 <= iy && iy < nrow)
      movePiece(ix, iy);
    else if (0 <= iy && iy < nrow && ix < 0)
      movePieceToGote();
    else if (0 <= iy && iy < nrow && ix >= nrow)
      movePieceToSente();
  } 
  else
    // focus (ix, iy)
    moveCursor(ix, iy);
}

function switchCase(c)
{
  if(c === c.toLowerCase())
    return c.toUpperCase();

  return c.toLowerCase();
}

/*
 * p -> +p -> P -> +P
 */ 
function nextPiece(ix, iy) {
  var index = nrow*iy + ix;
  var p = editor.ban[index]
  if(!p) return false;

  var pp;
  if(p.length >= 2)
    pp = switchCase(p[1]);
  else if(Promotable[p.toLowerCase()])
    pp = '+' + p;
  else
    pp = switchCase(p);

  editor.ban[index] = pp;
  return true;
}

function eventDoubleClick(event) {
  var svg = editor.kyokumen.svg;
  var rect = svg.getBoundingClientRect();

  var width = editor.kyokumen.width;
  var w = width/nrow;
  var margin = editor.kyokumen.margin;

  var ix = Math.floor((event.clientX - rect.left - margin[3])/w);
  var iy = Math.floor((event.clientY - rect.top  - margin[0])/w);

  if (0 <= ix && ix < nrow && 0 <= iy && iy < nrow) {
    index = iy*nrow + ix;
    if(nextPiece(ix, iy)) {
      updateKyokumenFromBan();
    }
    moveCursor(ix, iy);
  }
}

function eventSenteClick(e) {
  if (editor.focus === null) {
    editor.focus = {
      type: 'sente',
      i: Number(this.getAttribute('data-i')),
      p: this.getAttribute('data-p')
    }
  }
  else {
    moveCursor(-1, -1);
  }
}

function eventGoteClick(e) {
  if (editor.focus === null) {
    editor.focus = {
      type: 'gote',
      i: Number(this.getAttribute('data-i')),
      p: this.getAttribute('data-p')
    }
  }
  else {
    moveCursor(-1, -1);
  }
}

function updateEventListeners() {
  var svg = editor.kyokumen.svg;

  var sentePieces = svg.getElementsByClassName('sente-piece-hand');
  for(var i = 0; i<sentePieces.length; i++) {
    sentePieces[i].addEventListener('click', eventSenteClick);
  }

  var gotePieces = svg.getElementsByClassName('gote-piece-hand');
  for(i = 0; i<gotePieces.length; i++) {
    gotePieces[i].addEventListener('click', eventGoteClick);
  }
}

function refreshKyokumen() {
  sfen = constructText(editor.ban);
  editor.kyokumen.draw(sfen);

  updateEventListeners();
}

function updateKyokumenFromBan() {
  var sfenText = document.getElementById("sfen");

  sfen = constructText(editor.ban);
  sfenText.value = sfen;
  editor.kyokumen.draw(sfen);

  updateEventListeners();
}

function updateKyokumenFromText(sfen) {
  var sfenText = document.getElementById("sfen");

  if(sfen === null)
      sfen = sfenText.value;
  constructBan(sfen);

  sfen = constructText(editor.ban);
  sfenText.value = sfen;
  editor.kyokumen.draw(sfen);

  updateEventListeners();
}
/*
 * Move Cursor when an arrow key pressed
 */
function eventKeyDown(event) {
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
}

function eventTextDown(event) {
  if (event.which == 13) {
    updateKyokumenFromText(null);
  }
}

/*
 * Convert to plain lower case; +L -> l
 */
function toPlain(p) {
  const i = p[0] === '+' ? 1 : 0;

  return p[i].toLowerCase();
}

function sortPieces(a)
{
  aNum = [];

  for(var i=0; i<a.length; i++)
    aNum.push(PieceNum[a[i]]);

  aNum.sort();

  for(var i=0; i<a.length; i++)
    a[i]= PieceArray[aNum[i]];

  return a;
}


main();
}());
}




