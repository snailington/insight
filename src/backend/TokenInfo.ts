export class TokenInfo {
    id: string;
    initiative: number;
    
    constructor(id: string, initiative = 0) {
        this.id = id;
        this.initiative = initiative;
    }
}