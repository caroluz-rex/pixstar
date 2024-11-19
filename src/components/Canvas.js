// src/components/Canvas.js
import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect } from 'react-konva';

// Определяем размер одного пикселя (квадратный)
const PIXEL_SIZE = 14; // Размер одного пикселя по обоим осям в пикселях
const PIXEL_COUNT_X = 500; // Количество пикселей по оси X
const PIXEL_COUNT_Y = 300;  // Количество пикселей по оси Y
const CANVAS_SIZE_X = PIXEL_SIZE * PIXEL_COUNT_X; // Размер канваса по оси X
const CANVAS_SIZE_Y = PIXEL_SIZE * PIXEL_COUNT_Y; // Размер канваса по оси Y

const BUFFER_CANVASES = 1; // Количество канвасов для буферной зоны

// Определяем толщину обводки
const STROKE_WIDTH = 2; // Толщина обводки в пикселях

const Canvas = ({ selectedColor, setCursorPosition }) => {
    const [pixels, setPixels] = useState({});
    const [hoveredPixel, setHoveredPixel] = useState(null);
    const stageRef = useRef(null);
    const containerRef = useRef(null);

    // Состояние для размеров контейнера
    const [dimensions, setDimensions] = useState({
        width: 800,  // Ширина поля зрения (можно настроить)
        height: 640, // Высота поля зрения (соотношение 5:4)
    });

    const minScale = 0.1; // Минимальный масштаб (для предотвращения полного исчезновения канваса)
    const maxScale = 20; // Максимальный масштаб

    // Устанавливаем начальный масштаб, чтобы весь канвас был виден
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

    // Обновляем размеры контейнера при изменении размера окна
    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                const width = containerRef.current.offsetWidth;
                const height = containerRef.current.offsetHeight;
                setDimensions({
                    width,
                    height,
                });
            }
        };

        updateSize();

        window.addEventListener('resize', updateSize);
        return () => {
            window.removeEventListener('resize', updateSize);
        };
    }, []);

    // Отключаем антиалиасинг
    useEffect(() => {
        const layer = stageRef.current.getLayers()[0];
        if (layer) {
            layer.getContext().imageSmoothingEnabled = false;
        }
    }, []);

    // Обработчик колесика мыши для зумирования
    const handleWheel = (e) => {
        e.evt.preventDefault();
        const stage = stageRef.current;

        const oldScale = stage.scaleX();
        const pointer = stage.getPointerPosition();

        const scaleBy = 1.05;
        let newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;

        newScale = Math.max(minScale, Math.min(newScale, maxScale));

        // Округляем масштаб до двух знаков после запятой
        newScale = Math.round(newScale * 100) / 100;

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

    // Обработчик перемещения мыши для подсветки пикселя
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

    // Обработчик выхода курсора с канваса
    const handleMouseOut = () => {
        setHoveredPixel(null);
        setCursorPosition({ x: null, y: null });
    };

    // Обработчик клика по канвасу
    const handleCanvasClick = (e) => {
        const stage = stageRef.current;
        const scale = stage.scaleX();
        const pointer = stage.getPointerPosition();

        const x = Math.floor((pointer.x - stage.x()) / (PIXEL_SIZE * scale));
        const y = Math.floor((pointer.y - stage.y()) / (PIXEL_SIZE * scale));

        if (x >= 0 && x < PIXEL_COUNT_X && y >= 0 && y < PIXEL_COUNT_Y) {
            const key = `${x}-${y}`;

            setPixels({
                ...pixels,
                [key]: {
                    x: x * PIXEL_SIZE,
                    y: y * PIXEL_SIZE,
                    color: selectedColor,
                },
            });

            // Здесь можно отправить данные на бэкенд о закрашенном пикселе
        }
    };

    // Функция для ограничения позиции Stage
    const boundDrag = (pos) => {
        const stage = stageRef.current;
        if (!stage) return pos;

        const scale = stage.scaleX();
        let x = pos.x;
        let y = pos.y;

        // Ограничиваем по

        // Логирование для отладки
        console.log(`DragBound: x=${x}, y=${y}, scale=${scale}`);

        return {
            x: Math.round(x),
            y: Math.round(y),
        };
    };

    return (
        <div
            ref={containerRef}
            style={{
                border: '1px solid #000', // Черная граница контейнера
                width: '100%',
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
                touchAction: 'none',
                backgroundColor: '#ccc', // Фоновый цвет контейнера
                aspectRatio: `${CANVAS_SIZE_X} / ${CANVAS_SIZE_Y}`, // Сохранение соотношения сторон 5:4
            }}
        >
            <Stage
                width={dimensions.width}
                height={dimensions.height}
                onClick={handleCanvasClick}
                onWheel={handleWheel}
                onMouseMove={handleMouseMove}
                onMouseOut={handleMouseOut}
                ref={stageRef}
                draggable={true} // Разрешаем перетаскивание
                dragBoundFunc={boundDrag} // Ограничиваем позицию
                style={{ background: '#fff', imageRendering: 'pixelated' }}
                pixelRatio={1}
            >
                <Layer listening={true}>
                    {/* Рисуем канвас как белый прямоугольник с внутренней черной обводкой */}
                    <Rect
                        x={STROKE_WIDTH / 2} // Смещаем на половину толщины обводки
                        y={STROKE_WIDTH / 2}
                        width={CANVAS_SIZE_X - STROKE_WIDTH} // Уменьшаем ширину на полную толщину обводки
                        height={CANVAS_SIZE_Y - STROKE_WIDTH}
                        fill="#fff"
                        stroke="#000"
                        strokeWidth={STROKE_WIDTH} // Толщина обводки
                        listening={false}
                    />

                    {/* Рисуем закрашенные пиксели */}
                    {Object.values(pixels).map((pixel) => (
                        <Rect
                            key={`${pixel.x}-${pixel.y}`}
                            x={pixel.x}
                            y={pixel.y}
                            width={PIXEL_SIZE}
                            height={PIXEL_SIZE}
                            fill={pixel.color}
                            listening={false}
                        />
                    ))}

                    {/* Подсвечиваем пиксель при наведении с внутренней обводкой */}
                    {hoveredPixel && (
                        <Rect
                            x={hoveredPixel.x + STROKE_WIDTH / 2} // Смещаем на половину толщины обводки
                            y={hoveredPixel.y + STROKE_WIDTH / 2}
                            width={PIXEL_SIZE - STROKE_WIDTH} // Уменьшаем ширину на полную толщину обводки
                            height={PIXEL_SIZE - STROKE_WIDTH}
                            fill={selectedColor}
                            stroke="#000"
                            strokeWidth={STROKE_WIDTH} // Толщина обводки
                            opacity={0.5}
                            listening={false}
                        />
                    )}
                </Layer>
                <Layer listening={true}>
                    {/* Рисуем канвас */}
                    {/* ... другие элементы */}
                    {/* Рисуем закрашенные пиксели */}
                    {Object.values(pixels).map((pixel) => (
                        <Rect
                            key={`${pixel.x}-${pixel.y}`}
                            x={pixel.x}
                            y={pixel.y}
                            width={PIXEL_SIZE}
                            height={PIXEL_SIZE}
                            fill={pixel.color}
                            listening={false}
                        />
                    ))}
                    {/* Подсвечиваем пиксель */}
                    {hoveredPixel && (
                        <Rect
                            // ... свойства
                        />
                    )}
                </Layer>
            </Stage>

        </div>
    );
};

export default Canvas;
