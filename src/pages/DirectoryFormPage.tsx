import { useEffect } from 'react'
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert } from '@/components/ui/alert'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { wikiApi } from '@/features/wiki/wikiApi'
import { useRole } from '@/features/wiki/useRole'
import { ROUTES } from '@/router/routes'

const schema = z.object({
  name: z.string().min(1, 'Name ist erforderlich.').max(200, 'Name darf maximal 200 Zeichen haben.'),
})

type FormValues = z.infer<typeof schema>

export function DirectoryFormPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const isEditing = !!id
  const dirId = id ? Number(id) : undefined
  const parentDirectoryId = searchParams.get('parentId') ? Number(searchParams.get('parentId')) : undefined

  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { canManageDirectory } = useRole()

  const { data: directory, isLoading } = useQuery({
    queryKey: ['directory', dirId],
    queryFn: () => wikiApi.getDirectory(dirId!),
    enabled: isEditing && !isNaN(dirId!),
  })

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '' },
  })

  useEffect(() => {
    if (directory) {
      form.reset({ name: directory.name })
    }
  }, [directory, form])

  const createMutation = useMutation({
    mutationFn: (values: FormValues) =>
      wikiApi.createDirectory(values.name, parentDirectoryId!),
    onSuccess: (newDir) => {
      queryClient.invalidateQueries({ queryKey: ['directory', parentDirectoryId] })
      queryClient.invalidateQueries({ queryKey: ['directory', 'root'] })
      navigate(ROUTES.DIRECTORY(newDir.id))
    },
  })

  const editMutation = useMutation({
    mutationFn: (values: FormValues) => wikiApi.updateDirectory(dirId!, values.name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['directory', dirId] })
      navigate(ROUTES.DIRECTORY(dirId!))
    },
  })

  if (!canManageDirectory()) return <Navigate to={ROUTES.HOME} replace />
  if (isLoading) return null

  const mutation = isEditing ? editMutation : createMutation
  const isPending = mutation.isPending
  const isError = mutation.isError

  const onSubmit = (values: FormValues) => {
    mutation.mutate(values)
  }

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-2xl font-bold">
        {isEditing ? 'Verzeichnis umbenennen' : 'Neues Verzeichnis'}
      </h1>

      {isError && (
        <Alert variant="destructive">
          Verzeichnis konnte nicht gespeichert werden. Bitte später erneut versuchen.
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Verzeichnisname" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
