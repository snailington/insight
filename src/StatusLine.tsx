import {useEffect, useState } from "react";
import {getOwner, Insight} from "./backend/Insight";
import "./StatusLine.css";
import OBR from "@owlbear-rodeo/sdk";

function StatusLine({insight, isGm} : {insight: Insight, isGm: boolean}) {
    const [playerId, setPlayerId] = useState("");
    const [nextPlayerId, setNextPlayerId] = useState("");
    const content: JSX.Element[] = [];
    
    useEffect(() => {
        getOwner(insight.currentId).then(async (owner) => {
            if(!isGm) {
                if(OBR.player.id == owner) {
                    await OBR.action.setBadgeBackgroundColor("green");
                    await OBR.action.setBadgeText("!");
                    await OBR.action.setTitle("Your Turn");
                } else {
                    await OBR.action.setBadgeText(undefined);
                    await OBR.action.setTitle("Insight");
                }
            }
            setPlayerId(owner);

            getOwner(insight.nextId).then(async(nextOwner) => {
                if(!isGm && OBR.player.id == nextOwner && OBR.player.id != owner) {
                    await OBR.action.setBadgeBackgroundColor("yellow");
                    await OBR.action.setBadgeText("!");
                    await OBR.action.setTitle("You're Up Next");
                }

                setNextPlayerId(nextOwner);
            });
        });
    }, [isGm, insight]);

    if(insight.turn == 0) {
        content.push(<span key="blank">Roll for initiative</span>);
    } else {
        content.push(<span key="turn" className="turn">Turn {insight.turn}</span>);

        if(playerId == OBR.player.id) {
            content.push(<span key="yourturn" className="alert">Your Turn</span>)
        } else if(nextPlayerId == OBR.player.id) {
            content.push(<span key="yourturn" className="alert">You're Up Next</span>);
        }
    }
    
    return (
        <div className="status">
            {content}
        </div>
    );
}

export default StatusLine;