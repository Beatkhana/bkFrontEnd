import type { GameplayParameters } from "./gameplayParameters";

export interface Score {
    eventId: string;
    parameters: GameplayParameters;
    userId: number;
    username: string;
    _Score: number;
    fullCombo: boolean;
    color: string;
}