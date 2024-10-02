
interface Schedule {
    id?: number;
    datetime: string;
    event: string;
    priority: number;
}

const API_URL = 'http://localhost:8080/schedules';

export const getSchedules = async (date: Date): Promise<Schedule[]> => {
    const response = await fetch(`${API_URL}?date=${date.toISOString()}`);
    if (!response.ok) {
        throw new Error('Erro ao buscar os agendamentos');
    }
    return response.json();
};


export const addSchedule = async (newSchedule: Schedule): Promise<Schedule> => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSchedule),
    });

    if (!response.ok) {
        throw new Error('Erro ao adicionar o agendamento');
    }

    return response.json();
};

export const updateSchedule = async (schedule: Schedule): Promise<Schedule> => {
    if (schedule.id == null) {
        throw new Error('ID do agendamento é necessário para a atualização.');
    }

    const response = await fetch(`${API_URL}/${schedule.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(schedule),
    });

    if (!response.ok) {
        throw new Error(`Erro ao atualizar agendamento: ${response.statusText}`);
    }

    return response.json();
};


export const deleteSchedule = async (id: number): Promise<void> => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error('Erro ao excluir o agendamento');
    }
};
