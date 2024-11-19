import React, { createContext, useContext, useEffect, useRef } from 'react';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ onUpdate, children }) => {
    const wsSenderRef = useRef(null);
    const wsReceiverRef = useRef(null);
    const onUpdateRef = useRef(onUpdate);
    const reconnectInterval = 5000;

    useEffect(() => {
        onUpdateRef.current = onUpdate;
    }, [onUpdate]);

    // Подключение для получения обновлений
    useEffect(() => {
        const connectReceiver = () => {
            const socket = new WebSocket('/ws/receive');

            socket.onopen = () => {
                console.log('WebSocket для получения подключен');
            };

            socket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === 'initial') {
                    const pixels = data.pixels || [];
                    const pixelMap = {};
                    pixels.forEach((pixel) => {
                        pixelMap[`${pixel.x}-${pixel.y}`] = pixel;
                    });
                    if (typeof onUpdateRef.current === 'function') {
                        onUpdateRef.current(pixelMap, true);
                    }
                } else if (data.type === 'update') {
                    if (typeof onUpdateRef.current === 'function') {
                        onUpdateRef.current([data.pixel], false);
                    }
                }
            };

            socket.onclose = (e) => {
                console.error('WebSocket для получения отключен, переподключение через 5 секунд:', e.reason);
                setTimeout(connectReceiver, reconnectInterval);
            };

            socket.onerror = (err) => {
                console.error('WebSocket ошибка получения:', err.message);
                socket.close();
            };

            wsReceiverRef.current = socket;
        };

        connectReceiver();

        return () => {
            wsReceiverRef.current?.close();
        };
    }, []);

    // Подключение для отправки
    useEffect(() => {
        const connectSender = () => {
            const socket = new WebSocket('/ws/send');

            socket.onopen = () => {
                console.log('WebSocket для отправки подключен');
            };

            socket.onclose = (e) => {
                console.error('WebSocket для отправки отключен, переподключение через 5 секунд:', e.reason);
                setTimeout(connectSender, reconnectInterval);
            };

            socket.onerror = (err) => {
                console.error('WebSocket ошибка отправки:', err.message);
                socket.close();
            };

            wsSenderRef.current = socket;
        };

        connectSender();

        return () => {
            wsSenderRef.current?.close();
        };
    }, []);

    const sendPixel = (pixel) => {
        if (wsSenderRef.current && wsSenderRef.current.readyState === WebSocket.OPEN) {
            wsSenderRef.current.send(JSON.stringify({ type: 'update', pixel }));
        } else {
            console.warn('WebSocket для отправки не готов');
        }
    };

    return (
        <WebSocketContext.Provider value={{ sendPixel }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => useContext(WebSocketContext);
