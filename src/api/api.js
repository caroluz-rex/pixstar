// src/api/api.js

// Заглушки для будущих эндпоинтов

export const getTeams = async () => {
    // Здесь будет запрос к бэкенду для получения списка команд
    return [
        { id: 1, name: 'Команда А', members: ['Wallet1', 'Wallet2'] },
        { id: 2, name: 'Команда Б', members: ['Wallet3'] },
    ];
};

export const joinTeam = async (teamId, walletAddress) => {
    // Запрос на присоединение к команде
    console.log(`Присоединение ${walletAddress} к команде ${teamId}`);
};

export const createTeam = async (teamName, walletAddress) => {
    // Запрос на создание команды
    console.log(`Создание команды ${teamName} пользователем ${walletAddress}`);
};

export const getTeamMembers = async (teamId) => {
    // Здесь будет запрос к бэкенду для получения списка участников команды
    // Моковые данные
    if (teamId === 1) {
        return ['Wallet1', 'Wallet2'];
    } else if (teamId === 2) {
        return ['Wallet3'];
    } else {
        return [];
    }
};

export const sendPixelData = async (pixelData) => {
    // Здесь будет запрос к бэкенду для сохранения пикселя
    // Например:
    // await fetch('/api/pixels', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(pixelData),
    // });
};