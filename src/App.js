import React, { useState, useCallback } from 'react';
import Canvas from './components/Canvas';
import ColorPicker from './components/ColorPicker';
import TeamList from './components/TeamList';
import CreateTeamButton from './components/CreateTeamButton';
import WalletConnection from './components/WalletConnection';
import { WebSocketProvider } from './components/WebSocketProvider';
import '98.css'; // Импортируем стили 98.css
import './custom.css'; // Ваши стили

const App = () => {
    const [selectedColor, setSelectedColor] = useState('#000000');
    const [walletAddress, setWalletAddress] = useState(null);
    const [cursorPosition, setCursorPosition] = useState({ x: null, y: null });
    const [pixels, setPixels] = useState({});

    const refreshTeams = useCallback(() => {
        // Реализуйте функцию обновления команд, если необходимо
    }, []);

    const handleUpdate = useCallback((newPixels, isInitial) => {
        setPixels((prevPixels) => {
            if (isInitial) {
                return { ...newPixels };
            } else {
                return {
                    ...prevPixels,
                    ...newPixels.reduce((acc, pixel) => {
                        acc[`${pixel.x}-${pixel.y}`] = pixel;
                        return acc;
                    }, {}),
                };
            }
        });
    }, []);

    return (
        <WebSocketProvider onUpdate={handleUpdate}>
            {!walletAddress && (
                <div className="overlay">
                    <div className="wallet-button-container-mobile">
                        <WalletConnection setWalletAddress={setWalletAddress} />
                    </div>
                </div>
            )}
            <div className={`app-container ${!walletAddress ? 'blurred' : ''}`}>
                {/* Основная область */}
                <div className="main-content">
                    <Canvas
                        selectedColor={selectedColor}
                        setCursorPosition={setCursorPosition}
                        cursorPosition={cursorPosition}
                        pixels={pixels}
                        isAuthenticated={walletAddress !== null}
                    />
                    <ColorPicker selectedColor={selectedColor} setSelectedColor={setSelectedColor}/>
                </div>
                {/* Боковая панель */}
                <div className="side-panel">
                    <div className="win98-icons">
                        <a href="https://t.me/pixme_battle_portal" target="_blank" rel="noopener noreferrer">
                            <img src="/telegram.png" alt="Telegram"/>
                        </a>
                        <a href="https://x.com/pixmefun" target="_blank" rel="noopener noreferrer">
                            <img src="/x.png" alt="Twitter"/>
                        </a>
                        <a href="" target="_blank" rel="noopener noreferrer">
                            <img src="/dex.png" alt="Graph"/>
                        </a>
                    </div>
                    {walletAddress ? (
                        <>
                            <WalletConnection setWalletAddress={setWalletAddress}/>
                        </>
                    ) : (
                        <div className="wallet-button-container">
                            <WalletConnection setWalletAddress={setWalletAddress}/>
                        </div>
                    )}
                    {walletAddress ? (
                        <>
                            <CreateTeamButton walletAddress={walletAddress} refreshTeams={refreshTeams}/>
                            <TeamList walletAddress={walletAddress}/>
                        </>
                    ) : (
                        <p className="wallet-address">Please connect your wallet to proceed</p>
                    )}

                </div>
            </div>
        </WebSocketProvider>
    );
};

export default App;
