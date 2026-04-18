import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginUser } from '../api/authApi.js'
import { useAuth } from '../hooks/useAuth.jsx'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Email and password are required.')
      return
    }

    try {
      const result = await loginUser({ email, password })
      login({ token: result.token, user: result.user })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.message || 'Unable to login at this time.')
    }
  }

  const fillDemoCredentials = (demo) => {
    setEmail(demo.email)
    setPassword(demo.password)
    
    // Show notification popup
    const notification = document.createElement('div')
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity duration-300'
    notification.textContent = `Demo credentials filled for ${demo.name}`
    document.body.appendChild(notification)
    
    setTimeout(() => {
      notification.style.opacity = '0'
      setTimeout(() => {
        document.body.removeChild(notification)
      }, 300)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">Login</h1>
        <p className="mt-2 text-sm text-slate-600">Enter your credentials to continue.</p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-slate-500">Demo credentials</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fillDemoCredentials({ name: 'admin', email: 'admin@smartseason.com', password: 'admin123' })}
              className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Use admin demo
            </button>
            <button
              type="button"
              onClick={() => fillDemoCredentials({ name: 'agent', email: 'agent@smartseason.com', password: 'agent123' })}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              Use agent demo
            </button>
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                placeholder="you@example.com"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                placeholder="••••••••"
              />
            </label>
          </div>

          {error && <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Continue
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          New to the app?{' '}
          <Link to="/register" className="font-semibold text-slate-900 underline offset-2 hover:text-slate-700">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}
