// src/components/CreateTeamButton.jsx
import React, { useState } from 'react';
import { createTeam } from '../api/api';

const CreateTeamButton = ({ walletAddress, refreshTeams }) => {
    const [teamName, setTeamName] = useState('');

    const handleCreateTeam = async () => {
        if (teamName.trim() === '') return;
        try {
            await createTeam(teamName, walletAddress);
            setTeamName('');
            if (refreshTeams) {
                refreshTeams();
            }
        } catch (error) {
            console.error('Error creating team:', error);
        }
    };

    return (
        <div className="window" style={{ marginBottom: '20px' }}>
            <div className="title-bar">
                <div className="title-bar-text">Create Team</div>
            </div>
            <div className="window-body">
                <div className="field-row" style={{ alignItems: 'center' }}>
                    <input
                        type="text"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        placeholder="Team Name"
                        style={{ flex: 1 }}
                    />
                    <button className="button" onClick={handleCreateTeam} style={{ marginLeft: '10px' }}>
                        Create
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateTeamButton;
