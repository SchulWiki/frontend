import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { authApi } from '@/features/auth/authApi'
import { useAuth } from '@/features/auth/useAuth'

const ROLE_LABELS: Record<string, string> = {
  GUEST: 'Gast',
  EDITOR: 'Redakteur',
  ADMIN: 'Administrator',
  SYS_ADMIN: 'System-Admin',
}

function getInitials(firstName?: string, lastName?: string): string {
  const f = firstName?.charAt(0)?.toUpperCase() ?? ''
  const l = lastName?.charAt(0)?.toUpperCase() ?? ''
  return (f + l) || '?'
}

const nameSchema = z.object({
  firstName: z.string().min(1, 'Dieses Feld ist erforderlich.').max(100),
  lastName: z.string().min(1, 'Dieses Feld ist erforderlich.').max(100),
})
type NameFormValues = z.infer<typeof nameSchema>

const identitySchema = z.object({
  username: z.string().min(1, 'Dieses Feld ist erforderlich.').max(50),
  email: z.string().email('Ungültige E-Mail-Adresse.').max(100),
})
type IdentityFormValues = z.infer<typeof identitySchema>

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Aktuelles Passwort erforderlich.'),
    newPassword: z
      .string()
      .min(12, 'Mindestens 12 Zeichen erforderlich.')
      .regex(/[a-zA-Z]/, 'Mindestens 1 Buchstabe erforderlich.')
      .regex(/[0-9]/, 'Mindestens 1 Zahl erforderlich.')
      .regex(/[@$!%*#?&_-]/, 'Mindestens 1 Sonderzeichen (@$!%*#?&_-) erforderlich.'),
    confirmPassword: z.string().min(1, 'Passwort bestätigen ist erforderlich.'),
  })
  .refine((d) => d.newPassword !== d.currentPassword, {
    message: 'Neues Passwort darf nicht mit dem aktuellen übereinstimmen.',
    path: ['newPassword'],
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwörter stimmen nicht überein.',
    path: ['confirmPassword'],
  })
type PasswordFormValues = z.infer<typeof passwordSchema>

function NameSection() {
  const { user, refreshUser } = useAuth()
  const [success, setSuccess] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const form = useForm<NameFormValues>({
    resolver: zodResolver(nameSchema),
    defaultValues: { firstName: user?.firstName ?? '', lastName: user?.lastName ?? '' },
  })

  const onSubmit = async (values: NameFormValues) => {
    if (!user) return
    setApiError(null)
    setSuccess(false)
    try {
      await authApi.updateProfile(user.id, values)
      await refreshUser()
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch {
      setApiError('Name konnte nicht gespeichert werden.')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Name</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {apiError && <Alert variant="destructive">{apiError}</Alert>}
        {success && <p className="text-sm text-green-600">Gespeichert!</p>}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vorname</FormLabel>
                    <FormControl>
                      <Input placeholder="Vorname" {...field} />
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
                      <Input placeholder="Nachname" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Speichern…' : 'Speichern'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

function IdentitySection() {
  const { user, refreshUser } = useAuth()
  const [success, setSuccess] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const form = useForm<IdentityFormValues>({
    resolver: zodResolver(identitySchema),
    defaultValues: { username: user?.username ?? '', email: user?.email ?? '' },
  })

  const onSubmit = async (values: IdentityFormValues) => {
    if (!user) return
    setApiError(null)
    setSuccess(false)
    try {
      await authApi.updateIdentity(user.id, values)
      await refreshUser()
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch {
      setApiError('Konto konnte nicht gespeichert werden.')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Konto</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {apiError && <Alert variant="destructive">{apiError}</Alert>}
        {success && <p className="text-sm text-green-600">Gespeichert!</p>}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Benutzername</FormLabel>
                  <FormControl>
                    <Input placeholder="Benutzername" autoComplete="username" {...field} />
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
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Speichern…' : 'Speichern'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

function PasswordSection() {
  const { user } = useAuth()
  const [success, setSuccess] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })

  const onSubmit = async (values: PasswordFormValues) => {
    if (!user) return
    setApiError(null)
    setSuccess(false)
    try {
      await authApi.updatePassword(user.id, {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })
      setSuccess(true)
      form.reset()
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 401) {
        setApiError('Aktuelles Passwort ist falsch.')
      } else {
        setApiError('Passwort konnte nicht geändert werden.')
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Passwort ändern</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {apiError && <Alert variant="destructive">{apiError}</Alert>}
        {success && <p className="text-sm text-green-600">Passwort erfolgreich geändert.</p>}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Aktuelles Passwort</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="current-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Neues Passwort</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="new-password" {...field} />
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
                    <Input type="password" autoComplete="new-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Speichern…' : 'Speichern'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export function ProfilePage() {
  const { user } = useAuth()

  const initials = getInitials(user?.firstName, user?.lastName)
  const roleLabel = user ? (ROLE_LABELS[user.role] ?? user.role) : ''

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">Mein Profil</h1>

      {/* Avatar + Role */}
      <div className="flex flex-col items-center gap-3 py-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold select-none">
          {initials}
        </div>
        <span className="rounded-full border px-3 py-0.5 text-sm font-medium text-muted-foreground">
          {roleLabel}
        </span>
      </div>

      <NameSection />
      <IdentitySection />
      <PasswordSection />
    </div>
  )
}
