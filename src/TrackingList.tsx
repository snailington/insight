import {Dispatch, useEffect, useState} from 'react'
import MagicCircle, {Message} from 'magic-circle-api'
import OBR, { Item } from '@owlbear-rodeo/sdk';
import TrackingItem from './TrackingItem.tsx';
import {TrackingReference} from "./TrackingReference.ts";
import {Insight, isTracked, Update} from "./backend/Insight.ts";

function TrackingList({isGm, insight}: {isGm: boolean, insight: Insight}) {
    const [tokens, setTokens] = useState(() => new Array<TrackingReference>());
    const [lastMessage, setLastMessage]: [Message | undefined, Dispatch<Message | undefined>] = useState();

    async function updateTokens(items: Item[]) {
        const role = await OBR.player.getRole();
        const filtered = items.filter(isTracked)
            .filter((item) => role == "GM" ? true : item.visible);

        setTokens(filtered.map((item) => new TrackingReference(item)));
    }
    
    useEffect(() => {
        OBR.scene.items.getItems().then((items) => updateTokens(items));
    }, []);
    
    useEffect(() => OBR.scene.items.onChange(async (items) => {
        await updateTokens(items);
    }), [tokens]);
    
    useEffect(() => MagicCircle.onMessage(lastMessage ?? null, async (msgs) => {
        if(msgs.length == 0) return;
        if(lastMessage == null) {
            setLastMessage(msgs[msgs.length - 1]);
            return;
        }

        const batch = new Array<Update>();

        let lMsg: Message = lastMessage;
        for(const msg of msgs) {
            const record = new Update(msg.author, msg.player);
            if(msg.type == "dice" && msg.metadata.kind == "initiative") {
                record.data.initiative = msg.metadata.total;
                batch.push(record);
            }
            lMsg = msg;
        }

        setLastMessage(lMsg);
        if(batch.length > 0) await Insight.updateTokens(batch);
    }), [lastMessage]);
    
    return (
        <div className="tracking-list">
            {tokens.sort((a, b) => a.data.initiative >= 10000 || b.data.initiative >= 10000 ||
                a.data.initiative == b.data.initiative ?
                a.name.localeCompare(b.name) :
                b.data.initiative - a.data.initiative)
                    .map((t) => <TrackingItem key={t.data.id} item={t} isGm={isGm} insight={insight} />)}
        </div>
    );
}

export default TrackingList;