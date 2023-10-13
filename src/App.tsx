import './App.css'
import TrackingList from './TrackingList.tsx'
import OwlbearTheme from './OwlbearTheme.tsx'
import Toolbar from './Toolbar.tsx'
import { useEffect, useState } from 'react';
import {INSIGHT_KEY, Insight } from './backend/Insight.ts';
import OBR from '@owlbear-rodeo/sdk';
import StatusLine from './StatusLine.tsx';

function App() {
  const [isGm, setIsGm] = useState(false);
  const [insight, setInsight] = useState(new Insight());
  
  useEffect(() => {
    Insight.getState().then((state) => setInsight(state));
    OBR.player.getRole().then((role) => setIsGm(role == "GM"));
  }, [])
  
  useEffect(() => OBR.player.onChange((player) => {
    setIsGm(player.role == "GM");
  }), [isGm]);
  
  useEffect(() => OBR.scene.onMetadataChange((metadata) => {
    setInsight((metadata[INSIGHT_KEY] as Insight) ?? new Insight());
  }), []);
  
  return (
    <OwlbearTheme className="app-container">
      <Toolbar insight={insight} isGm={isGm} />
      <StatusLine insight={insight} isGm={isGm} />
      <TrackingList insight={insight} isGm={isGm} />
    </OwlbearTheme>
  )
}

export default App
