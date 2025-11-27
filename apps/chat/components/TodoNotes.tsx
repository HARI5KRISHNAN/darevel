import React, { useState, useEffect } from 'react';

interface TodoItem {
    id: string;
    text: string;
    completed: boolean;
    priority: 'low' | 'medium' | 'high';
    createdAt: Date;
}

interface TodoNotesProps {
    collapsed?: boolean;
}

const TodoNotes: React.FC<TodoNotesProps> = ({ collapsed = false }) => {
    const [todos, setTodos] = useState<TodoItem[]>([]);
    const [newTodo, setNewTodo] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        const saved = localStorage.getItem('chat-todos');
        if (saved) setTodos(JSON.parse(saved));
    }, []);

    useEffect(() => {
        localStorage.setItem('chat-todos', JSON.stringify(todos));
    }, [todos]);

    const addTodo = () => {
        if (!newTodo.trim()) return;
        setTodos([...todos, {
            id: Date.now().toString(),
            text: newTodo,
            completed: false,
            priority: 'medium',
            createdAt: new Date(),
        }]);
        setNewTodo('');
    };

    const toggleTodo = (id: string) => {
        setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const deleteTodo = (id: string) => {
        setTodos(todos.filter(t => t.id !== id));
    };

    const pendingCount = todos.filter(t => !t.completed).length;

    if (collapsed) {
        return (
            <div className="flex flex-col items-center gap-2">
                <button className="p-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg" title="To-Do Notes">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                </button>
                {pendingCount > 0 && <span className="text-xs text-yellow-400">{pendingCount}</span>}
            </div>
        );
    }

    return (
        <div className="bg-background-secondary rounded-lg p-3">
            <h3 className="text-sm font-semibold text-text-primary mb-3">To-Do Notes</h3>
            <div className="flex gap-2 mb-3">
                <input
                    type="text"
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addTodo()}
                    placeholder="Add a task..."
                    className="flex-1 bg-gray-700 text-white text-xs px-2 py-1 rounded border border-gray-600 focus:border-indigo-500 focus:outline-none"
                />
                <button onClick={addTodo} className="bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded text-xs">+</button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
                {todos.length === 0 ? (
                    <p className="text-xs text-text-secondary text-center py-4">No tasks yet</p>
                ) : todos.map(todo => (
                    <div key={todo.id} className={'flex items-center gap-2 bg-gray-700 rounded p-2 ' + (todo.completed ? 'opacity-50' : '')}>
                        <input type="checkbox" checked={todo.completed} onChange={() => toggleTodo(todo.id)} className="rounded" />
                        <span className={'flex-1 text-xs ' + (todo.completed ? 'line-through text-text-secondary' : 'text-text-primary')}>{todo.text}</span>
                        <button onClick={() => deleteTodo(todo.id)} className="text-red-400 hover:text-red-300 text-xs">x</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TodoNotes;
