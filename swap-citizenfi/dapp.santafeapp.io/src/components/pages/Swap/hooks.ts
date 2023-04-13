import { useMemo } from "react";
import contractData from "../../../contracts";

export const FamosoPairsMap = (pairs: Array<any>): Map<string, Array<string>> => {
    return useMemo(() => {
        let mapData: any = new Map()
        pairs.map((row: any) => {
            mapData.has(row.token0_address)? mapData.set(row.token0_address, [...mapData.get(row.token0_address), row.token1_address]) : mapData.set(row.token0_address, [row.token1_address])
            mapData.has(row.token1_address)? mapData.set(row.token1_address, [...mapData.get(row.token1_address), row.token0_address]) : mapData.set(row.token1_address, [row.token0_address])
            return true
        })
        return mapData
    }, [pairs])
}

export const FamosoTokenList = (pairs: Array<any>): Array<string> => {
    return useMemo(() => {
        let listData: any = []
        pairs.map((row: any) => {
            if(listData.indexOf(row.token1_address) < 0) listData = [...listData, row.token1_address]
            if(listData.indexOf(row.token0_address) < 0) listData = [...listData, row.token0_address]
            return true
        })
        return listData
    }, [pairs])
}

export class Graph {
    neighbours: Map<string, Array<string>>
    constructor(){
        this.neighbours = new Map<string, Array<string>>()
    }
    addEdge = (u: string, v: string) => {
        u = u.toLowerCase()
        v = v.toLowerCase()
        if(this.neighbours.has(u)){
            let tmpArr: Array<string> = this.neighbours.get(u) || []
            if(tmpArr.indexOf(v) < 0) this.neighbours.set(u, [...tmpArr, v])
        }
        else this.neighbours.set(u, [v])
    }
}

export const BFS = (graph: Graph, source: string) =>  {
    let queue = [ { vertex: source, count: 0 } ]
    let visited: any = { source: true }
    let tail = 0
    while (tail < queue.length) {
        let u = queue[tail].vertex
        let count = queue[tail++].count;  // Pop a vertex off the queue.
        let tmpArr: Array<string> = graph.neighbours.get(u) || []
        tmpArr.forEach(function (v) {
        if (!visited[v]) {
            visited[v] = true;
            queue.push({ vertex: v, count: count + 1 });
        }
      });
    }
}

export const TokensGraph = (pairs: Array<any>): Graph => {
    // return useMemo(() => {
        let tmpGraph: Graph = new Graph()
        pairs.map((row: any) => {
            tmpGraph.addEdge(row.token0.id, row.token1.id)
            tmpGraph.addEdge(row.token1.id, row.token0.id)
            return true
        })
        return tmpGraph
    // }, [pairs])
}

export const shortestPath = (pairs: Array<any>, source: string, target: string): Array<string> => {
    console.log("get shortest path", source, target, pairs)
    source = source.toLowerCase()
    target = target.toLowerCase()

    let graph: Graph = TokensGraph(pairs)
    if (source === target) {   // Delete these four lines if
      return []                 // when the source is equal to
    }                         // the target.
    let queue = [ source ]
    let visited: any = { source: true }
    let predecessor: any = {}
    let tail = 0
    while (tail < queue.length) {
        var u = queue[tail++]  // Pop a vertex off the queue.
        let neighbours = graph.neighbours.get(u) || []
        for (var i = 0; i < neighbours.length; ++i) {
            var v = neighbours[i];
            if (visited[v]) {
                continue;
            }
            visited[v] = true;
            if (v === target) {   // Check if the path is complete.
                var path = [ v ];   // If so, backtrack through the path.
                while (u !== source) {
                    path.push(u)
                    u = predecessor[u]
                }
                path.push(u);
                path.reverse();
                return path
            }
            predecessor[v] = u;
            queue.push(v);
        }
    }
    return []
}

export const isApproved = (tokenAddress: string, owner: string, spender: string):boolean => {
    console.log("isApproved", tokenAddress, owner, spender)
    const contract = new window.web3.eth.Contract(contractData.abis.ERC20, tokenAddress)
    contract.methods.allowance(owner, spender)
    .call()
    .then((res: any) => {
        console.log("allowance", res)
    })
    return false
}
