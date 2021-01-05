export interface userAPI {
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
    tournaments: string[];
    badges: badge[];
}

export interface badge {
    id: number
    image: string
    description: string
}