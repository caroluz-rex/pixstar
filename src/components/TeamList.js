// src/components/TeamList.jsx

import React, { useEffect, useState } from 'react';
import { getTeams, getTeamMembers, joinTeam, leaveTeam } from '../api/api';

const TeamList = ({ walletAddress }) => {
    const [teams, setTeams] = useState([]);
    const [expandedTeamId, setExpandedTeamId] = useState(null);
    const [teamMembers, setTeamMembers] = useState({});
    const [userTeams, setUserTeams] = useState([]);

    const fetchTeams = async () => {
        try {
            const data = await getTeams();
            setTeams(data);

            // Обновляем список команд, в которых состоит пользователь
            const userTeams = data.filter((team) => team.members.includes(walletAddress));
            setUserTeams(userTeams);

            // Обновляем участников для раскрытой команды
            if (expandedTeamId) {
                const { members } = await getTeamMembers(expandedTeamId);
                setTeamMembers((prev) => ({ ...prev, [expandedTeamId]: members }));
            }
        } catch (error) {
            console.error('Error fetching teams:', error);
        }
    };

    useEffect(() => {
        fetchTeams();

        const interval = setInterval(() => {
            fetchTeams();
        }, 5000); // Обновляем каждые 5 секунд

        return () => clearInterval(interval); // Очистка при размонтировании
    }, [expandedTeamId, walletAddress]);

    const handleTeamClick = async (teamId) => {
        if (expandedTeamId === teamId) {
            setExpandedTeamId(null);
            return;
        }

        try {
            const { members } = await getTeamMembers(teamId);
            setTeamMembers((prev) => ({ ...prev, [teamId]: members }));
            setExpandedTeamId(teamId);
        } catch (error) {
            console.error('Error fetching team members:', error);
        }
    };

    const handleJoinTeam = async (teamId) => {
        try {
            await joinTeam(teamId);
            fetchTeams();
        } catch (error) {
            console.error('Error joining team:', error);
        }
    };

    const handleLeaveTeam = async (teamId) => {
        try {
            await leaveTeam(teamId);
            fetchTeams();
        } catch (error) {
            console.error('Error leaving team:', error);
        }
    };

    const isMemberOfTeam = (team) => {
        return team.members.includes(walletAddress);
    };

    return (
        <div className="window" style={{ marginTop: '10px' }}>
            <div className="title-bar">
                <div className="title-bar-text">Teams</div>
            </div>
            <div className="window-body">
                {teams.map((team) => (
                    <div
                        key={team.id}
                        className="window"
                        style={{
                            marginBottom: '10px',
                            cursor: 'pointer',
                        }}
                    >
                        <div
                            className="title-bar"
                            onClick={() => handleTeamClick(team.id)}
                        >
                            <div className="title-bar-text">{team.name}</div>
                        </div>
                        {expandedTeamId === team.id && (
                            <div className="window-body" style={{ padding: '10px' }}>
                                <p style={{ marginBottom: '5px' }}>Members:</p>
                                <ul style={{ paddingLeft: '20px' }}>
                                    {teamMembers[team.id]?.filter((member) => member).map((member, index) => (
                                        <li key={index} style={{ wordBreak: 'break-all' }}>{member}</li>
                                    ))}
                                </ul>
                                <div style={{ marginTop: '10px' }}>
                                    {!isMemberOfTeam(team) && userTeams.length === 0 && (
                                        <button
                                            className="button"
                                            onClick={() => handleJoinTeam(team.id)}
                                            style={{ marginRight: '5px' }}
                                        >
                                            Enter team
                                        </button>
                                    )}
                                    {isMemberOfTeam(team) && (
                                        <button
                                            className="button"
                                            onClick={() => handleLeaveTeam(team.id)}
                                            style={{ marginRight: '5px' }}
                                        >
                                            Leave team
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TeamList;
