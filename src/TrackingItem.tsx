import "./TrackingItem.css"
import { TrackingReference } from "./TrackingReference.ts";
import { Insight } from "./backend/Insight.ts";

function TrackingItem({item, isGm, insight}: {item: TrackingReference, isGm: boolean, insight: Insight}) {
    return (
        <div className={ "tracked-item" + (insight.currentId == item.data.id ? " highlighted" : "")}>
            <div className="name">{item.name}</div>
            
            { item.data.initiative >= 1 ?
                <div className="initiative">
                    {item.data.initiative != undefined ? Math.floor(item.data.initiative) : ""}
                </div> :
                <></>
            }

            { isGm && item.data.initiative == 0 ?
                <button onClick={async () => await item.rollInitiative()}>Roll</button> :
                <></>
            }
        </div>
    );
}

export default TrackingItem;