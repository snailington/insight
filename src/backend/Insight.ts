import OBR, {Item, Metadata} from "@owlbear-rodeo/sdk";
import { TokenInfo } from "./TokenInfo";
import MagicCircle, {MsgRPC, RollInfo } from "magic-circle-api";

export const INSIGHT_KEY = "moe.snail.insight";

export function isTracked(item: Item) {
    return item.metadata[INSIGHT_KEY] != undefined;
}

/*
** Returns the ID of the player that owns a token.
*/
export async function getOwner(item: Item | string) {
    const resolved = typeof(item) == "string" ? (await OBR.scene.items.getItems([item]))[0] : item;

    const info = resolved.metadata[INSIGHT_KEY] as TokenInfo | undefined;
    return info?.player ?? resolved.createdUserId;
}

function initiativeSearch(insight: Insight, tokens: Item[]) {
    if(tokens.length == 0) return -1;
    
    const mapped = tokens.map((t) => { return {item: t, info: t.metadata[INSIGHT_KEY] as TokenInfo}; })
        .sort((a, b) => { return b.info.initiative - a.info.initiative; });
    let index = 0;
    for(; index < mapped.length; index++) {
        if(mapped[index].info.initiative < insight.currentCount) break;
    }
    if(index == mapped.length) {
        index = 0;
        insight.turn++;
    }

    const {item, info} = mapped[index];
    insight.currentId = info.id;
    insight.currentPlayer = info.player ?? item.createdUserId;
    insight.currentCount = info.initiative;
    insight.nextId = mapped[(index + 1) % mapped.length].info.id;
}

export async function advanceTurn() {
    const insight = await Insight.getState();
    const tokens = await Insight.getTokens();
    
    if(insight.turn == 0) {
        const pending = tokens.filter((token) => (token.metadata[INSIGHT_KEY] as TokenInfo).initiative <= 0);
        if(pending.length > 0) {
            const ids = new Array<string>();
            const names = new Array<string>();
            
            for(const token of pending) {
                ids.push(token.id);
                names.push(token.name);
            }
            
            await rollInitiative(ids, names, 20);
            await advanceTurn();
            return;
        }
        insight.turn = 1;
    }
    
    initiativeSearch(insight, tokens);
    
    const update: Metadata = {};
    update[INSIGHT_KEY] = insight;
    await OBR.scene.setMetadata(update);
}

export async function rollInitiative(id: string | string[], name: string | string[], d: number) {
    const ids = id instanceof Array ? id : [id];
    const names = name instanceof Array ? name : [name];
    
    const values = new Array<number>();
    for(let i = 0; i < ids.length; i++) values.push(Math.ceil(Math.random() * d));

    await MagicCircle.sendMessage(<MsgRPC>{
        cmd: "msg",
        type: "dice",
        author: names.length == 1 ? names[0] : null,
        text: names.length == 1 ? "Initiative" : "Initiative for: " + names.join(", "),
        metadata: <RollInfo>{
            kind: "moe.snail.insight/initiative",
            dice: new Array<number>(ids.length).fill(d),
            results: values,
            total: values.length == 1 ? values[0] : null
        }
    }, OBR.player.id);

    const tokens = await Insight.getTokens();
    await OBR.scene.items.updateItems(ids, (items) => {
        for(const item of items) {
            const here = (item.metadata[INSIGHT_KEY] as TokenInfo);
            const value = values.shift() ?? 0;
            do {
                here.initiative = value + Math.random();
            } while(tokens.find((other) => here.initiative == (other.metadata[INSIGHT_KEY] as TokenInfo).initiative));
        }
    });
}

export async function resetInsight() {
    const update: Metadata = {};
    update[INSIGHT_KEY] = new Insight();
    await OBR.scene.setMetadata(update);
}

export class Insight {
    turn: number = 0;
    currentCount: number = 20000;
    currentId: string = "";
    nextId: string = "";
    currentPlayer: string = "";
    
    static async getState() {
        const metadata = await OBR.scene.getMetadata();
        if(metadata[INSIGHT_KEY] != undefined) {
            return metadata[INSIGHT_KEY] as Insight;
        } else {
            const update: Partial<Metadata> = {};
            update[INSIGHT_KEY] = new Insight();
            await OBR.scene.setMetadata(update);
        }
        
        return new Insight();
    }
    
    static async getTokens() {
        return await OBR.scene.items.getItems(isTracked);
    }
    
    static findPlayertokens(name: string, id: string | undefined = undefined, items: Item[]) {
        const creatorMatches = items.filter((item) => item.createdUserId == id);
        if(creatorMatches.length == 1) return creatorMatches;

        return items.filter((item) => item.name == name || item.name == id);
    }
    
    static async updateTokens(updates: Update[]) {
        const trackedItems = await Insight.getTokens();
        for(const update of updates) {
            const matches = Insight.findPlayertokens(update.name, update.player, trackedItems);
            if(matches.length == 0) continue;
            await OBR.scene.items.updateItems(matches, (items) => {
                for(const item of items) {
                    const info = item.metadata[INSIGHT_KEY] as TokenInfo;

                    if(update.data.initiative != undefined) info.initiative = update.data.initiative;
                } 
            });
        }

        return trackedItems.length;
    }
}

export class Update {
    name: string;
    player: string | undefined;
    data: Partial<TokenInfo> = {};

    constructor(name: string, player: string | undefined = undefined) {
        this.name = name;
        this.player = player;
    }
}