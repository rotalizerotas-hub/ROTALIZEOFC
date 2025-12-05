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
import { AlertCircle, Check, Loader2, Pizza, Beef, Wine, Droplets, Wrench, Scissors, Coffee, Salad, ShoppingCart, Store, Pill, Package, FileText, Briefcase, IceCream, Cake, Utensils, Fish, Sandwich, Candy } from 'lucide-react'

// Lista de ícones bonitos e realistas para categorias de estabelecimento
const ICON_OPTIONS = [
  { icon: Pizza, name: 'Pizza', iconName: 'Pizza' },
  { icon: Beef, name: 'Hambúrguer', iconName: 'Beef' },
  { icon: Utensils, name: 'Frango', iconName: 'Utensils' },
  { icon: Fish, name: 'Sushi', iconName: 'Fish' },
  { icon: Utensils, name: 'Refeição', iconName: 'Utensils' },
  { icon: Utensils, name: 'Massa', iconName: 'Utensils' },
  { icon: Sandwich, name: 'Kebab', iconName: 'Sandwich' },
  { icon: Cake, name: 'Doce', iconName: 'Cake' },
  { icon: Cake, name: 'Confeitaria', iconName: 'Cake' },
  { icon: IceCream, name: 'Sorvete', iconName: 'IceCream' },
  { icon: Coffee, name: 'Café', iconName: 'Coffee' },
  { icon: Salad, name: 'Salada', iconName: 'Salad' },
  { icon: Coffee, name: 'Bebidas', iconName: 'Coffee' },
  { icon: Coffee, name: 'Bebidas rápidas', iconName: 'Coffee' },
  { icon: ShoppingCart, name: 'Mercado', iconName: 'ShoppingCart' },
  { icon: Store, name: 'Loja', iconName: 'Store' },
  { icon: Pill, name: 'Farmácia', iconName: 'Pill' },
  { icon: Package, name: 'Pacote', iconName: 'Package' },
  { icon: FileText, name: 'Documento', iconName: 'FileText' },
  { icon: Briefcase, name: 'Trabalho', iconName: 'Briefcase' },
];

const categorySchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
  icon: z.string().min(1, 'Selecione um ícone'), 
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
  const [selectedIcon, setSelectedIcon] = useState<string>('');
  
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: searchTerm,
      icon: '',
    },
  });

  const handleIconSelect = (iconName: string) => {
    setSelectedIcon(iconName);
    form.setValue('icon', iconName);
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
          emoji: values.icon, // Agora salva o nome do ícone
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
          emoji: data.emoji, // Retorna o nome do ícone
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

            {/* Seleção de Ícone */}
            <div className="space-y-2">
              <Label>Ícone</Label>
              <input type="hidden" {...form.register('icon')} />

              <div className="grid grid-cols-5 gap-2 mt-2">
                {ICON_OPTIONS.map((option) => {
                  const IconComponent = option.icon;
                  return (
                    <button
                      key={option.iconName}
                      type="button"
                      onClick={() => handleIconSelect(option.iconName)}
                      className={`
                        h-12 w-12 flex items-center justify-center rounded-lg transition-all duration-200
                        ${selectedIcon === option.iconName 
                          ? 'bg-blue-100 border-2 border-blue-500 shadow-md' 
                          : 'bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:border-gray-300'}
                      `}
                      title={option.name}
                    >
                      <IconComponent className="h-6 w-6 text-gray-700" />
                    </button>
                  );
                })}
              </div>
              {form.formState.errors.icon && (
                <p className="text-sm text-red-500">{form.formState.errors.icon.message}</p>
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