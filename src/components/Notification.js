// src/components/Notification.jsx

import React from 'react';

const Notification = ({ message }) => {
    return (
        <div
            className="window"
            style={{
                marginBottom: '10px',
                width: '250px',
            }}
        >
            <div className="title-bar">
                <div className="title-bar-text">Notification</div>
            </div>
            <div className="window-body">
                <p>{message}</p>
            </div>
        </div>
    );
};

export default Notification;
