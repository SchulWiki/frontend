import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert } from '@/components/ui/alert'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { MarkdownEditor } from '@/features/wiki/components/MarkdownEditor'
import { wikiApi } from '@/features/wiki/wikiApi'
import { useRole } from '@/features/wiki/useRole'
import { ROUTES } from '@/router/routes'

const entrySchema = z.object({
  title: z.string().min(3, 'Titel muss mindestens 3 Zeichen haben.').max(200, 'Titel darf maximal 200 Zeichen haben.'),
  content: z.string().min(10, 'Inhalt muss mindestens 10 Zeichen haben.'),
})

type EntryFormValues = z.infer<typeof entrySchema>

export function EntryNewPage() {
  const { canCreate } = useRole()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchParams] = useSearchParams()

  const rawParentId = searchParams.get('parentId')
  const parentId = rawParentId ? Number(rawParentId) : null

  const form = useForm<EntryFormValues>({
    resolver: zodResolver(entrySchema),
    defaultValues: { title: '', content: '' },
  })

  const { mutate, isPending, isError } = useMutation({
    mutationFn: (values: EntryFormValues) =>
      wikiApi.createEntry({ title: values.title, content: values.content, parentId }),
    onSuccess: (newEntry) => {
      queryClient.invalidateQueries({ queryKey: ['entries', parentId] })
      navigate(ROUTES.ENTRY(newEntry.id))
    },
  })

  if (!canCreate()) {
    return <Navigate to={ROUTES.HOME} replace />
  }

  const onSubmit = (values: EntryFormValues) => {
    mutate(values, {})
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold">{parentId ? 'Kindelement erstellen' : 'Neuer Eintrag'}</h1>

      {isError && (
        <Alert variant="destructive">
          Eintrag konnte nicht erstellt werden. Bitte später erneut versuchen.
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Titel</FormLabel>
                <FormControl>
                  <Input placeholder="Titel des Eintrags" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormItem>
            <FormLabel htmlFor="content-editor">Inhalt</FormLabel>
            <Controller
              control={form.control}
              name="content"
              render={({ field }) => (
                <MarkdownEditor
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Inhalt in Markdown verfassen…"
                />
              )}
            />
            {form.formState.errors.content && (
              <p className="text-sm font-medium text-destructive">
                {form.formState.errors.content.message}
              </p>
            )}
          </FormItem>

          <div className="flex gap-3">
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Speichern…' : 'Speichern'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Abbrechen
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
