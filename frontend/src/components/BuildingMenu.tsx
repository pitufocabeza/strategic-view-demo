import React from 'react';

interface BuildingMenuProps {
  selectedType: string | null;
  onSelectType: (type: string | null) => void;
}

export const BuildingMenu: React.FC<BuildingMenuProps> = ({
  selectedType,
  onSelectType,
}) => {
  const buildings = [
    { type: 'miner', name: 'Miner', cost: 'Iron: 10, Copper: 5', color: '#ffaa00' },
    { type: 'smelter', name: 'Smelter', cost: 'Iron: 20, Copper: 10', color: '#ff5555' },
    { type: 'storage', name: 'Storage', cost: 'Iron: 15, Copper: 5', color: '#5555ff' },
  ];

  return (
    <div style={{
      background: '#2a2a2a',
      border: '2px solid #444',
      borderRadius: '8px',
      padding: '15px',
      color: '#fff',
    }}>
      <h3 style={{ margin: '0 0 15px 0', fontSize: '18px' }}>Buildings</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {buildings.map(building => (
          <button
            key={building.type}
            onClick={() => onSelectType(selectedType === building.type ? null : building.type)}
            style={{
              background: selectedType === building.type ? building.color : '#444',
              border: selectedType === building.type ? '3px solid #fff' : '2px solid #666',
              borderRadius: '6px',
              padding: '12px',
              color: '#fff',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (selectedType !== building.type) {
                e.currentTarget.style.background = '#555';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedType !== building.type) {
                e.currentTarget.style.background = '#444';
              }
            }}
          >
            <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '4px' }}>
              {building.name}
            </div>
            <div style={{ fontSize: '12px', color: '#aaa' }}>
              {building.cost}
            </div>
          </button>
        ))}
      </div>
      {selectedType && (
        <div style={{
          marginTop: '15px',
          padding: '10px',
          background: '#1a1a1a',
          borderRadius: '4px',
          fontSize: '14px',
        }}>
          Click on the map to place {selectedType}
        </div>
      )}
    </div>
  );
};
