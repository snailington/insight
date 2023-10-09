import OBR, {ContextMenuContext, Item} from "@owlbear-rodeo/sdk";
import { TokenInfo } from "./TokenInfo.ts";
import { Insight, INSIGHT_KEY, isTracked } from "./Insight.ts";

// ensure that an item's name is distinct when compared to a pool of other items
function dedupName(item: Item, others: Array<Item>, startIndex: number = 10) {
    let suffixCount = startIndex, suffix = "";
    const baseMatch = item.name.match("(.*) ([0-9A-Z]*)$");
    const baseName = baseMatch == undefined ? item.name : baseMatch[1];
    while(others.find((other) => other.id != item.id && other.name == baseName + suffix)) {
        if(suffixCount == 36) suffixCount = 360;
        suffix = " " + (suffixCount++).toString(36).toUpperCase();
    }
    item.name = baseName + suffix;
    
    if(item.metadata[INSIGHT_KEY] != undefined) {
        const info = item.metadata[INSIGHT_KEY] as TokenInfo;
        info.id = item.id;
    }
    
    return suffixCount;
}

// handler for the tracking toggle context menu button
async function onToggleTrack(context: ContextMenuContext) {
    // when all selected items are already tracked, remove tracking
    const alreadyTracked = context.items.filter(isTracked);
    if(alreadyTracked.length == context.items.length) {
        await OBR.scene.items.updateItems(alreadyTracked, (items) => {
            for(const item of items) {
                delete item.metadata[INSIGHT_KEY];
            }
        });
        return;
    }
    
    const insight = await Insight.getState();
    const otherItems = [...context.items, ...await OBR.scene.items.getItems(isTracked)];
    await OBR.scene.items.updateItems(context.items, (items) => {
        let index = 10;
        let bottomInitiative = 1 - (otherItems.length - context.items.length) * 0.0001;
        for(const item of items) {
            let info = item.metadata[INSIGHT_KEY];
            if(info == null || !(info instanceof TokenInfo)) {
                info = new TokenInfo(item.id);
                if(insight.turn > 0) {
                    info.initiative = bottomInitiative;
                    bottomInitiative -= 0.0001;
                }
                item.metadata[INSIGHT_KEY] = info;
            }
            index = dedupName(item, otherItems, index);
        }
    });
}

export async function registerTool() {
    await OBR.contextMenu.create({
        id: "moe.snail.insight/track",
        icons: [
            {
                icon: "/horse.svg",
                label: "Track/Untrack",
                filter: {
                    roles: [ "GM" ],
                    every: [
                        { key: "layer", value: "CHARACTER", coordinator: "||" },
                        { key: "layer", value: "PROP", coordinator: "||" },
                        { key: "layer", value: "MOUNT", coordinator: "||" }
                    ]
                }
            }
        ],
        onClick: onToggleTrack,
        shortcut: "i"
    });
    
    // copy deduplication handler
    OBR.scene.items.onChange(async (items) => {
        if(await OBR.player.getRole() != "GM") return;
        
        // elect a GM with the lowest connection id to handle the dedup so we don't duplicate work
        const party = await OBR.party.getPlayers();
        const connectionId = await OBR.player.getConnectionId();
        const elector = party.filter((player) => player.role == "GM" && player.connectionId < connectionId);
        if(elector.length > 0) return;
        
        const trackedItems = items.filter(isTracked);
        const dupes = trackedItems.filter((item) => trackedItems.find((other) => item.name == other.name &&
            (item.metadata[INSIGHT_KEY] as TokenInfo).id != item.id));
        if(dupes.length == 0) return;
        await OBR.scene.items.updateItems(dupes, (updates) => {
            let index = 10;
            for(const item of updates) {
               index = dedupName(item, trackedItems, index);
            } 
        });
    });
}