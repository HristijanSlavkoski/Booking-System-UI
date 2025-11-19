import {Game} from "./game.model";

export interface Promotion {
    id: string;
    name: string;
    description: string;
    discount: number;
    validFrom: string;
    validTo: string;
    game?: Game;
    active: boolean;
    createdAt: string;
    updatedAt?: string;
}
