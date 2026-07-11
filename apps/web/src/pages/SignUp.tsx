import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../components/AuthLayout'
import { useAuth } from '../context/AuthContext'
import { ApiRequestError } from '../lib/api'

const inputClassName =
  'w-full border border-black bg-white px-3 py-2 text-black placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-black'

type SignUpFormValues = {
  username: string
  email: string
  password: string
}

export function SignUp() {
  const navigate = useNavigate()
  const { signUp } = useAuth()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  })

  async function onSubmit(values: SignUpFormValues) {
    setSubmitError(null)

    try {
      await signUp(values.username, values.email, values.password)
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
      title="Sign up"
      footer={
        <>
          Already have an account?{' '}
          <Link
            to="/signin"
            className="text-black underline underline-offset-2"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <div>
          <label htmlFor="username" className="mb-1.5 block text-sm text-black">
            Username
          </label>
          <input
            id="username"
            type="text"
            autoComplete="username"
            className={inputClassName}
            aria-invalid={Boolean(errors.username)}
            {...register('username', {
              required: 'Username is required',
              minLength: {
                value: 3,
                message: 'Username must be at least 3 characters',
              },
              maxLength: {
                value: 32,
                message: 'Username must be at most 32 characters',
              },
              pattern: {
                value: /^[a-zA-Z0-9_]+$/,
                message: 'Username can only contain letters, numbers, and underscores',
              },
            })}
          />
          {errors.username ? (
            <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
          ) : null}
        </div>

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
            autoComplete="new-password"
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
          {isSubmitting ? 'Creating account...' : 'Sign up'}
        </button>
      </form>
    </AuthLayout>
  )
}
