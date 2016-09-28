import sys
import re

nrow = 9

Piece = {'玉': 'k', '飛':'r', '角':'b', '金':'g', '銀':'s', '桂':'n', '香':'l', '歩':'p', '馬':'+b', '竜':'+r', 'と':'+p'}
PieceRank = {'o': 0, 'k': 1, 'r': 2, 'b': 3, 'g': 4, 's': 5, 'n':6, 'l':7, 'p':8 }
NumKanji = {'一': 1, '二': 2, '三':3, '四':4, '五':5, '六':6, '七':7, '八':8, '九':9}
NumZenkaku = {'１': 1, '２': 2, '３':3, '４':4, '５':5, '６':6, '７':7, '８':8, '９':9}


class Ban:
    def __init__(self):
        self.ban = [None]*nrow*nrow
        self.hand = ['', '']

    def __getitem__(self, key):
        """Get piece on ban
        Args:
            key = i (int): return ban[i]
            key = (ix, iy): return ban at row=ix, col=iy 
        """
        if isinstance(key, int):
            i = key
        if isinstance(key, tuple):
            i = key[0]*nrow + key[1]
        assert 0 <= i and i < nrow*nrow
        return self.ban[i]

    def __setitem__(self, key, value):
        if isinstance(key, int):
            i = key
        if isinstance(key, tuple):
            i = key[0]*nrow + key[1]
        assert 0 <= i and i < nrow*nrow
        return self.ban[i]

    def move(self, orig, dest, p):
        """ Move piece p at corrdinate orig to coordinate dest
        Args:
            orig: i, (ix, iy), or None if piece in hand is used
            dest: i or (ix, iy)
        """
        turn = (p.lower() == p)
        if orig is None:
            self.hand[turn].remove(p.lower())
        else:
            assert self.ban(orig) == p
            self.ban[orig] = None

        p_dest = self.ban[dest]
        if p_dest:
            hand[turn].append(p_dest.lower())
        self.ban[dest] = p

    def sfen(self):
        pass

class Kif:
    """Kif file reader
    """
    def __init__(self, filename):
        self.f = open(filename)
        self.header = read_header(self.f)
        self.ban = initial_ban(self.header['手合割'])
        self.r = re.compile('\w+') #([一二三四五六七八九])')
        self.dest = None

    def __iter__(self):
        for line in self.f:
            print(line)
            v = line.rstrip().split(' ')
            n = int(v[0])
            mv = v[1]

            if mv == '投了':
                break

            # destination
            i=0
            if mv[0] == '同':
                dest = self.dest
                i += 1
            else:
                ix = 9 - NumZenkaku[mv[0]]
                iy = NumKanji[mv[1]] - 1
                if ix and iy:
                    dest = (ix, iy)
                else:
                    print('Error: unable to parse', mv)
                i += 2

            # piece
            p = Piece[mv[i]]
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
            print(n, dest, orig, p)

            self.dest = dest

            yield line



def initial_ban(teai):
    ban = []

    if teai == '平手':
        for p in enumerate('lnsgkgsnl r     b ppppppppp                  PPPPPPPPP B    R LNSGKGSNL'):
            ban.append(p)
    else:
        raise ValueError()

    return ban

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

for b in Kif('../data/test.dat'):
    pass

#ban = Ban()
#ban.read('../data/test.dat')