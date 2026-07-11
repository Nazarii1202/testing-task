import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../components/AuthLayout'
import { useAuth } from '../context/AuthContext'
import { ApiRequestError } from '../lib/api'

const inputClassName =
  'w-full border border-black bg-white px-3 py-2 text-black placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-black'

type SignInFormValues = {
  email: string
  password: string
}

export function SignIn() {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormValues>({
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(values: SignInFormValues) {
    setSubmitError(null)

    try {
      await signIn(values.email, values.password)
      navigate('/')
    } catch (error) {
      if (error instanceof ApiRequestError) {
        setSubmitError(error.message)
        return
      }

      setSubmitError('Something went wrong. Please try again.')
    }
  }

  return (
    <AuthLayout
      title="Sign in"
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link
            to="/signup"
            className="text-black underline underline-offset-2"
          >
            Sign up
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm text-black">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className={inputClassName}
            aria-invalid={Boolean(errors.email)}
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Enter a valid email address',
              },
            })}
          />
          {errors.email ? (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm text-black">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className={inputClassName}
            aria-invalid={Boolean(errors.password)}
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 8,
                message: 'Password must be at least 8 characters',
              },
            })}
          />
          {errors.password ? (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          ) : null}
        </div>

        {submitError ? (
          <p className="text-sm text-red-600" role="alert">
            {submitError}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full border border-black bg-black px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </AuthLayout>
  )
}
