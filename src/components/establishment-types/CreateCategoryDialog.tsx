'use client'

import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { AlertCircle, Check, Loader2 } from 'lucide-react'

// Lista de ícones emoji comuns para categorias de estabelecimento
const EMOJI_OPTIONS = [
  { emoji: '🍕', name: 'Pizza' },
  { emoji: '🍔', name: 'Hambúrguer' },
  { emoji: '🍗', name: 'Frango' },
  { emoji: '🍣', name: 'Sushi' },
  { emoji: '🍲', name: 'Refeição' },
  { emoji: '🍝', name: 'Massa' },
  { emoji: '🥙', name: 'Kebab' },
  { emoji: '🍰', name: 'Doce' },
  { emoji: '🧁', name: 'Confeitaria' },
  { emoji: '🍦', name: 'Sorvete' },
  { emoji: '☕', name: 'Café' },
  { emoji: '🥗', name: 'Salada' },
  { emoji: '🍹', name: 'Bebidas' },
  { emoji: '🥤', name: 'Bebidas rápidas' },
  { emoji: '🛒', name: 'Mercado' },
  { emoji: '🏪', name: 'Loja' },
  { emoji: '💊', name: 'Farmácia' },
  { emoji: '📦', name: 'Pacote' },
  { emoji: '📝', name: 'Documento' },
  { emoji: '💼', name: 'Trabalho' },
];

const categorySchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
  emoji: z.string().min(1, 'Selecione um emoji'), 
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CreateCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCategoryCreated: (category: { id: string; name: string; emoji: string }) => void;
  searchTerm?: string;
}

export function CreateCategoryDialog({ 
  open, 
  onOpenChange, 
  onCategoryCreated,
  searchTerm = '' 
}: CreateCategoryDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState<string>('');
  
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: searchTerm,
      emoji: '',
    },
  });

  const handleEmojiSelect = (emoji: string) => {
    setSelectedEmoji(emoji);
    form.setValue('emoji', emoji);
  };

  const onSubmit = async (values: CategoryFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Obter organização do usuário logado
      const { data: { user } } = await supabase.auth.getUser();
      
      // Se não houver usuário, não podemos continuar
      if (!user) {
        toast.error('Usuário não autenticado');
        return;
      }

      const { data: userOrgs } = await supabase
        .from('user_organizations')
        .select('organization_id')
        .eq('user_id', user.id)
        .limit(1);
        
      if (!userOrgs || userOrgs.length === 0) {
        toast.error('Usuário não possui organização');
        return;
      }
      
      const organizationId = userOrgs[0].organization_id;

      // Inserir nova categoria
      const { data, error } = await supabase
        .from('establishment_types')
        .insert({
          name: values.name,
          emoji: values.emoji,
          icon_url: '', // Placeholder para um ícone padrão
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast.success('Categoria criada com sucesso!');
      
      if (data) {
        onCategoryCreated({
          id: data.id,
          name: data.name,
          emoji: data.emoji,
        });
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      toast.error('Erro ao criar categoria');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Categoria</DialogTitle>
          <DialogDescription>
            Cadastre uma nova categoria de estabelecimento
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            {/* Nome da categoria */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Categoria</Label>
              <Input
                id="name"
                placeholder="Ex: Restaurante, Farmácia, Mercado..."
                {...form.register('name')}
                autoFocus
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
              )}
            </div>

            {/* Seleção de Emoji */}
            <div className="space-y-2">
              <Label>Ícone</Label>
              <input type="hidden" {...form.register('emoji')} />

              <div className="grid grid-cols-5 gap-2 mt-2">
                {EMOJI_OPTIONS.map((option) => (
                  <button
                    key={option.emoji}
                    type="button"
                    onClick={() => handleEmojiSelect(option.emoji)}
                    className={`
                      h-10 text-xl flex items-center justify-center rounded-md
                      ${selectedEmoji === option.emoji 
                        ? 'bg-blue-100 border-2 border-blue-500' 
                        : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'}
                    `}
                    title={option.name}
                  >
                    {option.emoji}
                  </button>
                ))}
              </div>
              {form.formState.errors.emoji && (
                <p className="text-sm text-red-500">{form.formState.errors.emoji.message}</p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="gap-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Salvar Categoria
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}