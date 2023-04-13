import { validateWalletAddres } from ".";
import { famosoSwapGraphEndPoint } from "../data"

export const getFamosoPairsFromGraph = (connectedNetwork: number) => {
    const query = {
        query: `     
            query pairs($limit: Int!) {
                pairs {
                    id
                    token0 {
                      id
                      name
                      symbol
                    }
                    token1 {
                      id
                      name
                      symbol
                    }
                    totalSupply
                    volumeUSD
                }
            }          
        `,
        variables: {
            limit: 5
        },
    }
    return fetch(famosoSwapGraphEndPoint[connectedNetwork], {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(query),
    })
    .then((res) => res.json())
    .then((result) => {
        return result.data.pairs
    })
    .catch((err: any) => {
        // console.log("get created famoso pairs", err)
        // return getFamosoPairsFromGraph(connectedNetwork)
    })
}

export const getTokenURI = (connectedNetwork: number, token: string) => {
    // console.log("get Token uri", connectedNetwork, token)
    if(!validateWalletAddres(token)) return ""
    // return useMemo(() => {
        return "/assets/tokens/" + connectedNetwork + "/" + token.toLowerCase() + ".png"
    // }, [connectedNetwork, token])
}
