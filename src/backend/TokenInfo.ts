export class TokenInfo {
    id: string;
    initiative: number;
    player: string | undefined;
    
    constructor(id: string, initiative = 0) {
        this.id = id;
        this.initiative = initiative;
    }
}