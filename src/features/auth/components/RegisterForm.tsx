import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { authApi } from '@/features/auth/authApi'
import { ROUTES } from '@/router/routes'

const registerSchema = z.object({
  username: z
    .string()
    .min(5, 'Mindestens 5 Zeichen')
    .max(50, 'Maximal 50 Zeichen')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Nur Buchstaben, Zahlen, _ und - erlaubt'),
  password: z
    .string()
    .min(12, 'Mindestens 12 Zeichen')
    .regex(/[a-zA-Z]/, 'Mindestens 1 Buchstabe erforderlich')
    .regex(/[0-9]/, 'Mindestens 1 Zahl erforderlich')
    .regex(/[@$!%*#?&_-]/, 'Mindestens 1 Sonderzeichen (@$!%*#?&_-) erforderlich'),
  email: z.string().email('Ungültige E-Mail-Adresse').max(100, 'Maximal 100 Zeichen'),
})

type RegisterFormValues = z.infer<typeof registerSchema>

export function RegisterForm() {
  const navigate = useNavigate()
  const [apiError, setApiError] = useState<string | null>(null)

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: '', password: '', email: '' },
  })

  const onSubmit = async (values: RegisterFormValues) => {
    setApiError(null)
    try {
      await authApi.register(values)
      navigate(ROUTES.LOGIN, { state: { registered: true } })
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 409) {
        setApiError('Benutzername bereits vergeben. Bitte wähle einen anderen.')
      } else {
        setApiError('Registrierung fehlgeschlagen. Bitte versuche es erneut.')
      }
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-Mail-Adresse</FormLabel>
              <FormControl>
                <Input type="email" placeholder="name@schule.de" autoComplete="email" {...field} />
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
                <Input type="password" placeholder="••••••••••••" autoComplete="new-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Konto erstellen…' : 'Konto erstellen'}
        </Button>
      </form>
    </Form>
  )
}
