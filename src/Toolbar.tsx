import OBR from "@owlbear-rodeo/sdk";
import {Insight, advanceTurn, resetInsight} from "./backend/Insight.ts";

function Toolbar({insight, isGm}: {insight: Insight, isGm: boolean}) {
    return (
        <div>
            {isGm || insight.currentPlayer == OBR.player.id ? <button onClick={advanceTurn}>Next Turn</button> : ""}
            {isGm ? <button onClick={() => resetInsight()}>Clear</button> : ""}
        </div>
    )
}

export default Toolbar;