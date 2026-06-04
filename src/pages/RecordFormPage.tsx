import { useEffect } from 'react'
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert } from '@/components/ui/alert'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { MarkdownEditor } from '@/features/wiki/components/MarkdownEditor'
import { wikiApi } from '@/features/wiki/wikiApi'
import { useRole } from '@/features/wiki/useRole'
import { ROUTES } from '@/router/routes'

const schema = z.object({
  title: z.string().min(3, 'Titel muss mindestens 3 Zeichen haben.').max(200, 'Titel darf maximal 200 Zeichen haben.'),
  content: z.string().min(10, 'Inhalt muss mindestens 10 Zeichen haben.'),
})

type FormValues = z.infer<typeof schema>

function FormSkeleton() {
  return (
    <div className="space-y-6 animate-pulse max-w-3xl">
      <div className="h-8 bg-muted rounded w-1/3" />
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded w-16" />
        <div className="h-9 bg-muted rounded" />
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded w-16" />
        <div className="h-48 bg-muted rounded" />
      </div>
    </div>
  )
}

export function RecordFormPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const isEditing = !!id
  const recordId = id ? Number(id) : undefined
  const parentDirectoryId = searchParams.get('parentId') ? Number(searchParams.get('parentId')) : undefined

  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { canCreateRecord, canEditRecord } = useRole()

  const { data: record, isLoading } = useQuery({
    queryKey: ['record', recordId],
    queryFn: () => wikiApi.getRecord(recordId!),
    enabled: isEditing && !isNaN(recordId!),
  })

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', content: '' },
  })

  useEffect(() => {
    if (record) {
      form.reset({ title: record.title, content: record.content })
    }
  }, [record, form])

  const createMutation = useMutation({
    mutationFn: (values: FormValues) =>
      wikiApi.createRecord({ title: values.title, content: values.content, parentDirectoryId: parentDirectoryId! }),
    onSuccess: (newRecord) => {
      queryClient.invalidateQueries({ queryKey: ['directory', parentDirectoryId] })
      navigate(ROUTES.RECORD(newRecord.id))
    },
  })

  const editMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const titleChanged = values.title !== record?.title
      const contentChanged = values.content !== record?.content
      if (!titleChanged && !contentChanged) return null
      if (titleChanged) await wikiApi.updateRecord(recordId!, values.title)
      if (contentChanged) await wikiApi.updateRecordContent(recordId!, values.content)
      return null
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['record', recordId] })
      navigate(ROUTES.RECORD(recordId!))
    },
  })

  if (!isEditing && !canCreateRecord()) return <Navigate to={ROUTES.HOME} replace />
  if (isEditing && !canEditRecord()) return <Navigate to={ROUTES.RECORD(recordId!)} replace />
  if (isLoading) return <FormSkeleton />

  const mutation = isEditing ? editMutation : createMutation
  const isError = mutation.isError
  const isPending = mutation.isPending

  const onSubmit = (values: FormValues) => {
    mutation.mutate(values)
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold">
        {isEditing ? 'Eintrag bearbeiten' : 'Neuer Eintrag'}
      </h1>

      {isError && (
        <Alert variant="destructive">
          Eintrag konnte nicht gespeichert werden. Bitte später erneut versuchen.
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
            <FormLabel>Inhalt</FormLabel>
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
