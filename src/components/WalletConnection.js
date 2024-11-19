// src/components/WalletConnection.js
import React, { useMemo } from 'react';
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

require('@solana/wallet-adapter-react-ui/styles.css');

const WalletConnection = ({ setWalletAddress }) => {
    const endpoint = useMemo(() => clusterApiUrl('devnet'), []);
    const wallets = useMemo(() => [new PhantomWalletAdapter(), new SolflareWalletAdapter()], []);

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
    const { publicKey } = useWallet();

    React.useEffect(() => {
        if (publicKey) {
            setWalletAddress(publicKey.toString());
            // Здесь можно вызвать подпись для аутентификации
        }
    }, [publicKey, setWalletAddress]);

    return <WalletMultiButton />;
};

export default WalletConnection;
