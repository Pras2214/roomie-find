import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../firebase/config'
import toast from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'
import IULogo from '../components/IULogo'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const navigate = useNavigate()

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (!form.email) return toast.error('Please enter your email')
    setLoading(true)
    try {
      await sendPasswordResetEmail(auth, form.email)
      setResetSent(true)
      toast.success('Password reset email sent!')
    } catch (err) {
      toast.error('Failed to send reset email: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, form.email, form.password)
      navigate('/browse')
    } catch (err) {
      toast.error('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-crimson-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md fade-in">
        <div className="text-center mb-8">
          <IULogo className="w-16 h-16 text-crimson-800 mx-auto mb-4" />
          <h1 className="font-display text-3xl font-bold text-crimson-900">RoomieFind IU</h1>
          <p className="text-gray-500 mt-1">Welcome back</p>
        </div>

        <div className="card p-8 shadow-xl shadow-crimson-100/50">
          {isForgotPassword ? (
            <div className="space-y-4 fade-in">
              <h2 className="font-display text-2xl font-bold text-crimson-900 mb-2">Reset Password</h2>
              <p className="text-sm text-gray-500 mb-6 border-b border-gray-100 pb-4">
                Enter your email and we'll send you a link to reset your password.
              </p>

              {resetSent ? (
                <div className="bg-green-50 text-green-800 p-4 rounded-xl border border-green-200">
                  <p className="font-medium text-sm">Check your inbox!</p>
                  <p className="text-xs mt-1">If an account exists with this email, you will receive a reset link shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <label className="label">Email</label>
                    <input
                      type="email"
                      className="input-field"
                      placeholder="jsmith@iu.edu"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-crimson w-full mt-2 disabled:opacity-60"
                  >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </form>
              )}

              <div className="text-center mt-6">
                <button
                  onClick={() => { setIsForgotPassword(false); setResetSent(false); }}
                  className="text-sm font-semibold text-gray-500 hover:text-crimson-700 hover:underline"
                >
                  Back to Sign In
                </button>
              </div>
            </div>
          ) : (
            <div className="fade-in">
              <h2 className="font-display text-2xl font-bold text-crimson-900 mb-6">Sign In</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    className="input-field"
                    placeholder="jsmith@iu.edu"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="label mb-0">Password</label>
                    <button
                      type="button"
                      onClick={() => setIsForgotPassword(true)}
                      className="text-xs text-crimson-600 font-semibold hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      className="input-field pr-12"
                      placeholder="Your password"
                      value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-crimson w-full mt-2 disabled:opacity-60"
                >
                  {loading ? 'Signing in...' : 'Sign In →'}
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-6">
                Don't have an account?{' '}
                <Link to="/register" className="text-crimson-700 font-semibold hover:underline">
                  Register
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
