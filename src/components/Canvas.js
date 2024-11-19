import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Image as KonvaImage } from 'react-konva';
import { useWebSocket } from './WebSocketProvider';
import Notification from './Notification';
import CoordinatesWindow from './CoordinatesWindow';

const PIXEL_SIZE = 14;
const PIXEL_COUNT_X = 500;
const PIXEL_COUNT_Y = 300;
const CANVAS_SIZE_X = PIXEL_SIZE * PIXEL_COUNT_X;
const CANVAS_SIZE_Y = PIXEL_SIZE * PIXEL_COUNT_Y;
const STROKE_WIDTH = 2;

const Canvas = ({ selectedColor, setCursorPosition, cursorPosition, pixels, isAuthenticated }) => {
    const [hoveredPixel, setHoveredPixel] = useState(null);
    const stageRef = useRef(null);
    const containerRef = useRef(null);
    const { sendPixel } = useWebSocket();
    const [lastDrawTime, setLastDrawTime] = useState(0);
    const [dimensions, setDimensions] = useState({ width: 800, height: 640 });
    const [notifications, setNotifications] = useState([]);
    const imageRef = useRef(null); // Ref for Konva.Image
    const updateBuffer = useRef([]); // Буфер для обновлений пикселей
    const canvasRef = useRef(document.createElement('canvas')); // Canvas для рисования

    const minScale = 0.1;
    const maxScale = 20;

    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                const width = containerRef.current.offsetWidth;
                const height = containerRef.current.offsetHeight;
                setDimensions({ width, height });
            }
        };

        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    useEffect(() => {
        const stage = stageRef.current;
        if (stage) {
            const scale = Math.min(
                dimensions.width / CANVAS_SIZE_X,
                dimensions.height / CANVAS_SIZE_Y
            );
            stage.scale({ x: scale, y: scale });
            stage.position({ x: 0, y: 0 });
            stage.batchDraw();
        }
    }, [dimensions]);

    const handleWheel = (e) => {
        e.evt.preventDefault();
        const stage = stageRef.current;

        const oldScale = stage.scaleX();
        const pointer = stage.getPointerPosition();

        const scaleBy = 1.05;
        let newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;

        newScale = Math.max(minScale, Math.min(newScale, maxScale));

        stage.scale({ x: newScale, y: newScale });

        const mousePointTo = {
            x: (pointer.x - stage.x()) / oldScale,
            y: (pointer.y - stage.y()) / oldScale,
        };

        const newPos = {
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale,
        };

        stage.position({
            x: Math.round(newPos.x),
            y: Math.round(newPos.y),
        });
        stage.batchDraw();
    };

    const handleMouseMove = (e) => {
        const stage = stageRef.current;
        const scale = stage.scaleX();
        const pointer = stage.getPointerPosition();

        if (!pointer) {
            setHoveredPixel(null);
            setCursorPosition({ x: null, y: null });
            return;
        }

        const x = Math.floor((pointer.x - stage.x()) / (PIXEL_SIZE * scale));
        const y = Math.floor((pointer.y - stage.y()) / (PIXEL_SIZE * scale));

        if (x >= 0 && x < PIXEL_COUNT_X && y >= 0 && y < PIXEL_COUNT_Y) {
            setHoveredPixel({ x: x * PIXEL_SIZE, y: y * PIXEL_SIZE });
            setCursorPosition({ x, y });
        } else {
            setHoveredPixel(null);
            setCursorPosition({ x: null, y: null });
        }
    };

    const handleCanvasClick = (e) => {
        if (!isAuthenticated) {
            showNotification('You must connect wallet before drawing');
            return;
        }

        const currentTime = Date.now();
        if (currentTime - lastDrawTime < 2000) {
            showNotification('COOLDOWN 2 SEC');
            return;
        }

        const stage = stageRef.current;
        const scale = stage.scaleX();
        const pointer = stage.getPointerPosition();

        const x = Math.floor((pointer.x - stage.x()) / (PIXEL_SIZE * scale));
        const y = Math.floor((pointer.y - stage.y()) / (PIXEL_SIZE * scale));

        if (x >= 0 && x < PIXEL_COUNT_X && y >= 0 && y < PIXEL_COUNT_Y) {
            const newPixel = { x, y, color: selectedColor };
            sendPixel(newPixel);
            updateBuffer.current.push(newPixel); // Сохраняем изменения в буфер
            setLastDrawTime(currentTime);
        }
    };

    const showNotification = (message) => {
        const id = Date.now();
        setNotifications((prev) => [...prev, { id, message }]);
        setTimeout(() => {
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        }, 3000);
    };

    useEffect(() => {
        const interval = setInterval(() => {
            if (updateBuffer.current.length > 0) {
                const ctx = canvasRef.current.getContext('2d');
                updateBuffer.current.forEach(({ x, y, color }) => {
                    ctx.fillStyle = color;
                    ctx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
                });
                updateBuffer.current = []; // Очищаем буфер
                const img = imageRef.current;
                if (img) {
                    img.image(canvasRef.current);
                    img.getLayer().batchDraw();
                }
            }
        }, 50); // Частота обновления 50 мс

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        canvas.width = PIXEL_COUNT_X * PIXEL_SIZE;
        canvas.height = PIXEL_COUNT_Y * PIXEL_SIZE;
        const ctx = canvas.getContext('2d');

        // Первоначальная отрисовка
        Object.values(pixels).forEach(({ x, y, color }) => {
            ctx.fillStyle = color;
            ctx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
        });

        const img = imageRef.current;
        if (img) {
            img.image(canvas);
            img.getLayer().batchDraw();
        }
    }, [pixels]);

    return (
        <div
            ref={containerRef}
            className="window canvas-container"
            style={{
                width: '100%',
                height: '100%',
                minWidth: '300px',
                minHeight: '300px',
                position: 'relative',
                overflow: 'hidden',
                touchAction: 'none',
                marginBottom: '10px',
            }}
        >
            <div className="title-bar">
                <div className="title-bar-text">PIXEL.sol</div>
            </div>
            <div className="window-body" style={{ padding: 0, width: '100%', height: '100%' }}>
                <CoordinatesWindow cursorPosition={cursorPosition} />
                <Stage
                    width={dimensions.width}
                    height={dimensions.height}
                    onMouseDown={handleCanvasClick}
                    onWheel={handleWheel}
                    onMouseMove={handleMouseMove}
                    ref={stageRef}
                    draggable
                >
                    <Layer>
                        <Rect
                            x={STROKE_WIDTH / 2}
                            y={STROKE_WIDTH / 2}
                            width={CANVAS_SIZE_X - STROKE_WIDTH}
                            height={CANVAS_SIZE_Y - STROKE_WIDTH}
                            fill="#fff"
                            stroke="#000"
                            strokeWidth={STROKE_WIDTH}
                            listening={false}
                        />
                        <KonvaImage
                            x={0}
                            y={0}
                            width={CANVAS_SIZE_X}
                            height={CANVAS_SIZE_Y}
                            ref={imageRef}
                            listening={false}
                        />
                        {hoveredPixel && (
                            <Rect
                                x={hoveredPixel.x + STROKE_WIDTH / 2}
                                y={hoveredPixel.y + STROKE_WIDTH / 2}
                                width={PIXEL_SIZE - STROKE_WIDTH}
                                height={PIXEL_SIZE - STROKE_WIDTH}
                                fill={selectedColor}
                                stroke="#000"
                                strokeWidth={STROKE_WIDTH}
                                opacity={0.5}
                                listening={false}
                            />
                        )}
                    </Layer>
                </Stage>
                <div
                    style={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        zIndex: 10,
                    }}
                >
                    {notifications.map((notification) => (
                        <Notification key={notification.id} message={notification.message} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Canvas;
