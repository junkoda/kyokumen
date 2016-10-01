#import re

nrow = 9

Turn = ['b', 'w']
Koma = ['☗', '☖']
Piece = {'玉': 'k', '飛':'r', '角':'b', '金':'g', '銀':'s', '桂':'n', '香':'l', '歩':'p', '竜':'+r', '龍':'+r', '馬':'+b', '圭':'+n', '杏':'+l', 'と':'+p'}
PieceRank = {'o': 0, 'k': 1, 'r': 2, 'b': 3, 'g': 4, 's': 5, 'n':6, 'l':7, 'p':8 }
NumKanji = {'一': 1, '二': 2, '三':3, '四':4, '五':5, '六':6, '七':7, '八':8, '九':9}
NumZenkaku = {'１': 1, '２': 2, '３':3, '４':4, '５':5, '６':6, '７':7, '８':8, '９':9}

def piece_rank(p):
    return PieceRank[p]

def piece_raw(p):
    return p.lower()[-1]

class Ban:
    def __init__(self, teai):
        self.hand = [[], []]
        self.teban = 'b'
        self.made = ''
        self.n = 0
        if teai:
            self.ban = initial_ban(teai)
        else:
            self.ban = ['']*nrow*nrow

        assert len(self.ban) == nrow*nrow


    def __getitem__(self, key):
        """Get piece on ban
        Args:
            key = i (int): return ban[i]
            key = (ix, iy): return ban at row=ix, col=iy 
        """
        if isinstance(key, int):
            i = key
        if isinstance(key, tuple):
            i = key[1]*nrow + key[0]
        assert 0 <= i and i < nrow*nrow
        return self.ban[i]

    def __repr__(self):
        return "Ban " + self.sfen()


    def __setitem__(self, key, value):
        if isinstance(key, int):
            i = key
        if isinstance(key, tuple):
            i = key[1]*nrow + key[0]
        assert 0 <= i and i < nrow*nrow
        self.ban[i]= value

    def move(self, orig, dest, p, promote):
        """ Move piece p at corrdinate orig to coordinate dest
        Args:
            orig: i, (ix, iy), or None if piece in hand is used
            dest: i or (ix, iy)
        """
        turn = (p.lower() == p)  # 0: sente, 1: gote
        self.n += 1
        self.teban = Turn[not turn]

        if orig is None:
            self.hand[turn].remove(p.lower())
        else:
            assert self[orig] == p
            self[orig] = ''

        p_dest = self[dest]
        if p_dest:
            self.hand[turn].append(piece_raw(p_dest))

        if promote:
            self[dest] = '+' + p
        else:
            self[dest] = p

        self.made = str(9 - dest[0]) + str(dest[1] + 1)


    def sfen(self, **kwargs):
        """return SFEN representation"""
        s = sfen_board(self.ban)
        s += ' ' + self.teban + ' '

        num = kwargs.get('num', None)

        if self.hand[0] or self.hand[1]:
            s += sfen_hand(self.hand[0]).upper()
            s += sfen_hand(self.hand[1])
        else:
            s += '-'

        if num is None:
            s += ' ' + str(self.n)
        else:
            s += ' ' + str(num)
        
        return s


class Kif:
    """Kif file reader
    """
    def __init__(self, filename):
        self.f = open(filename)
        self.header = read_header(self.f)
        self.ban = Ban(self.header['手合割'])
        self.dest = None

    def __iter__(self):
        yield (0, '初期盤面', self.ban)

        for line in self.f:
            if line[0] == '#' or line[0] == '*':
                continue;
            #print(line)

            v = line.strip().split(' ')
            n = int(v[0])
            mv = v[1]

            if mv == '投了':
                break

            # destination
            i=0
            if mv[0] == '同':
                dest = self.dest
                i += 1
                if mv[i] == '\u3000':
                    i += 1

            else:
                ix = 9 - NumZenkaku[mv[0]]
                iy = NumKanji[mv[1]] - 1
                assert 0 <= ix and ix < 9
                assert 0 <= iy and ix < 9
                dest = (ix, iy)
                i += 2

            # piece
            p = ''
            if mv[i] == '成': # 成銀、成桂、成香
                p = '+'
                i += 1
            p += Piece[mv[i]]
            i += 1

            #
            promote = False
            if mv[i] == '成':
                promote = True
                i += 1

            if n % 2 == 1:
                p = p.upper()

            # origin
            if mv[i] == '打':
                orig = None
                i += 1
            else:
                assert mv[i] == '('
                ix = 9 - int(mv[i+1])
                iy = int(mv[i+2]) - 1
                assert mv[i+3] == ')'
                orig = (ix, iy)

            #n = v[0]
            self.ban.move(orig, dest, p, promote)

            self.dest = dest

            yield (n, Koma[not (n % 2)] + mv, self.ban)



def initial_ban(teai):
    ban = []

    if teai == '平手':
        for p in 'lnsgkgsnl r     b ppppppppp                           PPPPPPPPP B     R LNSGKGSNL':
            ban.append(p.strip())
    else:
        raise ValueError()

    return ban

def sfen_board(ban):
    """Convert ban (nrow*nrow array) to sfen string
    """
    s = ''
    num = 0
    for iy in range(nrow):
        for ix in range(nrow):
            i = iy*nrow + ix
            if ban[i]:
                if num:
                    s += str(num)
                    num = 0
                s += ban[i]
            else:
                num += 1
        if iy < 8:
            if num:
                s += str(num)
                num = 0
            s += '/'
    return s

def sfen_hand(hand):
    hand.sort(key=piece_rank)
    s=''
    for h in hand:
        s += h
    return s

def read_header(f):
    """Read header of kif file
    key：value


    Args:
        f: file object
    Returns:
        dictionary of header key - value
    """
    header = {}

    for line in f:
        if line[0:2] == '手数':
            break
        h = line.rstrip().split('：')
        if h and len(h) == 2:
            header[h[0]] = h[1]

    return header;

def main():
    import sys
    if len(sys.argv) == 1:
        print('python3 kif2sfen filename.kif')
        sys.exit(0)

    filename = sys.argv[-1]
    for i,mv,b in Kif(filename):
        print('<span class="mv" data-made="' + b.made + '" data-sfen="' + b.sfen() + '">' + mv + '</span>')

if __name__ == "__main__":
    main()

