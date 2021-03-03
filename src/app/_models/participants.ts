export interface participant {
    participantId: number;
    userId: string;
    forfeit: number;
    seed: number;
    position: number;
    discordId: string;
    ssId?: string;
    name: string;
    twitchName: string;
    avatar: string;
    globalRank: number;
    localRank: number;
    country: string;
    tourneyRank: number;
    TR: number;
    pronoun: string;
    comment?: string;
}