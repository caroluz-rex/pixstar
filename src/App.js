// src/App.js
import React, { useState } from 'react';
import Canvas from './components/Canvas';
import ColorPicker from './components/ColorPicker';
import TeamList from './components/TeamList';
import CreateTeamButton from './components/CreateTeamButton';
import WalletConnection from './components/WalletConnection';
import CoordinatesDisplay from './components/CoordinatesDisplay';
import { WebSocketProvider } from './components/WebSocketProvider';

const App = () => {
    const [selectedColor, setSelectedColor] = useState('#000000');
    const [walletAddress, setWalletAddress] = useState(null);
    const [cursorPosition, setCursorPosition] = useState({ x: null, y: null });
    const [pixels, setPixels] = useState({});

    // Обработчик обновлений от WebSocket
    const handleUpdate = (pixel) => {
        setPixels((prev) => ({
            ...prev,
            [`${pixel.x}-${pixel.y}`]: {
                x: pixel.x,
                y: pixel.y,
                color: pixel.color,
            },
        }));
    };

    return (
        <WebSocketProvider onUpdate={handleUpdate}>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', position: 'relative' }}>
                <div style={{ display: 'flex', flex: 1 }}>
                    <div style={{ flex: 3, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
                        {/* Блок с Canvas и CoordinatesDisplay */}
                        <div style={{ flex: 1, position: 'relative' }}>
                            <Canvas
                                selectedColor={selectedColor}
                                setCursorPosition={setCursorPosition}
                                pixels={pixels}
                            />
                            {/* CoordinatesDisplay теперь внутри блока с Canvas */}
                            <CoordinatesDisplay cursorPosition={cursorPosition} />
                        </div>
                        <ColorPicker selectedColor={selectedColor} setSelectedColor={setSelectedColor} />
                    </div>
                    <div style={{ flex: 1, padding: '20px', boxSizing: 'border-box', overflowY: 'auto' }}>
                        <div style={{ marginBottom: '20px' }}>
                            <WalletConnection setWalletAddress={setWalletAddress} />
                        </div>
                        {walletAddress && (
                            <>
                                <CreateTeamButton walletAddress={walletAddress} />
                                <TeamList walletAddress={walletAddress} />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </WebSocketProvider>
    );
};

export default App;
