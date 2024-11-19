// src/components/WalletConnection.jsx

import React, { useMemo, useState, useEffect } from 'react';
import '98.css';
import '@solana/wallet-adapter-react-ui/styles.css';
import { getMe } from '../api/api';
import {
    ConnectionProvider,
    WalletProvider,
    useWallet,
} from '@solana/wallet-adapter-react';
import {
    WalletModalProvider,
    WalletMultiButton,
} from '@solana/wallet-adapter-react-ui';
import {
    PhantomWalletAdapter,
    SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

import { Buffer } from 'buffer';
window.Buffer = window.Buffer || require('buffer').Buffer;


const WalletConnection = ({ setWalletAddress }) => {
    const endpoint = useMemo(() => clusterApiUrl('devnet'), []);
    const wallets = useMemo(
        () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
        []
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    <WalletButton setWalletAddress={setWalletAddress} />
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};

const WalletButton = ({ setWalletAddress }) => {
    const { publicKey, signMessage, connected, disconnect } = useWallet();
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const authenticate = async () => {
            if (publicKey && signMessage) {
                setIsAuthenticating(true);
                try {
                    // Шаг 1: Получаем nonce от сервера
                    const challengeResponse = await fetch('/api/get-challenge', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            publicKey: publicKey.toString(),
                        }),
                        credentials: 'include',
                    });

                    if (!challengeResponse.ok) {
                        console.error('Failed to get challenge');
                        setIsAuthenticating(false);
                        return;
                    }

                    const challengeData = await challengeResponse.json();
                    const message = challengeData.nonce;

                    // Шаг 2: Подписываем сообщение
                    const encodedMessage = new TextEncoder().encode(message);
                    const signature = await signMessage(encodedMessage);

                    // Кодируем подпись в Base64
                    const signatureBase64 = Buffer.from(signature).toString('base64');

                    // Шаг 3: Отправляем подпись на сервер
                    const authResponse = await fetch('/api/authenticate', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            publicKey: publicKey.toString(),
                            signature: signatureBase64,
                            message,
                        }),
                        credentials: 'include',
                    });

                    if (authResponse.ok) {
                        const data = await authResponse.json();
                        if (data.success) {
                            setWalletAddress(publicKey.toString());
                            setIsAuthenticated(true);
                            console.log('Wallet authenticated successfully');
                        } else {
                            console.error('Authentication failed:', data.error);
                        }
                    } else {
                        console.error('Failed to authenticate wallet');
                    }
                } catch (error) {
                    console.error('Error during authentication:', error);
                } finally {
                    setIsAuthenticating(false);
                }
            }
        };

        const checkAuthentication = async () => {
            try {
                const data = await getMe();
                setWalletAddress(data.publicKey);
                setIsAuthenticated(true);
                console.log('User is already authenticated');
            } catch (error) {
                // Пользователь не аутентифицирован
                if (connected && !isAuthenticated) {
                    authenticate();
                }
            }
        };

        if (!isAuthenticated) {
            checkAuthentication();
        }
    }, [connected, isAuthenticated, setWalletAddress, publicKey, signMessage]);

    const handleDisconnect = async () => {
        // Вызываем эндпоинт /logout для удаления куки на сервере
        try {
            await fetch('/api/logout', {
                method: 'POST',
                credentials: 'include',
            });
        } catch (error) {
            console.error('Error during logout:', error);
        }

        await disconnect();
        setWalletAddress(null);
        setIsAuthenticated(false);
    };

    if (!connected) {
        // Кошелек не подключен
        return <WalletMultiButton />;
    }

    if (isAuthenticating) {
        // Идет процесс аутентификации
        return (
            <div className="window" style={{ width: '100%', marginBottom: '10px' }}>
                <div className="title-bar">
                    <div className="title-bar-text">Authentication</div>
                </div>
                <div className="window-body" style={{ padding: '10px' }}>
                    <p>Authenticating...</p>
                </div>
            </div>
        );
    }

    if (isAuthenticated) {
        // Аутентификация успешна, отображаем адрес кошелька и кнопку отключения
        return (
            <div className="window" style={{ width: '100%', marginBottom: '10px' }}>
                <div className="title-bar">
                    <div className="title-bar-text">Wallet</div>
                </div>
                <div className="window-body" style={{ padding: '10px' }}>
                    <p style={{ marginBottom: '5px', fontWeight: 'bold' }}>Wallet Address:</p>
                    <p style={{ wordBreak: 'break-all' }}>
                        {publicKey ? publicKey.toString() : 'Loading...'}
                    </p>
                    <button className="button" onClick={handleDisconnect} style={{ marginTop: '10px' }}>
                        Disconnect Wallet
                    </button>
                </div>
            </div>
        );
    }

    // Если подключены, но аутентификация не удалась
    return (
        <div className="window" style={{ width: '100%', marginBottom: '10px' }}>
            <div className="title-bar">
                <div className="title-bar-text">Authentication Failed</div>
            </div>
            <div className="window-body" style={{ padding: '10px' }}>
                <p>Failed to authenticate your wallet.</p>
                <WalletMultiButton />
            </div>
        </div>
    );
};

export default WalletConnection;
