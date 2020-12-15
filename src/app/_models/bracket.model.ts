export interface bracketMatch {
    id: string,
    status: string,
    matchNum: number,
    round: number,
    p1: matchPlayer,
    p2: matchPlayer,
    bye: number
}

export interface matchPlayer {
    id: string,
    ssId: string,
    name: string,
    avatar: string,
    score: number,
    country: string,
    seed: number,
    forfeit: boolean,
    twitch: string,
    rank: number
}

export interface coordinator {
    id: string,
    name: string
    avatar: string
}