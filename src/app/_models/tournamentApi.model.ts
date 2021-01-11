export interface signedUp {
    signedUp: boolean
}

export interface staff {
    discordId: string;
    ssId: string;
    name: string;
    twitchName: string;
    avatar: string;
    globalRank: number;
    localRank: number;
    country: string;
    tourneyRank: number;
    TR: number;
    pronoun: string;
    roles: role[];
}

export interface role {
    id: number, 
    role: string
}