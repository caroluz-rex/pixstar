// src/api/api.js

export const createTeam = async (teamName) => {
    const response = await fetch('/teams/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: teamName }),
        credentials: 'include', // Include cookies
    });
    if (!response.ok) {
        throw new Error('Failed to create team');
    }
    return response.json();
};

export const getTeams = async () => {
    const response = await fetch('/teams', {
        method: 'GET',
        credentials: 'include', // Include cookies
    });
    if (!response.ok) {
        throw new Error('Failed to fetch teams');
    }
    return response.json();
};

export const getTeamMembers = async (teamId) => {
    const response = await fetch(`/members?teamId=${teamId}`, {
        method: 'GET',
        credentials: 'include', // Include cookies
    });
    if (!response.ok) {
        throw new Error('Failed to get team members');
    }
    return response.json();
};

export const getMe = async () => {
    const response = await fetch('http://localhost:8080/me', {
        method: 'GET',
        credentials: 'include', // Include cookies
    });
    if (!response.ok) {
        throw new Error('Not authenticated');
    }
    return response.json();
};


export const joinTeam = async (teamId) => {
    const response = await fetch('http://localhost:8080/teams/join', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ teamId }),
        credentials: 'include',
    });
    if (!response.ok) {
        throw new Error('Failed to join team');
    }
    return response.json();
};

export const leaveTeam = async (teamId) => {
    const response = await fetch('http://localhost:8080/teams/leave', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ teamId }),
        credentials: 'include',
    });
    if (!response.ok) {
        throw new Error('Failed to leave team');
    }
    return response.json();
};