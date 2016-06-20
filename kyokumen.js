const nrow = 9;
const Piece = { l:"香", n:"桂", s:"銀", g:"金", k:"玉", r:"飛", b:"角", p:"歩"}
window.addEventListener("load", eventWindowLoaded, false);

console.log("hello");

function eventWindowLoaded() {
  drawKyokumens();
}

/**
 * Find all tags with class="kyokumen" and the kyokumens
 */
function drawKyokumens() {
  kyokumens = document.getElementsByClassName("kyokumen");
  console.log(kyokumens.length)
  console.log("first kyokumen")
  drawKyokumen(kyokumens[0])
  /*console.log(kyokumens[0])
  for(var kyokumen in kyokumens) {
    console.log("each kyokumen")
    console.log(kyokumen)
    drawKyokumen(kyokumen)
  }
  */
}

/**
  Args: kyokumen is a <svg> tag with an sfen attribute
 */
function drawKyokumen(kyokumen) {
  width=350.0

  drawBan(kyokumen, width);        // Lines
  drawNumbersCol(kyokumen, width); // ９、８、･･･、１
  drawNumbersRow(kyokumen, width); // 一、二、･･･、九
  drawPieces(kyokumen, width);
}

/**
 * Draw a square and lines for shogi-ban
 */
function drawBan(kyokumen, width) {
  /*var width = document.defaultView.getComputedStyle(kyokumen, null).width*/
  /*  var width = kyokumen.getAttribute("width"); */

  console.log(width)
  kyokumen.setAttribute("height", width)

  var rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  rect.setAttribute("class", "ban");
  rect.setAttribute("x", "0");
  rect.setAttribute("y", "0");
  rect.setAttribute("width", width);
  rect.setAttribute("height", width);
  kyokumen.appendChild(rect);

  w = width / 9.0

  // 横線
  for(var i=1; i<9; i++) {
    var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("class", "sen");
    line.setAttribute("x1", "0");
    line.setAttribute("x2", width);
    line.setAttribute("y1", w*i);
    line.setAttribute("y2", w*i)
    kyokumen.appendChild(line);
  }

  // 縦線
  for(var i=1; i<9; i++) {
    var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", w*i);
    line.setAttribute("x2", w*i);
    line.setAttribute("class", "sen");
    line.setAttribute("y1", "0");
    line.setAttribute("y2", width);
    kyokumen.appendChild(line);
  }

  /*
  var piece = document.createElementNS("http://www.w3.org/2000/svg", "text");
  piece.setAttribute("class", "koma");
  piece.setAttribute("x", "25.5");
  piece.setAttribute("y", "26");
  piece.setAttribute("text-anchor", "middle");
  piece.setAttribute("dominant-baseline", "middle") ;
  var text = document.createTextNode("歩");
  piece.appendChild(text);
  kyokumen.appendChild(piece);
  */
}

/**
  *  Draw 9 ... 1 on top of the board
  */
function drawNumbersCol(kyokumen, width) {
  var w = width/nrow;
  label = ["９", "８", "７", "６", "５", "４", "３", "２", "１"];

  for(var i=0; i<nrow; i++) {
    var num = document.createElementNS("http://www.w3.org/2000/svg", "text");
    num.setAttribute("class", "num");
    num.setAttribute("x", w*(i + 0.5));
    num.setAttribute("y", -w*0.2);

    num.setAttribute("text-anchor", "middle");
    num.setAttribute("dominant-baseline", "bottom") ;
    var text = document.createTextNode(label[i]);
    num.appendChild(text);
    kyokumen.appendChild(num);
  }
}

/**
  *  Draw 一、二、･･･、九 on left margin
  */
function drawNumbersRow(kyokumen, width) {
  var w = width/nrow;
  label = ["一", "二", "三", "四", "五", "六", "七", "八", "九"];

  for(var i=0; i<nrow; i++) {
    var num = document.createElementNS("http://www.w3.org/2000/svg", "text");
    num.setAttribute("class", "num");
    num.setAttribute("x", width + w*0.2);
    num.setAttribute("y", w*(i + 0.5));

    num.setAttribute("text-anchor", "left");
    num.setAttribute("dominant-baseline", "middle") ;
    var text = document.createTextNode(label[i]);
    num.appendChild(text);
    kyokumen.appendChild(num);
  }
}

function drawPieces(kyokumen, width) {
  var w = width / nrow;
  sfen = kyokumen.getAttribute("sfen");
  console.log(sfen);
  n = sfen.length;
  ix = 0;
  iy = 0;

  for(i=0; i<n; i++) {
    p = sfen.charAt(i);
    number = Number(p)
    if(p == '/') {
      ix = 0;
      iy++; 
    }
    else if(number) {
      ix += number;
    }
    else {
      drawPiece(kyokumen, w, ix, iy, p);
      ix++;
    }
  }
}

/**
  * Draw one piece
  * Args:
        w:  width / nrow
        ix: 0...9, column index
        iy: 0...9, row index
        p:  sfen character p,P,...
*/
function drawPiece(kyokumen, w, ix, iy, p) {
  pieceText = Piece[p.toLowerCase()]

  if(pieceText) {
    var x = w*(ix + 0.5);
    var y = w*(iy + 0.5);
    var piece = document.createElementNS("http://www.w3.org/2000/svg", "text");
    piece.setAttribute("class", "koma");
    piece.setAttribute("x", x);
    piece.setAttribute("y", y);

    if(isGote(p)) {
      var rotation = "rotate(180 " + String(x) + " " + String(y) + ")";
      piece.setAttribute("transform", rotation);
    }

    piece.setAttribute("text-anchor", "middle");
    piece.setAttribute("dominant-baseline", "middle") ;
    var text = document.createTextNode(pieceText);

    piece.appendChild(text);
    kyokumen.appendChild(piece);
  }
  else {
    console.log("Error: unknown piece, " + p)
  }


  /*num.appendChild(text);
  kyokumen.appendChild(num);
  */
}

function isGote(character) {
  return (character == character.toLowerCase())
}


