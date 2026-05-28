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

const registerSchema = z
  .object({
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
    confirmPassword: z.string().min(1, 'Passwort bestätigen ist erforderlich'),
    email: z.string().email('Ungültige E-Mail-Adresse').max(100, 'Maximal 100 Zeichen'),
    firstName: z.string().min(1, 'Vorname ist erforderlich').max(100, 'Maximal 100 Zeichen'),
    lastName: z.string().min(1, 'Nachname ist erforderlich').max(100, 'Maximal 100 Zeichen'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwörter stimmen nicht überein',
    path: ['confirmPassword'],
  })

type RegisterFormValues = z.infer<typeof registerSchema>

export function RegisterForm() {
  const navigate = useNavigate()
  const [apiError, setApiError] = useState<string | null>(null)

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: '', password: '', confirmPassword: '', email: '', firstName: '', lastName: '' },
  })

  const onSubmit = async (values: RegisterFormValues) => {
    setApiError(null)
    try {
      await authApi.register({
        validationCredentialsRequest: {
          username: values.username,
          password: values.password,
          confirmPassword: values.confirmPassword,
        },
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
      })
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

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vorname</FormLabel>
                <FormControl>
                  <Input placeholder="Max" autoComplete="given-name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nachname</FormLabel>
                <FormControl>
                  <Input placeholder="Mustermann" autoComplete="family-name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Passwort bestätigen</FormLabel>
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
