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

// Lista expandida de ícones emoji 3D e realistas para categorias de estabelecimento
const EMOJI_OPTIONS = [
  // Comidas - Principais
  { emoji: '🍕', name: 'Pizza' },
  { emoji: '🍔', name: 'Hambúrguer' },
  { emoji: '🍗', name: 'Frango' },
  { emoji: '🍖', name: 'Carne' },
  { emoji: '🥩', name: 'Açougue' },
  { emoji: '🍣', name: 'Sushi' },
  { emoji: '🍜', name: 'Ramen' },
  { emoji: '🍲', name: 'Refeição' },
  { emoji: '🍝', name: 'Massa' },
  { emoji: '🥙', name: 'Kebab' },
  { emoji: '🌮', name: 'Tacos' },
  { emoji: '🌯', name: 'Wrap' },
  { emoji: '🥪', name: 'Sanduíche' },
  { emoji: '🌭', name: 'Hot Dog' },
  { emoji: '🍳', name: 'Ovos' },
  { emoji: '🥓', name: 'Bacon' },
  { emoji: '🍤', name: 'Camarão' },
  { emoji: '🦞', name: 'Lagosta' },
  { emoji: '🐟', name: 'Peixe' },
  { emoji: '🦀', name: 'Caranguejo' },
  
  // Doces e Sobremesas
  { emoji: '🍰', name: 'Bolo' },
  { emoji: '🧁', name: 'Cupcake' },
  { emoji: '🍪', name: 'Biscoito' },
  { emoji: '🍩', name: 'Donut' },
  { emoji: '🍫', name: 'Chocolate' },
  { emoji: '🍬', name: 'Bala' },
  { emoji: '🍭', name: 'Pirulito' },
  { emoji: '🍮', name: 'Pudim' },
  { emoji: '🍯', name: 'Mel' },
  { emoji: '🧈', name: 'Manteiga' },
  
  // Sorvetes e Gelados
  { emoji: '🍦', name: 'Sorvete' },
  { emoji: '🍧', name: 'Raspadinha' },
  { emoji: '🍨', name: 'Gelato' },
  { emoji: '🥧', name: 'Torta' },
  
  // Bebidas
  { emoji: '☕', name: 'Café' },
  { emoji: '🍵', name: 'Chá' },
  { emoji: '🧋', name: 'Bubble Tea' },
  { emoji: '🥤', name: 'Refrigerante' },
  { emoji: '🧃', name: 'Suco' },
  { emoji: '🍹', name: 'Drink' },
  { emoji: '🍸', name: 'Coquetel' },
  { emoji: '🍺', name: 'Cerveja' },
  { emoji: '🍷', name: 'Vinho' },
  { emoji: '🥂', name: 'Champagne' },
  { emoji: '🍾', name: 'Espumante' },
  { emoji: '🥛', name: 'Leite' },
  { emoji: '🧊', name: 'Gelo' },
  
  // Saudável
  { emoji: '🥗', name: 'Salada' },
  { emoji: '🥑', name: 'Abacate' },
  { emoji: '🍎', name: 'Maçã' },
  { emoji: '🍌', name: 'Banana' },
  { emoji: '🍇', name: 'Uva' },
  { emoji: '🍓', name: 'Morango' },
  { emoji: '🥝', name: 'Kiwi' },
  { emoji: '🍑', name: 'Pêssego' },
  { emoji: '🍒', name: 'Cereja' },
  { emoji: '🍍', name: 'Abacaxi' },
  { emoji: '🥭', name: 'Manga' },
  { emoji: '🍊', name: 'Laranja' },
  { emoji: '🍋', name: 'Limão' },
  { emoji: '🥥', name: 'Coco' },
  { emoji: '🥕', name: 'Cenoura' },
  { emoji: '🌽', name: 'Milho' },
  { emoji: '🥒', name: 'Pepino' },
  { emoji: '🍅', name: 'Tomate' },
  { emoji: '🥬', name: 'Verduras' },
  { emoji: '🥦', name: 'Brócolis' },
  { emoji: '🧄', name: 'Alho' },
  { emoji: '🧅', name: 'Cebola' },
  
  // Padaria e Grãos
  { emoji: '🍞', name: 'Pão' },
  { emoji: '🥖', name: 'Baguete' },
  { emoji: '🥨', name: 'Pretzel' },
  { emoji: '🥯', name: 'Bagel' },
  { emoji: '🧇', name: 'Waffle' },
  { emoji: '🥞', name: 'Panqueca' },
  { emoji: '🍚', name: 'Arroz' },
  { emoji: '🍙', name: 'Onigiri' },
  { emoji: '🥜', name: 'Amendoim' },
  { emoji: '🌰', name: 'Castanha' },
  
  // Estabelecimentos e Serviços
  { emoji: '🛒', name: 'Supermercado' },
  { emoji: '🏪', name: 'Loja' },
  { emoji: '🏬', name: 'Shopping' },
  { emoji: '🏭', name: 'Fábrica' },
  { emoji: '🏢', name: 'Escritório' },
  { emoji: '🏦', name: 'Banco' },
  { emoji: '🏨', name: 'Hotel' },
  { emoji: '🏥', name: 'Hospital' },
  { emoji: '💊', name: 'Farmácia' },
  { emoji: '⚕️', name: 'Médico' },
  { emoji: '🩺', name: 'Clínica' },
  { emoji: '💉', name: 'Vacina' },
  { emoji: '🦷', name: 'Dentista' },
  { emoji: '👓', name: 'Ótica' },
  { emoji: '💄', name: 'Cosmético' },
  { emoji: '💅', name: 'Manicure' },
  { emoji: '💇', name: 'Cabeleireiro' },
  { emoji: '🧴', name: 'Perfumaria' },
  
  // Transporte e Entrega
  { emoji: '📦', name: 'Pacote' },
  { emoji: '📮', name: 'Correio' },
  { emoji: '🚚', name: 'Caminhão' },
  { emoji: '🛵', name: 'Moto' },
  { emoji: '🚗', name: 'Carro' },
  { emoji: '🚕', name: 'Táxi' },
  { emoji: '🚌', name: 'Ônibus' },
  { emoji: '🚲', name: 'Bicicleta' },
  { emoji: '🛴', name: 'Patinete' },
  { emoji: '⛽', name: 'Posto' },
  { emoji: '🔧', name: 'Mecânica' },
  { emoji: '🛠️', name: 'Ferramentas' },
  
  // Documentos e Serviços
  { emoji: '📝', name: 'Documento' },
  { emoji: '📋', name: 'Formulário' },
  { emoji: '📄', name: 'Papel' },
  { emoji: '📊', name: 'Relatório' },
  { emoji: '💼', name: 'Trabalho' },
  { emoji: '💻', name: 'Computador' },
  { emoji: '📱', name: 'Celular' },
  { emoji: '⌚', name: 'Relógio' },
  { emoji: '📷', name: 'Foto' },
  { emoji: '🎥', name: 'Vídeo' },
  { emoji: '🎵', name: 'Música' },
  { emoji: '🎮', name: 'Games' },
  { emoji: '🎲', name: 'Jogos' },
  { emoji: '🎯', name: 'Alvo' },
  
  // Casa e Decoração
  { emoji: '🏠', name: 'Casa' },
  { emoji: '🏡', name: 'Residência' },
  { emoji: '🛏️', name: 'Cama' },
  { emoji: '🛋️', name: 'Sofá' },
  { emoji: '🪑', name: 'Cadeira' },
  { emoji: '🚪', name: 'Porta' },
  { emoji: '🪟', name: 'Janela' },
  { emoji: '💡', name: 'Lâmpada' },
  { emoji: '🕯️', name: 'Vela' },
  { emoji: '🧹', name: 'Limpeza' },
  { emoji: '🧽', name: 'Esponja' },
  { emoji: '🧴', name: 'Produto' },
  
  // Roupas e Acessórios
  { emoji: '👕', name: 'Camiseta' },
  { emoji: '👔', name: 'Gravata' },
  { emoji: '👗', name: 'Vestido' },
  { emoji: '👠', name: 'Sapato' },
  { emoji: '👟', name: 'Tênis' },
  { emoji: '🧥', name: 'Jaqueta' },
  { emoji: '👜', name: 'Bolsa' },
  { emoji: '🎒', name: 'Mochila' },
  { emoji: '👑', name: 'Coroa' },
  { emoji: '💍', name: 'Anel' },
  { emoji: '📿', name: 'Colar' },
  { emoji: '⌚', name: 'Relógio' },
  
  // Esportes e Fitness
  { emoji: '⚽', name: 'Futebol' },
  { emoji: '🏀', name: 'Basquete' },
  { emoji: '🏈', name: 'Football' },
  { emoji: '🎾', name: 'Tênis' },
  { emoji: '🏐', name: 'Vôlei' },
  { emoji: '🏓', name: 'Ping Pong' },
  { emoji: '🥊', name: 'Boxe' },
  { emoji: '🏋️', name: 'Academia' },
  { emoji: '🤸', name: 'Ginástica' },
  { emoji: '🧘', name: 'Yoga' },
  { emoji: '🏃', name: 'Corrida' },
  { emoji: '🚴', name: 'Ciclismo' },
  { emoji: '🏊', name: 'Natação' },
  
  // Animais e Pets
  { emoji: '🐶', name: 'Cachorro' },
  { emoji: '🐱', name: 'Gato' },
  { emoji: '🐭', name: 'Rato' },
  { emoji: '🐹', name: 'Hamster' },
  { emoji: '🐰', name: 'Coelho' },
  { emoji: '🦊', name: 'Raposa' },
  { emoji: '🐻', name: 'Urso' },
  { emoji: '🐼', name: 'Panda' },
  { emoji: '🐨', name: 'Coala' },
  { emoji: '🐯', name: 'Tigre' },
  { emoji: '🦁', name: 'Leão' },
  { emoji: '🐮', name: 'Vaca' },
  { emoji: '🐷', name: 'Porco' },
  { emoji: '🐸', name: 'Sapo' },
  { emoji: '🐵', name: 'Macaco' },
  { emoji: '🦆', name: 'Pato' },
  { emoji: '🐧', name: 'Pinguim' },
  { emoji: '🦅', name: 'Águia' },
  { emoji: '🦉', name: 'Coruja' },
  { emoji: '🐝', name: 'Abelha' },
  { emoji: '🦋', name: 'Borboleta' },
  { emoji: '🐛', name: 'Inseto' },
  
  // Natureza
  { emoji: '🌳', name: 'Árvore' },
  { emoji: '🌲', name: 'Pinheiro' },
  { emoji: '🌴', name: 'Palmeira' },
  { emoji: '🌵', name: 'Cacto' },
  { emoji: '🌸', name: 'Flor' },
  { emoji: '🌺', name: 'Hibisco' },
  { emoji: '🌻', name: 'Girassol' },
  { emoji: '🌹', name: 'Rosa' },
  { emoji: '🌷', name: 'Tulipa' },
  { emoji: '🌿', name: 'Folha' },
  { emoji: '☘️', name: 'Trevo' },
  { emoji: '🍀', name: 'Sorte' },
  { emoji: '🌾', name: 'Trigo' },
  
  // Símbolos e Outros
  { emoji: '⭐', name: 'Estrela' },
  { emoji: '✨', name: 'Brilho' },
  { emoji: '🔥', name: 'Fogo' },
  { emoji: '💧', name: 'Água' },
  { emoji: '⚡', name: 'Energia' },
  { emoji: '🌈', name: 'Arco-íris' },
  { emoji: '☀️', name: 'Sol' },
  { emoji: '🌙', name: 'Lua' },
  { emoji: '⭐', name: 'Estrela' },
  { emoji: '💎', name: 'Diamante' },
  { emoji: '🎁', name: 'Presente' },
  { emoji: '🎉', name: 'Festa' },
  { emoji: '🎊', name: 'Confete' },
  { emoji: '🎈', name: 'Balão' },
  { emoji: '🎀', name: 'Laço' },
  { emoji: '🔔', name: 'Sino' },
  { emoji: '🔑', name: 'Chave' },
  { emoji: '🔒', name: 'Cadeado' },
  { emoji: '🔓', name: 'Aberto' },
  { emoji: '❤️', name: 'Coração' },
  { emoji: '💚', name: 'Verde' },
  { emoji: '💙', name: 'Azul' },
  { emoji: '💜', name: 'Roxo' },
  { emoji: '🧡', name: 'Laranja' },
  { emoji: '💛', name: 'Amarelo' },
  { emoji: '🤍', name: 'Branco' },
  { emoji: '🖤', name: 'Preto' },
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
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
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

              <div className="grid grid-cols-6 gap-2 mt-2 max-h-64 overflow-y-auto border rounded-lg p-3">
                {EMOJI_OPTIONS.map((option) => (
                  <button
                    key={option.emoji}
                    type="button"
                    onClick={() => handleEmojiSelect(option.emoji)}
                    className={`
                      h-10 text-xl flex items-center justify-center rounded-lg transition-all duration-200
                      ${selectedEmoji === option.emoji 
                        ? 'bg-blue-100 border-2 border-blue-500 scale-110 shadow-lg' 
                        : 'bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:scale-105 hover:shadow-md'}
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