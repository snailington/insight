import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import WaitForOwlbear from "./WaitForOwlbear.tsx";
import OBR from '@owlbear-rodeo/sdk';
import {registerTool} from "./backend/tool.ts";

OBR.onReady(async () => {
  await registerTool();
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <WaitForOwlbear>
    <App />
  </WaitForOwlbear>,
)
