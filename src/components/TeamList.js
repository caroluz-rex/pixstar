// src/components/TeamList.js
import React, { useEffect, useState } from 'react';
import { getTeams, getTeamMembers } from '../api/api';

const TeamList = ({ walletAddress }) => {
    const [teams, setTeams] = useState([]);
    const [expandedTeamId, setExpandedTeamId] = useState(null);
    const [teamMembers, setTeamMembers] = useState({});

    useEffect(() => {
        const fetchTeams = async () => {
            const data = await getTeams();
            setTeams(data);
        };
        fetchTeams();
    }, []);

    const handleTeamClick = async (teamId) => {
        // Если команда уже раскрыта, свернуть ее
        if (expandedTeamId === teamId) {
            setExpandedTeamId(null);
            return;
        }

        // Получаем список участников команды
        const members = await getTeamMembers(teamId);
        setTeamMembers((prev) => ({ ...prev, [teamId]: members }));
        setExpandedTeamId(teamId);
    };

    return (
        <div>
            <h3>Команды</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {teams.map((team) => (
                    <div
                        key={team.id}
                        style={{
                            border: '1px solid #ccc',
                            borderRadius: '5px',
                            padding: '10px',
                            margin: '5px',
                            width: '200px',
                            cursor: 'pointer',
                        }}
                        onClick={() => handleTeamClick(team.id)}
                    >
                        <h4>{team.name}</h4>
                        {expandedTeamId === team.id && (
                            <div>
                                <p>Участники:</p>
                                <ul>
                                    {teamMembers[team.id]?.map((member, index) => (
                                        <li key={index}>{member}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TeamList;
