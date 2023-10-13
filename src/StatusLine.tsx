import {useEffect, useState } from "react";
import {getOwner, Insight} from "./backend/Insight";
import "./StatusLine.css";
import OBR from "@owlbear-rodeo/sdk";

function StatusLine({insight} : {insight: Insight}) {
    const [playerId, setPlayerId] = useState("");
    const content: JSX.Element[] = [];
    
    useEffect(() => {
        getOwner(insight.currentId).then(async (owner) => {
            if(OBR.player.id == owner) {
                await OBR.action.setBadgeText("!");
            } else {
                await OBR.action.setBadgeText(undefined);
            }
            setPlayerId(owner);
        });
    }, [insight, playerId]);

    if(insight.turn == 0) {
        content.push(<span key="blank">Roll for initiative</span>);
    } else {
        content.push(<span key="turn" className="turn">Turn {insight.turn}</span>);
    }

    if(playerId == OBR.player.id) {
        content.push(<span key="yourturn" className="alert">Your Turn</span>)
    }
    
    return (
        <div className="status">
            {content}
        </div>
    );
}

export default StatusLine;