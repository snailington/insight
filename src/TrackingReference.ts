import OBR, {Item} from "@owlbear-rodeo/sdk";
import {TokenInfo} from "./backend/TokenInfo.ts";
import MagicCircle, {MsgRPC, RollInfo } from "magic-circle-api";
import {INSIGHT_KEY, Insight, rollInitiative} from "./backend/Insight.ts";

export class TrackingReference {
    name: string;
    data: TokenInfo;
    
    constructor(item: Item) {
        this.name = item.name;
        
        this.data = item.metadata[INSIGHT_KEY] as TokenInfo;
    }
    
    async rollInitiative() {
        await rollInitiative(this.data.id, this.name, 20);
        /*const value = Math.ceil(Math.random() * 20);
        
        await MagicCircle.sendMessage(<MsgRPC>{
            cmd: "msg",
            type: "dice",
            author: this.name,
            text: "Initiative",
            metadata: <RollInfo>{
                kind: "moe.snail.insight/initiative",
                dice: [20],
                results: [value],
                total: value
            }
        }, OBR.player.id);
        
        const tokens = await Insight.getTokens();
        await OBR.scene.items.updateItems([this.data.id], (items) => {
            console.log(items);
            for(const item of items) {
                const here = (item.metadata[INSIGHT_KEY] as TokenInfo);
                do {
                    here.initiative = value + Math.random();
                    console.log("track ref", here.initiative);
                } while(tokens.find((other) => here.initiative == (other.metadata[INSIGHT_KEY] as TokenInfo).initiative));
            }
        });
        */
    }
}