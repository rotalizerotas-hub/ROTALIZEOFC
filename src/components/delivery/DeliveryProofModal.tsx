'use client'

import { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Camera, Upload, Check, X } from 'lucide-react'
import { toast } from 'sonner'

interface DeliveryProofModalProps {
  isOpen: boolean
  onClose: () => void
  order: {
    id: string
    customer_name: string
    delivery_address: string
    value: number
    status: string
  }
  onSubmitProof: (data: {
    orderId: string
    notes: string
    photoFile: File | null
  }) => Promise<void>
}

export function DeliveryProofModal({ 
  isOpen, 
  onClose, 
  order, 
  onSubmitProof 
}: DeliveryProofModalProps) {
  const [notes, setNotes] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [useCamera, setUseCamera] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Câmera traseira no mobile
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setUseCamera(true)
      }
    } catch (error) {
      toast.error('Erro ao acessar câmera')
      console.error('Camera error:', error)
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
    setUseCamera(false)
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const video = videoRef.current
    
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.drawImage(video, 0, 0)
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `delivery-${order.id}-${Date.now()}.jpg`, {
            type: 'image/jpeg'
          })
          setPhotoFile(file)
          setPhotoPreview(canvas.toDataURL())
          stopCamera()
        }
      }, 'image/jpeg', 0.8)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setPhotoFile(file)
      
      const reader = new FileReader()
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    if (!notes.trim()) {
      toast.error('Adicione uma observação sobre a entrega')
      return
    }

    setIsSubmitting(true)
    
    try {
      await onSubmitProof({
        orderId: order.id,
        notes: notes.trim(),
        photoFile
      })
      
      toast.success('Comprovante de entrega salvo!')
      onClose()
      
      // Reset form
      setNotes('')
      setPhotoFile(null)
      setPhotoPreview(null)
      stopCamera()
    } catch (error) {
      toast.error('Erro ao salvar comprovante')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Comprovante de Entrega</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações do pedido */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="font-medium">{order.customer_name}</div>
                <div className="text-sm text-gray-600">{order.delivery_address}</div>
                <div className="text-lg font-bold text-green-600">
                  R$ {order.value.toFixed(2)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações da Entrega *</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Descreva como foi a entrega (ex: Entregue ao cliente, porteiro, etc.)"
              className="rounded-xl"
              rows={3}
            />
          </div>

          {/* Foto */}
          <div className="space-y-4">
            <Label>Foto da Entrega (Opcional)</Label>
            
            {!photoPreview && !useCamera && (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={startCamera}
                  className="flex-1 rounded-xl"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Tirar Foto
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 rounded-xl"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Galeria
                </Button>
              </div>
            )}

            {/* Câmera */}
            {useCamera && (
              <div className="space-y-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full rounded-xl"
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={capturePhoto}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white rounded-xl"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Capturar
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={stopCamera}
                    className="rounded-xl"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Preview da foto */}
            {photoPreview && (
              <div className="space-y-2">
                <img
                  src={photoPreview}
                  alt="Preview da entrega"
                  className="w-full rounded-xl border"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setPhotoFile(null)
                    setPhotoPreview(null)
                  }}
                  className="w-full rounded-xl"
                >
                  Remover Foto
                </Button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Canvas oculto para captura */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Botões */}
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-xl"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !notes.trim()}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-xl"
            >
              {isSubmitting ? (
                'Salvando...'
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Confirmar Entrega
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}