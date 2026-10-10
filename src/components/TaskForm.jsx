
import { useEffect, useMemo, useRef, useState } from 'react'

const PRIORITIES = [
    { value: 'low', label: 'Low priority', dot: 'bg-emerald-400' },
    { value: 'medium', label: 'Medium priority', dot: 'bg-amber-400' },
    { value: 'high', label: 'High priority', dot: 'bg-red-400' },
]

function PrioritySelect({ value, onChange }) {
    const [open, setOpen] = useState(false)
    const [activeIndex, setActiveIndex] = useState(
        Math.max(0, PRIORITIES.findIndex((item) => item.value === value))
    )
    const rootRef = useRef(null)
    const buttonRef = useRef(null)
    const optionRefs = useRef([])

    const selected =
        PRIORITIES.find((item) => item.value === value) || PRIORITIES[1]

    useEffect(() => {
        function handleOutsideClick(event) {
            if (!rootRef.current?.contains(event.target)) {
                setOpen(false)
            }
        }

        document.addEventListener('pointerdown', handleOutsideClick)
        return () =>
            document.removeEventListener('pointerdown', handleOutsideClick)
    }, [])

    useEffect(() => {
        if (open) {
            const index = Math.max(
                0,
                PRIORITIES.findIndex((item) => item.value === value)
            )
            setActiveIndex(index)
            optionRefs.current[index]?.focus()
        }
    }, [open, value])

    function choosePriority(item) {
        onChange(item.value)
        setOpen(false)
        buttonRef.current?.focus()
    }

    function handleKeyDown(event) {
        if (event.key === 'Escape') {
            event.preventDefault()
            setOpen(false)
            buttonRef.current?.focus()
            return
        }

        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault()

            if (!open) {
                setOpen(true)
                return
            }

            const direction = event.key === 'ArrowDown' ? 1 : -1
            const nextIndex =
                (activeIndex + direction + PRIORITIES.length) % PRIORITIES.length

            setActiveIndex(nextIndex)
            optionRefs.current[nextIndex]?.focus()
        }

        if (event.key === 'Enter' || event.key === ' ') {
            if (open) {
                event.preventDefault()
                choosePriority(PRIORITIES[activeIndex])
            } else if (event.key === 'Enter') {
                event.preventDefault()
                setOpen(true)
            }
        }
    }

    return (
        <div ref={rootRef} className="relative min-w-0">
            <label
                htmlFor="task-priority"
                className="mb-2 block text-sm font-medium text-slate-300"
            >
                Priority level
            </label>

            <button
                ref={buttonRef}
                id="task-priority"
                type="button"
                aria-haspopup="listbox"
                aria-expanded={open}
                onClick={() => setOpen((previous) => !previous)}
                onKeyDown={handleKeyDown}
                className="flex min-h-[46px] w-full items-center justify-between gap-3 rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-left text-sm text-white outline-none transition hover:border-slate-600 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
            >
                <span className="flex min-w-0 items-center gap-2">
                    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${selected.dot}`} />
                    <span>{selected.label}</span>
                </span>

                <svg
                    aria-hidden="true"
                    viewBox="0 0 20 20"
                    fill="none"
                    className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''
                        }`}
                >
                    <path
                        d="m5 7.5 5 5 5-5"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </button>

            {open && (
                <div
                    role="listbox"
                    aria-label="Choose task priority"
                    className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-slate-700 bg-slate-950 p-1.5 shadow-2xl shadow-black/50"
                    onKeyDown={handleKeyDown}
                >
                    {PRIORITIES.map((item, index) => (
                        <button
                            key={item.value}
                            ref={(element) => {
                                optionRefs.current[index] = element
                            }}
                            type="button"
                            role="option"
                            aria-selected={value === item.value}
                            onClick={() => choosePriority(item)}
                            onMouseEnter={() => setActiveIndex(index)}
                            className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-3 text-left text-sm transition ${value === item.value
                                    ? 'bg-violet-500/15 text-violet-300'
                                    : 'text-slate-200 hover:bg-slate-800'
                                }`}
                        >
                            <span className="flex items-center gap-3">
                                <span className={`h-2.5 w-2.5 rounded-full ${item.dot}`} />
                                {item.label}
                            </span>

                            {value === item.value && (
                                <span aria-hidden="true" className="text-violet-400">
                                    ✓
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

function TaskForm({
    tasks,
    onAddTask,
    onToggleTask,
    onDeleteTask,
    onEditTask,
    onClearCompleted,
}) {
    const [task, setTask] = useState('')
    const [dueDate, setDueDate] = useState('')
    const [priority, setPriority] = useState('medium')
    const [filter, setFilter] = useState('all')
    const [search, setSearch] = useState('')
    const [sortBy, setSortBy] = useState('newest')
    const [editingTaskId, setEditingTaskId] = useState(null)
    const [editedText, setEditedText] = useState('')
    const [taskToDelete, setTaskToDelete] = useState(null)

    const today = new Date()
    const todayString = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, '0'),
        String(today.getDate()).padStart(2, '0'),
    ].join('-')

    const completedCount = tasks.filter((item) => item.completed).length

    useEffect(() => {
        if (!taskToDelete) return

        function handleKeyDown(event) {
            if (event.key === 'Escape') setTaskToDelete(null)
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [taskToDelete])

    const visibleTasks = useMemo(() => {
        const filtered = tasks.filter((item) => {
            const matchesFilter =
                filter === 'all' ||
                (filter === 'active' && !item.completed) ||
                (filter === 'completed' && item.completed)

            const matchesSearch = item.text
                .toLowerCase()
                .includes(search.trim().toLowerCase())

            return matchesFilter && matchesSearch
        })

        return filtered.sort((a, b) => {
            if (sortBy === 'oldest') {
                return tasks.indexOf(a) - tasks.indexOf(b)
            }

            if (sortBy === 'priority') {
                const priorityValue = { high: 3, medium: 2, low: 1 }
                return (
                    (priorityValue[b.priority] || 2) -
                    (priorityValue[a.priority] || 2)
                )
            }

            if (sortBy === 'dueDate') {
                if (!a.dueDate) return 1
                if (!b.dueDate) return -1
                return a.dueDate.localeCompare(b.dueDate)
            }

            return tasks.indexOf(b) - tasks.indexOf(a)
        })
    }, [tasks, filter, search, sortBy])

    function handleSubmit(event) {
        event.preventDefault()
        const trimmedTask = task.trim()
        if (!trimmedTask) return

        onAddTask(trimmedTask, dueDate, priority)
        setTask('')
        setDueDate('')
        setPriority('medium')
    }

    function startEditing(item) {
        setEditingTaskId(item.id)
        setEditedText(item.text)
    }

    function saveEdit(taskId) {
        const trimmedText = editedText.trim()
        if (!trimmedText) return

        onEditTask(taskId, trimmedText)
        setEditingTaskId(null)
        setEditedText('')
    }

    function cancelEdit() {
        setEditingTaskId(null)
        setEditedText('')
    }

    function confirmDelete() {
        if (!taskToDelete) return
        onDeleteTask(taskToDelete.id)
        setTaskToDelete(null)
    }

    function getPriorityStyles(level) {
        const styles = {
            high: 'border-red-500/20 bg-red-500/10 text-red-400',
            medium: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
            low: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
        }
        return styles[level] || styles.medium
    }

    return (
        <section className="mt-8 space-y-6">
            {/* Add task */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl shadow-black/5 sm:p-7">
                <div className="mb-6">
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-violet-400">
                        Stay organized
                    </p>
                    <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                        Create a new task
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                        Capture what needs to get done and make a plan.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label
                            htmlFor="task-input"
                            className="mb-2 block text-sm font-medium text-slate-300"
                        >
                            Task name
                        </label>
                        <input
                            id="task-input"
                            type="text"
                            value={task}
                            onChange={(event) => setTask(event.target.value)}
                            placeholder="e.g. Finish my React project"
                            maxLength={200}
                            required
                            className="block w-full min-w-0 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="min-w-0">
                            <label
                                htmlFor="due-date"
                                className="mb-2 block text-sm font-medium text-slate-300"
                            >
                                Due date
                            </label>
                            <input
                                id="due-date"
                                type="date"
                                value={dueDate}
                                min={todayString}
                                onChange={(event) => setDueDate(event.target.value)}
                                className="block w-full min-w-0 rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                            />
                        </div>

                        <PrioritySelect value={priority} onChange={setPriority} />
                    </div>

                    <button
                        type="submit"
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400 sm:w-auto"
                    >
                        <span className="text-lg leading-none">+</span>
                        Add task
                    </button>
                </form>
            </div>

            {/* Task list */}
            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl shadow-black/5">
                <div className="border-b border-slate-800 p-5 sm:p-7">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <div>
                            <h2 className="text-xl font-bold tracking-tight text-white">
                                Your tasks
                            </h2>
                            <p className="mt-1 text-sm text-slate-400">
                                {visibleTasks.length}{' '}
                                {visibleTasks.length === 1 ? 'task' : 'tasks'} shown
                                {' · '}
                                {completedCount} completed
                            </p>
                        </div>

                        {completedCount > 0 && (
                            <button
                                type="button"
                                onClick={onClearCompleted}
                                className="w-full rounded-xl border border-red-500/25 px-4 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/10 sm:w-auto"
                            >
                                Clear completed ({completedCount})
                            </button>
                        )}
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
                        <input
                            type="search"
                            aria-label="Search tasks"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search your tasks..."
                            className="block w-full min-w-0 rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-violet-500 md:col-span-1"
                        />

                        <select
                            aria-label="Filter tasks"
                            value={filter}
                            onChange={(event) => setFilter(event.target.value)}
                            className="block w-full min-w-0 rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-violet-500"
                        >
                            <option value="all">All tasks</option>
                            <option value="active">Active tasks</option>
                            <option value="completed">Completed tasks</option>
                        </select>

                        <select
                            aria-label="Sort tasks"
                            value={sortBy}
                            onChange={(event) => setSortBy(event.target.value)}
                            className="block w-full min-w-0 rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-violet-500"
                        >
                            <option value="newest">Newest first</option>
                            <option value="oldest">Oldest first</option>
                            <option value="priority">Highest priority</option>
                            <option value="dueDate">Earliest due date</option>
                        </select>
                    </div>
                </div>

                <div className="divide-y divide-slate-800">
                    {visibleTasks.length === 0 ? (
                        <div className="px-5 py-16 text-center sm:px-8">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-500/10 text-3xl">
                                {search || filter !== 'all' ? '⌕' : '✦'}
                            </div>
                            <h3 className="mt-5 text-base font-semibold text-white">
                                {search || filter !== 'all'
                                    ? 'No matching tasks'
                                    : 'Your day starts here'}
                            </h3>
                            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-400">
                                {search || filter !== 'all'
                                    ? 'Try another search term or change your filters.'
                                    : 'Add your first task above and start building momentum.'}
                            </p>
                        </div>
                    ) : (
                        visibleTasks.map((item) => {
                            const isOverdue =
                                item.dueDate &&
                                item.dueDate < todayString &&
                                !item.completed

                            return (
                                <article
                                    key={item.id}
                                    className={`group p-5 transition-colors hover:bg-slate-800/40 sm:px-7 ${item.completed ? 'opacity-75' : ''
                                        }`}
                                >
                                    <div className="flex items-start gap-3 sm:gap-4">
                                        <input
                                            type="checkbox"
                                            checked={item.completed}
                                            onChange={() => onToggleTask(item.id)}
                                            aria-label={`Mark "${item.text}" as ${item.completed ? 'active' : 'completed'
                                                }`}
                                            className="mt-1 h-5 w-5 shrink-0 cursor-pointer accent-violet-500"
                                        />

                                        <div className="min-w-0 flex-1">
                                            {editingTaskId === item.id ? (
                                                <form
                                                    onSubmit={(event) => {
                                                        event.preventDefault()
                                                        saveEdit(item.id)
                                                    }}
                                                    className="flex flex-col gap-3 sm:flex-row"
                                                >
                                                    <input
                                                        type="text"
                                                        value={editedText}
                                                        onChange={(event) =>
                                                            setEditedText(event.target.value)
                                                        }
                                                        aria-label="Edit task name"
                                                        maxLength={200}
                                                        autoFocus
                                                        required
                                                        className="min-w-0 flex-1 rounded-xl border border-violet-500 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:ring-4 focus:ring-violet-500/10"
                                                    />
                                                    <div className="flex gap-2">
                                                        <button
                                                            type="submit"
                                                            className="rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-500"
                                                        >
                                                            Save
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={cancelEdit}
                                                            className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </form>
                                            ) : (
                                                <>
                                                    <p
                                                        className={`break-words text-sm font-medium leading-6 sm:text-base ${item.completed
                                                                ? 'text-slate-500 line-through'
                                                                : 'text-white'
                                                            }`}
                                                    >
                                                        {item.text}
                                                    </p>

                                                    <div className="mt-3 flex flex-wrap items-center gap-2">
                                                        <span
                                                            className={`rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${getPriorityStyles(
                                                                item.priority
                                                            )}`}
                                                        >
                                                            {item.priority || 'medium'} priority
                                                        </span>

                                                        {item.dueDate && (
                                                            <span
                                                                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs ${isOverdue
                                                                        ? 'border-red-500/20 bg-red-500/10 text-red-400'
                                                                        : 'border-slate-700 bg-slate-800/70 text-slate-400'
                                                                    }`}
                                                            >
                                                                {isOverdue ? 'Overdue · ' : 'Due '}
                                                                {item.dueDate}
                                                            </span>
                                                        )}

                                                        {item.completed && (
                                                            <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                                                                ✓ Completed
                                                            </span>
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        {editingTaskId !== item.id && (
                                            <div className="flex shrink-0 items-center gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => startEditing(item)}
                                                    aria-label={`Edit "${item.text}"`}
                                                    title="Edit task"
                                                    className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-violet-500/10 hover:text-violet-400"
                                                >
                                                    ✎
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setTaskToDelete(item)}
                                                    aria-label={`Delete "${item.text}"`}
                                                    title="Delete task"
                                                    className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </article>
                            )
                        })
                    )}
                </div>
            </div>

            {/* Delete confirmation */}
            {taskToDelete && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
                    onClick={() => setTaskToDelete(null)}
                >
                    <div
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="delete-dialog-title"
                        aria-describedby="delete-dialog-description"
                        className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-2xl font-bold text-red-400">
                            !
                        </div>
                        <h2
                            id="delete-dialog-title"
                            className="text-xl font-bold text-white"
                        >
                            Delete this task?
                        </h2>
                        <p
                            id="delete-dialog-description"
                            className="mt-3 break-words text-sm leading-6 text-slate-400"
                        >
                            Are you sure you want to delete "{taskToDelete.text}"?
                            This action cannot be undone.
                        </p>
                        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => setTaskToDelete(null)}
                                className="rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmDelete}
                                className="rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-500"
                            >
                                Delete task
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    )
}

export default TaskForm
