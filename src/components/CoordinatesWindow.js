import React from 'react';

const CoordinatesWindow = ({ cursorPosition }) => {
    return (
        <div
            className="window"
            style={{
                position: 'absolute',
                top: 20,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '200px',
                zIndex: 5,
                fontSize: '14px',
                fontWeight: 'bold',
                textAlign: 'center', // Центровка текста
            }}
        >
            <div className="title-bar">
                <div className="title-bar-text">Coordinates</div>
            </div>
            <div className="window-body" style={{ padding: '10px' }}>
                <p>
                    {cursorPosition.x !== null && cursorPosition.y !== null
                        ? `X: ${cursorPosition.x}, Y: ${cursorPosition.y}`
                        : 'Move cursor over canvas'}
                </p>
            </div>
        </div>
    );
};

export default CoordinatesWindow;
