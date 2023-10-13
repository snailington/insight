import { Insight } from "./backend/Insight";
import "./StatusLine.css";

function StatusLine({insight} : {insight: Insight}) {
    const content: JSX.Element[] = [];
    
    if(insight.turn == 0) {
        content.push(<span>Roll for initiative</span>);
    } else {
        content.push(<span className="turn">Turn {insight.turn}</span>);
    }
    
    // todo: append alerts to indicate player's turn is next or current
    
    return (
        <div className="status">
            {content}
        </div>
    );
}

export default StatusLine;