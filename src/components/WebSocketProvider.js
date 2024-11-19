// src/components/WebSocketProvider.js
import React, { useEffect } from 'react';

const WebSocketContext = React.createContext(null);

export const WebSocketProvider = ({ children, onUpdate }) => {
    useEffect(() => {
        const ws = new WebSocket('ws://localhost:8000/ws');

        ws.onopen = () => {
            console.log('WebSocket подключён');
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            // Обработка полученных данных и обновление состояния канваса
            if (data.fullDocument) {
                onUpdate(data.fullDocument);
            }
        };

        ws.onclose = () => {
            console.log('WebSocket отключён');
        };

        ws.onerror = (error) => {
            console.log('WebSocket ошибка:', error);
        };

        return () => {
            ws.close();
        };
    }, [onUpdate]);

    return <WebSocketContext.Provider value={null}>{children}</WebSocketContext.Provider>;
};

export default WebSocketContext;
