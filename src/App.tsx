import {useState, useEffect, useRef} from "preact/hooks";
import {invoke} from "@tauri-apps/api/core";
import "./App.css";
import {Task} from "./components/Task.tsx";
import {Window} from '@tauri-apps/api/window';
import {TButton} from "./components/TButton.tsx";


function App() {
    const [name, setName] = useState("");
    const [tasks, setTasks] = useState<Task[]>([]);

    async function add_task(title: string) {
        await invoke("create_task", {titulo: title});
    }

    async function get_tasks() {
        try {
            const backendData: Array<{id: number; titulo: string; completada: boolean; }> = await invoke("fetch_tasks");

            const newListOfTasks = backendData.map(taskData => {
                return new Task({id: taskData.id, title: taskData.titulo, completed: taskData.completada});
            });

            setTasks(newListOfTasks);
        } catch (error) {
            console.error("Error al obtener las tareas:", error);
        }
    }

    async function toggleAlwaysOnTop() {
        const view = Window.getCurrent();
        const isAlwaysOnTop = await view.isAlwaysOnTop();
        await view.setAlwaysOnTop(!isAlwaysOnTop);
        console.log("Mode switched");
    }

    useEffect(() => {
        get_tasks().then(() => {
            console.log("Tasks loaded");
        });
    }, []);

    const inputRef = useRef<HTMLInputElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    return (
        <main className="flex flex-col p-5 w-full h-full"> {/* Añadido max-w-md */}
            <div className="flex flex-row justify-between w-full mb-3 items-center"> {/* Añadido items-center */}
                <h1 className="text-2xl font-bold">Mis tareas!</h1> {/* Estilo del encabezado */}
                <TButton icon={"fa-duotone fa-solid fa-square-up-right"} onClick={toggleAlwaysOnTop}/>
            </div>

            <form
                className="row flex flex-row mb-5"
                onSubmit={(e) => {
                    e.preventDefault();
                    add_task(name).then(() => {
                        get_tasks().then(() => {
                            console.log("Tasks loaded");
                            inputRef.current!.value = ''; // Limpia el input
                            buttonRef.current!.blur();    // Quita el foco del botón
                            setName('');                 // Limpia el estado 'name'
                        });
                    });
                }}
            >
                <input
                    ref={inputRef} // Crea una referencia al input
                    id="greet-input"
                    onInput={(e) => setName(e.currentTarget.value)}
                    placeholder="Nueva tarea..."
                    autocomplete={"off"}
                    className="border rounded-md p-2 focus:outline-none focus:ring focus:border-blue-500 w-full me-1" // Estilo del input
                />
                <button
                    ref={buttonRef}
                    className="bg-blue-600 text-white h-full rounded-md hover:bg-blue-500 cursor-pointer focus:bg-blue-700 aspect-square"
                    type="submit"
                >
                    <i className="fa-solid fa-plus fa-xl align-middle"></i>
                </button>
            </form>
            <div className="flex flex-col mt-2 gap-2">
                {tasks.map((task, index) => (
                    <Task key={index} id={task.props.id} title={task.props.title} completed={task.props.completed}/>
                ))}
            </div>
        </main>
    );
}

export default App;
