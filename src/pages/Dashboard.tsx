import { useEffect, useState } from 'react';
import { getTasks, updateTaskStatus, deleteTask, createTask } from '../api/tasks';
import type { Task } from '../api/tasks';
import { Plus, Trash2, CheckCircle, Circle, Clock } from 'lucide-react';
import { useForm } from 'react-hook-form';

const Dashboard = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const fetchTasks = async () => {
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleStatusChange = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Completada' ? 'Pendiente' : 'Completada';
    await updateTaskStatus(id, newStatus);
    fetchTasks();
  };

  const handleDelete = async (id: string) => {
    await deleteTask(id);
    fetchTasks();
  };

  const onSubmit = async (data: any) => {
    // Asignar color según prioridad
    let color = '#3b82f6'; // por defecto Medio (Azul)
    if (data.priority === 'Alta') color = '#ef4444'; // Rojo
    if (data.priority === 'Baja') color = '#22c55e'; // Verde
    
    await createTask({ ...data, color });
    setShowModal(false);
    reset();
    fetchTasks();
  };

  if (loading) return <div>Cargando tareas...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Mis Tareas</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nueva Tarea
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tasks.map((task) => (
          <div key={task.id} className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border-l-4" style={{ borderColor: task.color || '#3b82f6' }}>
            <div className="flex justify-between items-start mb-2">
              <h3 className={`font-semibold text-lg ${task.status === 'Completada' ? 'line-through text-gray-500' : ''}`}>
                {task.title}
              </h3>
              <button onClick={() => handleDelete(task.id)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{task.description}</p>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <Clock className="w-4 h-4" />
              <span>{new Date(task.startTime).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-xs px-2 py-1 rounded-full ${
                task.priority === 'Alta' ? 'bg-red-100 text-red-700' : 
                task.priority === 'Media' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
              }`}>
                {task.priority}
              </span>
              <button onClick={() => handleStatusChange(task.id, task.status)} className="flex items-center gap-1 text-sm font-medium">
                {task.status === 'Completada' ? (
                  <span className="text-green-500 flex items-center gap-1"><CheckCircle className="w-5 h-5" /> Completada</span>
                ) : (
                  <span className="text-gray-500 flex items-center gap-1 hover:text-primary"><Circle className="w-5 h-5" /> Marcar lista</span>
                )}
              </button>
            </div>
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            No tienes tareas programadas. ¡Crea una nueva!
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Crear Nueva Tarea</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Título</label>
                <input {...register('title')} required className="w-full border rounded p-2 dark:bg-gray-700 dark:border-gray-600" />
              </div>
              <div>
                <label className="block text-sm mb-1">Descripción</label>
                <textarea {...register('description')} className="w-full border rounded p-2 dark:bg-gray-700 dark:border-gray-600" />
              </div>
              <div>
                <label className="block text-sm mb-1">Fecha y Hora</label>
                <input type="datetime-local" {...register('startTime')} required className="w-full border rounded p-2 dark:bg-gray-700 dark:border-gray-600" />
              </div>
              <div>
                <label className="block text-sm mb-1">Prioridad (Color automático)</label>
                <select {...register('priority')} className="w-full border rounded p-2 dark:bg-gray-700 dark:border-gray-600">
                  <option value="Baja">Baja (Verde)</option>
                  <option value="Media">Media (Azul)</option>
                  <option value="Alta">Alta (Rojo)</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
