"use client";

import { useEffect, useState } from 'react';
import { getSchedules, addSchedule, updateSchedule, deleteSchedule } from '../services/schedule.service';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { TrashIcon } from '@heroicons/react/24/solid'; // Ícone de lixeira

interface Schedule {
    id?: number;
    datetime: string;
    event: string;
    priority: number;
}

export default function SchedulePage() {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [date, setDate] = useState<Date>(new Date());
    const [time, setTime] = useState<string>('12:00');
    const [locale, setLocale] = useState('en-US');
    const [newEvent, setNewEvent] = useState<string>('');
    const [newPriority, setNewPriority] = useState<number>(1);
    const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null);
    const [showToast, setShowToast] = useState<boolean>(false);
    const [toastMessage, setToastMessage] = useState<string>('');
    const [toastType, setToastType] = useState<'sucess' | 'error'>('sucess');

    useEffect(() => {
        const fetchSchedules = async () => {
            try {
                const data = await getSchedules(date);
                setSchedules(data);
            } catch (err: any) {

            }
        };

        fetchSchedules();
        const userLocale = navigator.language || 'en-US';
        setLocale(userLocale);
    }, [date]);

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long' }).format(date);
    };

    const getEventsForDate = (selectedDate: Date | null) => {
        if (!selectedDate) return [];
        const selectedDateString = selectedDate.toISOString().split('T')[0];
        return schedules.filter(schedule => schedule.datetime.startsWith(selectedDateString));
    };

    const combineDateAndTime = (selectedDate: Date, selectedTime: string) => {
        const [hours, minutes] = selectedTime.split(':');
        const dateWithTime = new Date(selectedDate);
        dateWithTime.setHours(parseInt(hours), parseInt(minutes));
        return dateWithTime;
    };

    const handleAddEvent = async () => {
        if (!date || !newEvent.trim()) return;

        const newSchedule: Schedule = {
            datetime: combineDateAndTime(date, time).toISOString(),
            event: newEvent,
            priority: newPriority,
        };

        try {
            const addedSchedule = await addSchedule(newSchedule);
            setSchedules([...schedules, addedSchedule]);
            showSuccessToast("Evento adicionado com sucesso!");
            resetForm();
        } catch (err: any) {
            showErrorToast(err.message);
        }
    };

    const handleEditEvent = async () => {
        if (!editingSchedule || !newEvent.trim()) return;

        const updatedSchedule: Schedule = {
            ...editingSchedule,
            datetime: combineDateAndTime(date, time).toISOString(),
            event: newEvent,
            priority: newPriority,
        };

        try {
            const updated = await updateSchedule(updatedSchedule);
            setSchedules(schedules.map(schedule => (schedule.id === updated.id ? updated : schedule)));
            showSuccessToast("Evento atualizado com sucesso!");
            resetForm();
            setEditingSchedule(null);
        } catch (err: any) {
            showErrorToast(err.message);
        }
    };

    const handleDeleteEvent = async () => {
        if (selectedScheduleId === null) return;
        try {
            await deleteSchedule(selectedScheduleId);
            setSchedules(schedules.filter(schedule => schedule.id !== selectedScheduleId));
            setShowModal(false);
            showSuccessToast("Evento excluído com sucesso!");
        } catch (err: any) {
            showErrorToast(err.message);
        }
    };

    const handleUpdateDate = async (value: Date) => {
        setDate(value);
        resetForm();
    }

    const resetForm = () => {
        setNewEvent('');
        setTime('12:00');
        setNewPriority(1);
    };

    const handleScheduleClick = (schedule: Schedule) => {
        setEditingSchedule(schedule);
        setNewEvent(schedule.event);
        setTime(new Date(schedule.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        setNewPriority(schedule.priority);
    };

    const showSuccessToast = (message: string) => {
        setToastMessage(message);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };


    const showErrorToast = (message: string) => {
        setToastMessage(message);
        setShowToast(true);
        setToastType('error')
        setTimeout(() => setShowToast(false), 5000);
    };


    const eventsForSelectedDate = getEventsForDate(date);

    return (
        <div className="p-6 relative">
            {showToast && (
                <div className={`absolute top-4 right-4 ${toastType === 'sucess'
                    ? 'bg-green-500'
                    : 'bg-red-500'
                    } text-white py-2 px-4 rounded shadow-lg`}>
                    {toastMessage}
                </div>
            )}

            <div className="flex flex-col md:flex-row gap-6">
                {/* Calendário */}
                <div className="md:w-1/2">
                    <Calendar
                        locale={locale}
                        onChange={value => {
                            if (value instanceof Date) {
                                handleUpdateDate(value);
                            }
                        }}
                        value={date}
                        className="mb-4 custom-calendar"
                    />
                </div>

                {/* Formulário para adicionar ou editar evento */}
                <div className="md:w-1/2">
                    <h2 className="text-xl font-semibold mb-4">{editingSchedule ? 'Editar Evento' : 'Adicionar Evento'}</h2>
                    <input
                        type="text"
                        placeholder="Nome do Evento"
                        value={newEvent}
                        onChange={e => setNewEvent(e.target.value)}
                        className="border p-2 rounded mb-4 w-full text-black"
                    />
                    <input
                        type="time"
                        value={time}
                        onChange={e => setTime(e.target.value)}
                        className="border p-2 rounded mb-4 w-full text-black"
                    />
                    <select
                        value={newPriority}
                        onChange={e => setNewPriority(Number(e.target.value))}
                        className="border p-2 rounded mb-4 w-full text-black"
                    >
                        <option value={1}>Prioridade Baixa</option>
                        <option value={2}>Prioridade Média</option>
                        <option value={3}>Prioridade Alta</option>
                    </select>
                    <button
                        onClick={editingSchedule ? handleEditEvent : handleAddEvent}
                        className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded"
                    >
                        {editingSchedule ? 'Atualizar Evento' : 'Adicionar Evento'}
                    </button>
                </div>
            </div>

            {/* Lista de eventos */}
            <div className="mt-6">
                <h2 className="text-xl font-semibold mb-4">
                    Eventos para <span>{date ? formatDate(date) : ''}</span>
                </h2>

                {eventsForSelectedDate.length === 0 ? (
                    <p>Nenhum evento encontrado.</p>
                ) : (
                    eventsForSelectedDate.map(schedule => (
                        <div
                            key={schedule.id}
                            className="bg-white border rounded-lg shadow-md p-4 mb-4 text-black cursor-pointer hover:bg-gray-100"
                            onClick={() => handleScheduleClick(schedule)}
                        >
                            <div className="flex justify-between items-center">
                                <div className='w-1/2'>
                                    <h3 className="font-semibold text-lg text-black">{schedule.event}</h3>
                                    <p className="text-gray-500">
                                        {new Date(schedule.datetime).toLocaleString(locale)}
                                    </p>
                                </div>

                                <div
                                    className={`mt-2 p-2 text-white min-w-1 rounded ${schedule.priority === 1
                                        ? 'bg-green-500'
                                        : schedule.priority === 2
                                            ? 'bg-yellow-500'
                                            : 'bg-red-500'
                                        }`}
                                >
                                    {
                                        schedule.priority === 1
                                            ? 'Baixa'
                                            : schedule.priority === 2
                                                ? 'Média'
                                                : 'Alta'
                                    }
                                </div>
                                {/* Botão de Excluir com ícone */}
                                <button
                                    onClick={() => {
                                        setShowModal(true);
                                        setSelectedScheduleId(schedule.id!);
                                    }}
                                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full flex items-center justify-center"
                                >
                                    <TrashIcon className="h-5 w-5" />
                                </button>
                            </div >
                        </div >
                    ))
                )
                }
            </div >

            {/* Modal de confirmação de exclusão */}
            {
                showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg text-black w-1/3">
                            <h3 className="text-lg font-semibold mb-4">Confirmar exclusão</h3>
                            <p className="mb-4">Tem certeza que deseja excluir este evento?</p>
                            <div className="flex justify-end gap-4">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="bg-gray-500 hover:bg-gray-600 text-white p-2 rounded"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleDeleteEvent}
                                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded"
                                >
                                    Excluir
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
