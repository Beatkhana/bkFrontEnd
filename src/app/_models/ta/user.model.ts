export class User {
    discordId: string;
    ssId?: string;
    name: string;
    twitchName: string;
    avatar: string;
    globalRank: number;
    localRank: number;
    country: string;
    pronoun: string;
    roleIds?: number[];
    roleNames?: string[];
    region?: string;
    permissions: number;
}