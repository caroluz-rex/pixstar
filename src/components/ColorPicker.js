// src/components/ColorPicker.js
import React from 'react';
import { COLORS } from '../utils/colors';

const ColorPicker = ({ selectedColor, setSelectedColor }) => {
    return (
        <div style={{ display: 'flex', marginTop: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Текущий выбранный цвет */}
            <div
                style={{
                    backgroundColor: selectedColor,
                    width: '40px',
                    height: '40px',
                    margin: '5px',
                    border: '3px solid #000',
                }}
            ></div>
            {/* Список доступных цветов */}
            {COLORS.map((color, index) => (
                <div
                    key={index}
                    onClick={() => setSelectedColor(color)}
                    style={{
                        backgroundColor: color,
                        width: '30px',
                        height: '30px',
                        cursor: 'pointer',
                        margin: '5px',
                        border: selectedColor === color ? '3px solid #000' : '1px solid #ccc',
                    }}
                ></div>
            ))}
        </div>
    );
};

export default ColorPicker;
