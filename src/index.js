import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { WebSocketProvider } from './components/WebSocketProvider';

ReactDOM.render(
    <React.StrictMode>
        <WebSocketProvider>
            <App />
        </WebSocketProvider>
    </React.StrictMode>,
    document.getElementById('root')
);
