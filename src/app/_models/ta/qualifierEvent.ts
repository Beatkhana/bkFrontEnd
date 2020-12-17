import type { GameplayParameters } from "./gameplayParameters";

export interface QualifierEvent {
    eventId: string;
    name: string;
    // guild: Guild;
    // infoChannel: Channel;
    qualifierMaps: GameplayParameters[];
    sendScoresToInfoChannel: boolean;
    flags: number;
}

export enum EventSettings {
    None = 0,
    HideScoreFromPlayers = 1,
    DisableScoresaberSubmission = 2
}