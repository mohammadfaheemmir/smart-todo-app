
import { useEffect, useState } from 'react'
import TaskStats from './components/TaskStats'
import TaskForm from './components/TaskForm'

function App() {
  const [tasks, setTasks] = useState(() => {
    try {
      const savedTasks = localStorage.getItem('smart-todo-tasks')
      return savedTasks ? JSON.parse(savedTasks) : []
    } catch {
      return []
    }
  })

  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('smart-todo-theme') === 'light'
        ? 'light'
        : 'dark'
    } catch {
      return 'dark'
    }
  })

  const [toast, setToast] = useState(null)

  useEffect(() => {
    try {
      localStorage.setItem('smart-todo-tasks', JSON.stringify(tasks))
    } catch {
      // The app remains usable if browser storage is unavailable.
    }
  }, [tasks])

  useEffect(() => {
    try {
      localStorage.setItem('smart-todo-theme', theme)
    } catch {
      // The selected theme still works for the current session.
    }
  }, [theme])

  useEffect(() => {
    if (!toast) return

    const timeoutId = setTimeout(() => {
      setToast(null)
    }, 3000)

    return () => clearTimeout(timeoutId)
  }, [toast])

  function showToast(message, type = 'success') {
    setToast({
      id: Date.now(),
      message,
      type,
    })
  }

  const total = tasks.length
  const completed = tasks.filter((task) => task.completed).length
  const remaining = total - completed
  const progress =
    total === 0 ? 0 : Math.round((completed / total) * 100)

  function addTask(taskText, dueDate = '', priority = 'medium') {
    const newTask = {
      id: crypto.randomUUID(),
      text: taskText,
      completed: false,
      dueDate,
      priority,
    }

    setTasks((currentTasks) => [...currentTasks, newTask])
    showToast('Task added successfully!')
  }

  function toggleTask(taskId) {
    const selectedTask = tasks.find((task) => task.id === taskId)

    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId
          ? { ...task, completed: !task.completed }
          : task
      )
    )

    if (selectedTask) {
      showToast(
        selectedTask.completed
          ? 'Task marked as active.'
          : 'Task completed!'
      )
    }
  }

  function deleteTask(taskId) {
    setTasks((currentTasks) =>
      currentTasks.filter((task) => task.id !== taskId)
    )
    showToast('Task deleted.')
  }

  function editTask(taskId, updatedText) {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId
          ? { ...task, text: updatedText }
          : task
      )
    )
    showToast('Task updated successfully!')
  }

  function clearCompletedTasks() {
    const completedCount = tasks.filter((task) => task.completed).length

    if (completedCount === 0) return

    setTasks((currentTasks) =>
      currentTasks.filter((task) => !task.completed)
    )

    showToast(
      `${completedCount} completed ${
        completedCount === 1 ? 'task' : 'tasks'
      } cleared.`
    )
  }

  function toggleTheme() {
    setTheme((currentTheme) =>
      currentTheme === 'dark' ? 'light' : 'dark'
    )
  }

  return (
    <div
      className={`app-theme min-h-screen px-4 py-6 text-white sm:px-6 sm:py-8 ${
        theme === 'light' ? 'light' : 'dark'
      }`}
    >
      <div className="mx-auto max-w-5xl">
        <header className="mb-9 flex flex-wrap items-center justify-between gap-5">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-2xl font-bold text-white shadow-lg shadow-violet-500/20 sm:h-14 sm:w-14"
              aria-hidden="true"
            >
              ✓
            </div>

            <div className="min-w-0">
              <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                Smart Todo
                <span className="text-violet-400">.</span>
              </h1>
              <p className="mt-1 text-sm text-slate-400 sm:text-base">
                A clearer mind starts with a plan.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${
              theme === 'dark' ? 'light' : 'dark'
            } mode`}
            className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:border-violet-500 hover:shadow-md"
          >
            <span aria-hidden="true" className="text-base">
              {theme === 'dark' ? '☀️' : '🌙'}
            </span>
            <span>
              {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </span>
          </button>
        </header>

        <main>
          <TaskStats
            total={total}
            completed={completed}
            remaining={remaining}
            progress={progress}
          />

          <TaskForm
            tasks={tasks}
            onAddTask={addTask}
            onToggleTask={toggleTask}
            onDeleteTask={deleteTask}
            onEditTask={editTask}
            onClearCompleted={clearCompletedTasks}
          />
        </main>

        <footer className="mt-10 border-t border-slate-800/80 py-5 text-center">
          <p className="text-xs text-slate-500 sm:text-sm">
            Built for focus. Designed for progress. @mohammadfaheemmir
          </p>
        </footer>
      </div>

      {toast && (
        <div
          key={toast.id}
          role="status"
          aria-live="polite"
          className={`fixed bottom-5 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 items-center gap-3 rounded-xl border px-4 py-3.5 shadow-2xl sm:bottom-6 ${
            theme === 'dark'
              ? 'border-slate-700 bg-slate-900 text-white'
              : 'border-slate-200 bg-white text-slate-900'
          }`}
        >
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
              toast.type === 'success'
                ? 'bg-emerald-500/15 text-emerald-500'
                : 'bg-red-500/15 text-red-500'
            }`}
            aria-hidden="true"
          >
            ✓
          </span>

          <p className="flex-1 text-sm font-medium">
            {toast.message}
          </p>

          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label="Dismiss notification"
            className="rounded-md px-2 py-1 text-lg opacity-60 transition hover:opacity-100"
          >
            ×
          </button>
        </div>
      )}
    </div>
  )
}

export default App
