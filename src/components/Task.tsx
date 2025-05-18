import { Component } from "preact";
import { invoke } from "@tauri-apps/api/core";

interface TaskProps {
    id: number;
    title: string;
    completed: boolean;
}

// Definimos una interfaz para el estado del componente
interface TaskState {
    isChecked: boolean;
    isVisible: boolean; // Estado para controlar si la tarea se muestra o no
}

export class Task extends Component<TaskProps, TaskState> {
    constructor(props: TaskProps) {
        super(props);
        // Inicializamos el estado del componente
        this.state = {
            isChecked: props.completed,
            isVisible: true, // La tarea es visible por defecto
        };
        // Hacemos "bind" de los métodos para asegurar el contexto correcto de 'this'
        this.updateTask = this.updateTask.bind(this);
        this.deleteTask = this.deleteTask.bind(this);
    }

    updateTask() {
        const newValue = !this.state.isChecked;
        // Actualizamos el estado local primero para una UI responsiva
        this.setState({ isChecked: newValue });

        invoke("update_task", {
            id: this.props.id,
            completada: newValue
        }).then(() => {
            console.log("Task updated successfully on the backend");
        }).catch(error => {
            console.error("Failed to update task:", error);
            // Si falla la actualización, revertimos el cambio en la UI
            this.setState({ isChecked: !newValue });
        });
    }

    deleteTask() {
        invoke("delete_task", {
            id: this.props.id
        }).then(() => {
            console.log("Task deleted successfully from the backend");
            // Una vez eliminada en el backend, actualizamos el estado para ocultar el componente
            this.setState({ isVisible: false });
        }).catch(error => {
            console.error("Failed to delete task:", error);
            // Aquí podrías manejar el error, por ejemplo, mostrando una notificación
        });
    }

    render() {
        // Si el estado isVisible es false, no renderizamos nada para este componente
        if (!this.state.isVisible) {
            return <></>;
        }

        const { title } = this.props;
        const { isChecked } = this.state; // Usamos isChecked del estado del componente

        return (
            <div class="flex align-middle gap-2 items-center">
                <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={this.updateTask}
                    class="form-checkbox h-5 w-5 text-blue-600"
                />
                <span class={`${isChecked ? "line-through text-gray-500" : "text-gray-700"}`}>{title}</span>
                <button
                    class="ml-auto bg-red-500 text-white p-1 rounded hover:bg-red-600 transition-all focus:outline-none"
                    onClick={this.deleteTask}
                    aria-label="Delete task"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        );
    }
}