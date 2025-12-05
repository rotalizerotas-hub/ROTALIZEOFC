'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Camera, Mic, FileText, X, Play, Pause, Trash2, Download } from 'lucide-react'
import { toast } from 'sonner'

export interface OrderMedia {
  id: string
  type: 'photo' | 'audio' | 'note'
  content?: string
  file?: File
  url?: string
  fileName?: string
  size?: number
  timestamp: number
}

interface OrderMediaCaptureProps {
  onMediaChange: (media: OrderMedia[]) => void
  disabled?: boolean
}

export function OrderMediaCapture({ onMediaChange, disabled = false }: OrderMediaCaptureProps) {
  const [mediaItems, setMediaItems] = useState<OrderMedia[]>([])
  const [noteText, setNoteText] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Função para capturar foto da câmera
  const capturePhoto = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Câmera traseira no mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.style.display = 'block'
        await videoRef.current.play()
        
        // Aguardar um momento para a câmera se ajustar
        setTimeout(() => {
          takePhoto(stream)
        }, 1000)
      }
    } catch (error) {
      console.error('Erro ao acessar câmera:', error)
      toast.error('Erro ao acessar a câmera. Tente selecionar uma foto da galeria.')
      // Fallback para seleção de arquivo
      fileInputRef.current?.click()
    }
  }

  const takePhoto = (stream: MediaStream) => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      const context = canvas.getContext('2d')
      
      if (context) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0)
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' })
            const url = URL.createObjectURL(blob)
            
            const newMedia: OrderMedia = {
              id: Date.now().toString(),
              type: 'photo',
              file,
              url,
              fileName: file.name,
              size: file.size,
              timestamp: Date.now()
            }
            
            const updatedMedia = [...mediaItems, newMedia]
            setMediaItems(updatedMedia)
            onMediaChange(updatedMedia)
            toast.success('Foto capturada com sucesso!')
          }
        }, 'image/jpeg', 0.8)
      }
      
      // Parar stream e esconder vídeo
      stream.getTracks().forEach(track => track.stop())
      video.style.display = 'none'
    }
  }

  // Função para selecionar foto da galeria
  const selectPhoto = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      
      const newMedia: OrderMedia = {
        id: Date.now().toString(),
        type: 'photo',
        file,
        url,
        fileName: file.name,
        size: file.size,
        timestamp: Date.now()
      }
      
      const updatedMedia = [...mediaItems, newMedia]
      setMediaItems(updatedMedia)
      onMediaChange(updatedMedia)
      toast.success('Foto selecionada com sucesso!')
    }
    
    // Limpar input
    event.target.value = ''
  }

  // Função para gravar áudio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        const file = new File([audioBlob], `audio_${Date.now()}.wav`, { type: 'audio/wav' })
        const url = URL.createObjectURL(audioBlob)
        
        const newMedia: OrderMedia = {
          id: Date.now().toString(),
          type: 'audio',
          file,
          url,
          fileName: file.name,
          size: file.size,
          timestamp: Date.now()
        }
        
        const updatedMedia = [...mediaItems, newMedia]
        setMediaItems(updatedMedia)
        onMediaChange(updatedMedia)
        toast.success('Áudio gravado com sucesso!')
        
        // Limpar stream
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      
      // Contador de tempo
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
      
    } catch (error) {
      console.error('Erro ao acessar microfone:', error)
      toast.error('Erro ao acessar o microfone')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
    }
  }

  // Função para adicionar nota
  const addNote = () => {
    if (noteText.trim()) {
      const newMedia: OrderMedia = {
        id: Date.now().toString(),
        type: 'note',
        content: noteText.trim(),
        timestamp: Date.now()
      }
      
      const updatedMedia = [...mediaItems, newMedia]
      setMediaItems(updatedMedia)
      onMediaChange(updatedMedia)
      setNoteText('')
      toast.success('Nota adicionada com sucesso!')
    }
  }

  // Função para reproduzir áudio
  const playAudio = (media: OrderMedia) => {
    if (media.url) {
      if (playingAudio === media.id) {
        // Parar áudio
        if (audioRef.current) {
          audioRef.current.pause()
          audioRef.current = null
        }
        setPlayingAudio(null)
      } else {
        // Reproduzir áudio
        if (audioRef.current) {
          audioRef.current.pause()
        }
        
        const audio = new Audio(media.url)
        audioRef.current = audio
        audio.play()
        setPlayingAudio(media.id)
        
        audio.onended = () => {
          setPlayingAudio(null)
          audioRef.current = null
        }
      }
    }
  }

  // Função para remover mídia
  const removeMedia = (id: string) => {
    const updatedMedia = mediaItems.filter(item => item.id !== id)
    setMediaItems(updatedMedia)
    onMediaChange(updatedMedia)
    
    // Parar áudio se estiver tocando
    if (playingAudio === id && audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
      setPlayingAudio(null)
    }
  }

  // Formatar tempo de gravação
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Formatar tamanho do arquivo
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5" />
          Mídias do Pedido (Opcional)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Botões de Captura */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Câmera */}
          <Button
            type="button"
            variant="outline"
            onClick={capturePhoto}
            disabled={disabled}
            className="h-20 rounded-xl flex flex-col items-center gap-2 hover:bg-blue-50"
          >
            <Camera className="w-6 h-6 text-blue-600" />
            <span className="text-sm font-medium">Tirar Foto</span>
          </Button>

          {/* Áudio */}
          <Button
            type="button"
            variant="outline"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={disabled}
            className={`h-20 rounded-xl flex flex-col items-center gap-2 ${
              isRecording 
                ? 'bg-red-50 border-red-200 hover:bg-red-100' 
                : 'hover:bg-green-50'
            }`}
          >
            <Mic className={`w-6 h-6 ${isRecording ? 'text-red-600' : 'text-green-600'}`} />
            <span className="text-sm font-medium">
              {isRecording ? `Gravando ${formatTime(recordingTime)}` : 'Gravar Áudio'}
            </span>
          </Button>

          {/* Nota */}
          <div className="space-y-2">
            <Textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Digite uma nota..."
              disabled={disabled}
              className="rounded-xl resize-none h-16"
              maxLength={500}
            />
            <Button
              type="button"
              onClick={addNote}
              disabled={disabled || !noteText.trim()}
              className="w-full rounded-xl bg-purple-600 hover:bg-purple-700 text-white"
            >
              <FileText className="w-4 h-4 mr-2" />
              Adicionar Nota
            </Button>
          </div>
        </div>

        {/* Lista de Mídias Capturadas */}
        {mediaItems.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Mídias Capturadas</Label>
            {mediaItems.map((media) => (
              <div key={media.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                {/* Ícone do tipo */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  media.type === 'photo' ? 'bg-blue-100' :
                  media.type === 'audio' ? 'bg-green-100' : 'bg-purple-100'
                }`}>
                  {media.type === 'photo' && <Camera className="w-5 h-5 text-blue-600" />}
                  {media.type === 'audio' && <Mic className="w-5 h-5 text-green-600" />}
                  {media.type === 'note' && <FileText className="w-5 h-5 text-purple-600" />}
                </div>

                {/* Conteúdo */}
                <div className="flex-1 min-w-0">
                  {media.type === 'photo' && (
                    <div>
                      <div className="font-medium text-sm">Foto</div>
                      <div className="text-xs text-gray-500">
                        {media.fileName} • {media.size ? formatFileSize(media.size) : ''}
                      </div>
                      {media.url && (
                        <img 
                          src={media.url} 
                          alt="Foto do pedido" 
                          className="mt-2 w-20 h-20 object-cover rounded-lg"
                        />
                      )}
                    </div>
                  )}
                  
                  {media.type === 'audio' && (
                    <div>
                      <div className="font-medium text-sm">Áudio</div>
                      <div className="text-xs text-gray-500">
                        {media.fileName} • {media.size ? formatFileSize(media.size) : ''}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => playAudio(media)}
                        className="mt-2 rounded-lg"
                      >
                        {playingAudio === media.id ? (
                          <Pause className="w-3 h-3 mr-1" />
                        ) : (
                          <Play className="w-3 h-3 mr-1" />
                        )}
                        {playingAudio === media.id ? 'Pausar' : 'Reproduzir'}
                      </Button>
                    </div>
                  )}
                  
                  {media.type === 'note' && (
                    <div>
                      <div className="font-medium text-sm">Nota</div>
                      <div className="text-sm text-gray-700 mt-1 p-2 bg-white rounded-lg">
                        {media.content}
                      </div>
                    </div>
                  )}
                </div>

                {/* Botão remover */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeMedia(media.id)}
                  className="rounded-lg text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            
            <div className="text-xs text-gray-500 text-center">
              {mediaItems.length} mídia(s) capturada(s)
            </div>
          </div>
        )}

        {/* Elementos ocultos */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={selectPhoto}
          className="hidden"
        />
        <video
          ref={videoRef}
          className="hidden w-full max-w-sm mx-auto rounded-xl"
          playsInline
        />
        <canvas ref={canvasRef} className="hidden" />
      </CardContent>
    </Card>
  )
}