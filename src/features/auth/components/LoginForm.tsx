import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useAuth } from '@/features/auth/useAuth'
import { ROUTES } from '@/router/routes'

const loginSchema = z.object({
  username: z.string().min(1, 'Benutzername ist erforderlich'),
  password: z.string().min(1, 'Passwort ist erforderlich'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [apiError, setApiError] = useState<string | null>(null)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  })

  const onSubmit = async (values: LoginFormValues) => {
    setApiError(null)
    try {
      await login(values.username, values.password)
      navigate(ROUTES.HOME)
    } catch {
      setApiError('Benutzername oder Passwort falsch')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {apiError && (
          <Alert variant="destructive">
            <AlertDescription>{apiError}</AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Benutzername</FormLabel>
              <FormControl>
                <Input placeholder="dein-benutzername" autoComplete="username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Passwort</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••••••" autoComplete="current-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Anmelden…' : 'Anmelden'}
        </Button>
      </form>
    </Form>
  )
}
