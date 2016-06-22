局面.js
===========
ウェブで将棋の棋譜を語るための JavaScript ライブラリ

## できること

- SFEN (Shogi Forsyth-Edwards Notation) を与えて、局面図を作る
- 棋譜にマウスカーソルをあわせると局面図を更新する

## 使いかた

### 局面図を作る

```html
<svg id="board1" class="kyokumen" sente="☗先手" gote="☖後手" sfen="...">
```

### 局面図を変更する

```html
<span class="mv" board="board1" sfen="...">☗７六歩</span>
```

board は変更したい図の `id` です。

### 例

```html
<!DOCTYPE>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <link rel="stylesheet" type="text/css" href="https://raw.githubusercontent.com/junkoda/kyokumen/master/kyokumen.css">
  <title>例</title>
</head>
<body>
<script src="https://raw.githubusercontent.com/junkoda/kyokumen/master/kyokumen.js"></script>

<svg id="board1" class="kyokumen" sente="☗先手" gote="☖後手"
     sfen="8l/1l+R2P3/p2pBG1pp/kps1p4/Nn1P2G2/P1P1P2PP/1PS6/1KSG3+r1/LN2+p3L w Sbgn3p 124">
</svg>

<p><span class="mv" board="board1" sfen="lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b">初手</span></p>

</body>
</html>
```

## 既知の問題

* Firefox では持ち駒が表示されない・駒がずれる
* Safari では持ち駒の上の駒記号が回転してる

少なくとも最新の Firefox/Chrome/Safari で使えるよう調整中です。


## 参加

オープンソースへの参加を歓迎します。

* Javascript のコードレビュー（これは Javascript の習作につき）
* デザインセンスのある人による CSS
* 問題の指摘 （上のメニュー issues から）
* より使いやすくするツール作成

などなど
