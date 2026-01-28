import React from 'react';
import { Player } from '../types';

interface ResourcePanelProps {
  player: Player | null;
  tick: number;
}

export const ResourcePanel: React.FC<ResourcePanelProps> = ({ player, tick }) => {
  if (!player) {
    return (
      <div style={{
        background: '#2a2a2a',
        border: '2px solid #444',
        borderRadius: '8px',
        padding: '15px',
        color: '#fff',
      }}>
        <h3 style={{ margin: '0 0 10px 0' }}>Loading...</h3>
      </div>
    );
  }

  const resources = [
    { key: 'iron', name: 'Iron', color: '#cc6633' },
    { key: 'copper', name: 'Copper', color: '#ff9933' },
    { key: 'coal', name: 'Coal', color: '#333333' },
    { key: 'steel', name: 'Steel', color: '#aaaaaa' },
  ];

  return (
    <div style={{
      background: '#2a2a2a',
      border: '2px solid #444',
      borderRadius: '8px',
      padding: '15px',
      color: '#fff',
    }}>
      <h3 style={{ margin: '0 0 15px 0', fontSize: '18px' }}>Resources</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <div style={{ fontSize: '14px', color: '#aaa', marginBottom: '5px' }}>
          Player: {player.username}
        </div>
        <div style={{ fontSize: '14px', color: '#aaa', marginBottom: '5px' }}>
          Buildings: {player.buildings_count}
        </div>
        <div style={{ fontSize: '14px', color: '#aaa' }}>
          Tick: {tick}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {resources.map(resource => {
          const amount = player.resources[resource.key] || 0;
          const production = player.production_per_minute[resource.key] || 0;
          
          return (
            <div
              key={resource.key}
              style={{
                background: '#1a1a1a',
                padding: '10px',
                borderRadius: '6px',
                borderLeft: `4px solid ${resource.color}`,
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                  {resource.name}
                </div>
                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                  {Math.floor(amount)}
                </div>
              </div>
              {production > 0 && (
                <div style={{
                  fontSize: '12px',
                  color: '#4caf50',
                  marginTop: '4px',
                }}>
                  +{production.toFixed(1)}/min
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
