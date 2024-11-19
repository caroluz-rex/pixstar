// src/components/ColorPicker.jsx

import React, { useState } from 'react';
import { COLORS } from '../utils/colors';

const ColorPicker = ({ selectedColor, setSelectedColor }) => {
    const [customColor, setCustomColor] = useState('#ffffff'); // Для произвольного выбора цвета

    const handleCustomColorChange = (e) => {
        const newColor = e.target.value;
        setCustomColor(newColor);
        setSelectedColor(newColor); // Обновляем выбранный цвет
    };

    return (
        <div className="window" style={{ marginTop: '10px' }}>
            <div className="title-bar">
                <div className="title-bar-text">Colors</div>
            </div>
            <div className="window-body" style={{ display: 'flex', flexDirection: 'column' }}>
                {/* Выбор произвольного цвета */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <input
                        type="color"
                        value={customColor}
                        onChange={handleCustomColorChange}
                        style={{ width: '30px', height: '30px', cursor: 'pointer', border: 'none' }}
                    />
                    <input
                        type="text"
                        value={customColor}
                        onChange={handleCustomColorChange}
                        style={{
                            width: '100px',
                            padding: '5px',
                            border: '1px solid #ccc',
                            borderRadius: '3px',
                            fontFamily: 'monospace',
                        }}
                        placeholder="#ffffff"
                    />
                    {/* Превью выбранного цвета */}
                    <div
                        style={{
                            width: '30px',
                            height: '30px',
                            backgroundColor: selectedColor,
                            border: '1px solid #000',
                        }}
                    ></div>
                </div>

                {/* Палитра цветов */}
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                    {COLORS.map((color) => (
                        <div
                            key={color}
                            onClick={() => setSelectedColor(color)}
                            style={{
                                width: '20px',
                                height: '20px',
                                backgroundColor: color,
                                border: selectedColor === color ? '2px solid #000' : '1px solid #ccc',
                                margin: '5px',
                                cursor: 'pointer',
                            }}
                        ></div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ColorPicker;
