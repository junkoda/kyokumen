from collections import defaultdict
import glob
import json
import kif2sfen as k

vertices = defaultdict(int)
edges = set()


def read(filename):
    sfen_prev = None #'lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b 1'
    vertices[sfen_prev] += 1

    for i,mv,b in k.Kif(filename):
        sfen = b.sfen(num=1)
        vertices[sfen] += 1
        if sfen_prev:
            edges.add((sfen_prev, sfen))
        sfen_prev = sfen

for filename in glob.glob('../data/a/*.kif'):
    read(filename)

nodes = []
node_set = set()
links = []

for sfen, n in vertices.items():
    if n > 1:
        nodes.append({'id': sfen, 'group':1})
        #print(sfen, n)

for e in edges:
    if vertices[e[0]] > 1 and vertices[e[1]] > 1:
        print(e[0], e[1])
        node_set.add(e[0])
        node_set.add(e[1])
        links.append({'source': e[0], 'target': e[1], 'value':1})


#for v in node_set:
#    nodes.append(v)

data = {'nodes': nodes, 'links': links}
with open('graph.json', 'w') as f:
    json.dump(data, f, ensure_ascii=False)
