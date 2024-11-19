// src/components/CreateTeamButton.js
import React, { useState } from 'react';
import { createTeam } from '../api/api';

const CreateTeamButton = ({ walletAddress }) => {
    const [teamName, setTeamName] = useState('');

    const handleCreateTeam = async () => {
        if (teamName.trim() === '') return;
        await createTeam(teamName, walletAddress);
        setTeamName('');
        // Обновить список команд после создания
    };

    return (
        <div style={{ marginBottom: '20px' }}>
            <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Название команды"
                style={{ width: 'calc(100% - 110px)', padding: '5px' }}
            />
            <button onClick={handleCreateTeam} style={{ padding: '5px 10px', marginLeft: '10px' }}>
                Создать команду
            </button>
        </div>
    );
};

export default CreateTeamButton;
