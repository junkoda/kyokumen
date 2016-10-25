from collections import defaultdict
import glob
import json
import kif2sfen as k

vertices = defaultdict(int) # verteces[kyokumen] = number of games
edges = set()               # set of all moves


def read(filename):
    sfen_prev = None
    vertices[sfen_prev] += 1

    for i,mv,b in k.Kif(filename):
        sfen = b.sfen(num=1)
        vertices[sfen] += 1
        if sfen_prev:
            edges.add((sfen_prev, sfen))
        sfen_prev = sfen

for filename in glob.glob('../data/*/*.kif'):
    read(filename)

nodes = []          # output nodes
links = []          # output links
node_set = set()


#for sfen, n in vertices.items():
#   if n > 1:
#        nodes.append({'id': sfen, 'group':1, ''})
        #print(sfen, n)

search_verte

for e in edges:
    if vertices[e[0]] > 1 or vertices[e[1]] > 1:
        node_set.add(e[0])
        node_set.add(e[1])
        links.append({'source': e[0], 'target': e[1], 'value':1})


for v in node_set:
    nodes.append({'id': v, 'group':1, 'vol':vertices[v]})

data = {'nodes': nodes, 'links': links}
with open('graph.json', 'w') as f:
    json.dump(data, f, ensure_ascii=False)
