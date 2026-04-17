import { useAuth } from '../context/AuthContext.jsx'

export default function Dashboard() {
  const { logout, user } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Dashboard</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                Welcome back, {user?.name || user?.email}
              </h1>
            </div>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Sign out
            </button>
          </div>
          <p className="mt-4 max-w-2xl text-slate-600">
            This is the first authenticated screen. Later we will add admin and agent dashboards, field management, and update history.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-3">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Role</p>
            <p className="mt-3 text-2xl font-semibold text-slate-900">{user?.role}</p>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Email</p>
            <p className="mt-3 text-2xl font-semibold text-slate-900">{user?.email}</p>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">User ID</p>
            <p className="mt-3 overflow-hidden text-ellipsis whitespace-nowrap text-2xl font-semibold text-slate-900">{user?.id}</p>
          </article>
        </section>
      </div>
    </div>
  )
}
