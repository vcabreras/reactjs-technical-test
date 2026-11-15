import { zodResolver } from '@hookform/resolvers/zod';
import { Send } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { POST_BODY_MAX, POST_TITLE_MAX, type PostInput, PostInputSchema } from '@/api/schemas';
import { Button, Input, Textarea } from '@/components/ui';

interface PostFormProps {
  isSubmitting: boolean;
  /** Devuelve `true` si se creó: entonces se resetea; si falla se conservan los valores. */
  onSubmit: (values: PostInput) => Promise<boolean>;
}

const DEFAULT_VALUES: PostInput = { title: '', body: '' };

/**
 * Formulario de nueva publicación: React Hook Form + Zod (`PostInputSchema` es la única fuente
 * de validación y de tipos). Sin `maxLength` nativo: el contador y el error de Zod avisan.
 */
export function PostForm({ isSubmitting, onSubmit }: PostFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(PostInputSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const [title, body] = useWatch({ control, name: ['title', 'body'] });

  const submit = handleSubmit(async (values) => {
    if (await onSubmit(values)) {
      reset(DEFAULT_VALUES);
    }
  });

  return (
    <form
      className="card border-0 shadow-sm"
      onSubmit={(event) => void submit(event)}
      noValidate
      aria-label="Nueva publicación"
    >
      <div className="card-body">
        <Input
          label="Título"
          required
          autoComplete="off"
          error={errors.title?.message}
          characterCount={{ current: title.length, max: POST_TITLE_MAX }}
          {...register('title')}
        />
        <Textarea
          label="Texto"
          required
          rows={6}
          error={errors.body?.message}
          characterCount={{ current: body.length, max: POST_BODY_MAX }}
          {...register('body')}
        />
        <div className="d-flex justify-content-end">
          <Button type="submit" isLoading={isSubmitting} loadingText="Publicando…">
            <Send size={16} />
            Publicar
          </Button>
        </div>
      </div>
    </form>
  );
}
