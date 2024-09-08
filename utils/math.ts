export const fixNumber = (val: number, tofix = 2) => {
    return typeof val === 'number'? Number(val.toFixed(tofix)) : val
}

export const recv = (target: any, func: (...a:any[]) => unknown) => {
    if(Object.getPrototypeOf(target) === Array.prototype){
        return target.map((val) => {return recv(val, func)})
    }
    if(typeof target === 'object'){
        Object.keys(target).forEach((k) => {
            target[k] = recv(target[k], func)
        })
        return target
    }
    return func(target)
}

export const intersect = <T>(groupA: T[], groupB: T[], options: {oget?: (a: T) => string}) => {
    let out: [T,T][] = []
    
    const oget = options.oget ?? (a => String(a))

    if(groupB.length < 10 && groupA.length < 10){
        for(let i = 0; i < groupA.length; i++){
            for(let c = 0; c < groupB.length; c++){
                if(oget(groupA[i]) === oget(groupB[c])){
                    out.push([groupA[i],groupB[c]])
                }
            }
        }
    } else {
        let mapB = new Map<string, any>()
        for(let b = 0; b < groupB.length; b++){
            mapB.set(oget(groupB[b]), b)
        }
        for(let i = 0; i < groupA.length; i++){
            if(mapB.has(oget(groupA[i]))){
                out.push([groupA[i], mapB.get(oget(groupA[i]))])
            }
        }
    }
    return out
}