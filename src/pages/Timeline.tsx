import React, { useEffect, useState, useCallback } from 'react';
import { ReactFlow, Background, Controls, useNodesState, useEdgesState, Position } from '@xyflow/react';
import type { Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { getTasks } from '../api/tasks';
import type { Task } from '../api/tasks';

const Timeline = () => {

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      const data = await getTasks();
      
      // Ordenar tareas por tiempo
      const sortedTasks = data.sort((a: Task, b: Task) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());


      const newNodes: Node[] = [];
      const newEdges: Edge[] = [];

      // Agrupar tareas por día
      const daysMap = new Map<string, Task[]>();
      sortedTasks.forEach((task: Task) => {
        const dayString = new Date(task.startTime).toLocaleDateString();
        if (!daysMap.has(dayString)) {
          daysMap.set(dayString, []);
        }
        daysMap.get(dayString)?.push(task);
      });

      let columnIndex = 0;
      
      daysMap.forEach((dayTasks, dayString) => {
        const xPos = columnIndex * 350 + 100;

        // Nodo Cabecera del Día
        newNodes.push({
          id: `day-${dayString}`,
          position: { x: xPos, y: 50 },
          data: { 
            label: (
              <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-full font-bold text-gray-800 dark:text-gray-200 border-2 border-gray-300 dark:border-gray-500">
                📅 {dayString}
              </div>
            )
          },
          type: 'default',
          draggable: false,
          style: { border: 'none', background: 'transparent', width: 'auto' }
        });

        // Nodos de tareas para este día
        dayTasks.forEach((task: Task, index: number) => {
          newNodes.push({
            id: task.id,
            position: { x: xPos, y: index * 150 + 150 },
            data: {
              taskData: task, // guardamos data para usar al hacer clic
              label: (
                <div className="p-3 w-64 text-left rounded shadow-md border-l-4 cursor-pointer hover:shadow-lg transition-shadow bg-white dark:bg-gray-800 dark:text-white" style={{ borderColor: task.color || '#3b82f6' }}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                      {new Date(task.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      task.priority === 'Alta' ? 'bg-red-100 text-red-700' : 
                      task.priority === 'Media' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                  <div className={`font-semibold ${task.status === 'Completada' ? 'line-through text-gray-400' : ''}`}>{task.title}</div>
                </div>
              )
            },
            targetPosition: Position.Top,
            sourcePosition: Position.Bottom,
            style: { border: 'none', background: 'transparent', width: 'auto' }
          });

          // Conectar tareas del mismo día secuencialmente
          if (index > 0) {
            newEdges.push({
              id: `e-${dayTasks[index - 1].id}-${task.id}`,
              source: dayTasks[index - 1].id,
              target: task.id,
              animated: true,
              style: { stroke: '#9ca3af', strokeWidth: 2 }
            });
          } else {
            // Conectar el día con la primera tarea
            newEdges.push({
              id: `e-day-${dayString}-${task.id}`,
              source: `day-${dayString}`,
              target: task.id,
              animated: false,
              style: { stroke: '#d1d5db', strokeWidth: 2, strokeDasharray: '5 5' }
            });
          }
        });

        columnIndex++;
      });

      setNodes(newNodes);
      setEdges(newEdges);
    };

    fetchTasks();
  }, [setNodes, setEdges]);

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    if (node.data && node.data.taskData) {
      setSelectedTask(node.data.taskData as Task);
    }
  }, []);

  return (
    <div className="h-full w-full relative">
      <div className="h-full w-full bg-white dark:bg-gray-800 rounded-xl shadow-inner border border-gray-200 dark:border-gray-700 overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          fitView
        >
          <Background color="#ccc" gap={16} />
          <Controls />
        </ReactFlow>
      </div>

      {/* Modal de Detalles de la Tarea */}
      {selectedTask && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-sm transform transition-all">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold dark:text-white pr-4">{selectedTask.title}</h3>
              <div className="w-4 h-4 rounded-full flex-shrink-0 mt-1" style={{ backgroundColor: selectedTask.color || '#3b82f6' }}></div>
            </div>
            
            <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <div>
                <strong className="block text-gray-500 dark:text-gray-400 text-xs uppercase">Descripción</strong>
                <p className="mt-1">{selectedTask.description || 'Sin descripción.'}</p>
              </div>
              
              <div className="flex justify-between">
                <div>
                  <strong className="block text-gray-500 dark:text-gray-400 text-xs uppercase">Fecha</strong>
                  <p>{new Date(selectedTask.startTime).toLocaleDateString()}</p>
                </div>
                <div>
                  <strong className="block text-gray-500 dark:text-gray-400 text-xs uppercase">Hora</strong>
                  <p>{new Date(selectedTask.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <div>
                  <strong className="block text-gray-500 dark:text-gray-400 text-xs uppercase">Prioridad</strong>
                  <p className="font-semibold">{selectedTask.priority}</p>
                </div>
                <div>
                  <strong className="block text-gray-500 dark:text-gray-400 text-xs uppercase">Estado</strong>
                  <p className="font-semibold">{selectedTask.status}</p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setSelectedTask(null)}
              className="mt-6 w-full py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white rounded-lg transition-colors font-medium"
            >
              Cerrar Detalles
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timeline;
