import { ITournament } from './tournament';

export declare namespace IUser {
    export interface Role {
        roleId: number;
        roleName: string;
    }

    export interface Badge {
        id: number;
        image: string;
        description: string;
    }

    export interface User {
        discordId: string;
        ssId: string;
        name: string;
        twitchName: string;
        avatar: string;
        globalRank: number;
        localRank: number;
        country: string;
        pronoun: string;
        roles: Role[];
        tournaments: ITournament.Tournament[];
        badges: Badge[];
    }
}
