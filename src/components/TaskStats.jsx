
function TaskStats({ total, completed, remaining, progress }) {
    const stats = [
        {
            label: 'Total Tasks',
            value: total,
            icon: '▤',
            description: 'All your tasks',
            color: 'violet',
        },
        {
            label: 'Completed',
            value: completed,
            icon: '✓',
            description: 'Tasks finished',
            color: 'emerald',
        },
        {
            label: 'Remaining',
            value: remaining,
            icon: '◷',
            description: 'Still to do',
            color: 'sky',
        },
    ]

    const iconStyles = {
        violet: 'bg-violet-500/10 text-violet-400 ring-violet-500/20',
        emerald: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20',
        sky: 'bg-sky-500/10 text-sky-400 ring-sky-500/20',
    }

    const valueStyles = {
        violet: 'text-violet-400',
        emerald: 'text-emerald-400',
        sky: 'text-sky-400',
    }

    return (
        <section aria-label="Task statistics" className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {stats.map((stat) => (
                    <article
                        key={stat.label}
                        className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg shadow-black/5 transition duration-300 hover:-translate-y-1 hover:border-violet-500/40 hover:shadow-xl sm:p-6"
                    >
                        <div
                            aria-hidden="true"
                            className={`absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-30 blur-3xl ${stat.color === 'violet'
                                    ? 'bg-violet-500'
                                    : stat.color === 'emerald'
                                        ? 'bg-emerald-500'
                                        : 'bg-sky-500'
                                }`}
                        />

                        <div className="relative flex items-start justify-between gap-3">
                            <div>
                                <p className="text-sm font-medium text-slate-400">
                                    {stat.label}
                                </p>

                                <p
                                    className={`mt-4 text-4xl font-bold tracking-tight ${valueStyles[stat.color]}`}
                                >
                                    {stat.value}
                                </p>

                                <p className="mt-2 text-xs text-slate-500">
                                    {stat.description}
                                </p>
                            </div>

                            <div
                                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl font-semibold ring-1 ${iconStyles[stat.color]}`}
                                aria-hidden="true"
                            >
                                {stat.icon}
                            </div>
                        </div>

                        <div
                            className={`absolute bottom-0 left-0 h-0.5 w-full ${stat.color === 'violet'
                                    ? 'bg-violet-500/70'
                                    : stat.color === 'emerald'
                                        ? 'bg-emerald-500/70'
                                        : 'bg-sky-500/70'
                                }`}
                        />
                    </article>
                ))}
            </div>

            <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg shadow-black/5 sm:p-7">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-400">
                            Your productivity
                        </p>

                        <h2 className="mt-2 text-xl font-bold tracking-tight text-white sm:text-2xl">
                            Task Progress
                        </h2>

                        <p className="mt-2 text-sm text-slate-400">
                            {total === 0
                                ? 'Add a task to start tracking your progress.'
                                : completed === total
                                    ? 'Amazing! You completed every task.'
                                    : 'Keep going. Every completed task counts.'}
                        </p>
                    </div>

                    <div className="flex items-center gap-3 self-start rounded-2xl border border-violet-500/20 bg-violet-500/10 px-4 py-3 sm:self-auto">
                        <div>
                            <p className="text-xs font-medium text-violet-300">
                                Completion
                            </p>
                            <p className="mt-1 text-2xl font-bold text-violet-400">
                                {progress}%
                            </p>
                        </div>
                        <span className="text-2xl text-violet-400" aria-hidden="true">
                            ↗
                        </span>
                    </div>
                </div>

                <div
                    className="mt-7 h-3 overflow-hidden rounded-full bg-slate-800"
                    role="progressbar"
                    aria-label="Task completion progress"
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                >
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-600 via-violet-500 to-fuchsia-400 transition-all duration-700 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 text-sm">
                    <span className="text-slate-400">
                        {completed} of {total} completed
                    </span>
                    <span className="font-medium text-slate-300">
                        {remaining} remaining
                    </span>
                </div>
            </article>
        </section>
    )
}

export default TaskStats
