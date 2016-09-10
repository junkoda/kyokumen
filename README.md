局面.js
===========
ウェブで将棋の棋譜を語るための JavaScript ライブラリ
[https://junkoda.github.io/kyokumen/](https://junkoda.github.io/kyokumen/)

## できること

- SFEN (Shogi Forsyth-Edwards Notation) を与えて、局面図を作る
- 棋譜にマウスカーソルをあわせると局面図を更新する



## 使いかた

### 局面図を作る

```html
<figure id="fig1" class="kyokumen" data-sente="先手" data-gote="後手" data-sfen="lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b 1"></figure>
```

### 局面図を変更する

```html
<span class="mv" data-board="fig1" data-sfen="lnsgkgsnl/1r5b1/pppppp1pp/6p2/9/2P6/PP1PPPPPP/1B5R1/LNSGKGSNL b 2">☗７六歩</span>
```

data-board は変更したい図の `id`。

### 例

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <link rel="stylesheet" type="text/css" href="https://junkoda.github.io/kyokumen/0/kyokumen.css">
  <title>例</title>
</head>
<body>
<script src="https://junkoda.github.io/kyokumen/0/kyokumen.js"></script>

<figure id="board1" class="kyokumen" data-sente="先手" data-gote="後手"
     data-sfen="8l/1l+R2P3/p2pBG1pp/kps1p4/Nn1P2G2/P1P1P2PP/1PS6/1KSG3+r1/LN2+p3L w Sbgn3p 124">
</figure>

<p><span class="mv" data-board="fig1" data-sfen="lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b 1">初手</span></p>

</body>
</html>
```

## Updates

開発状況は

- [twitter/kyokumen_web](https://twitter.com/kyokumen_web)
- [はてなブログ](http://junkoda.hatenablog.jp)

に書いています。バグ報告・質問など気軽にしてください。
