import './globals.css'

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <title>RotaLize - Sistema de Gestão de Entregas</title>
        <meta name="description" content="Sistema completo para gestão de entregas e logística" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>{children}</body>
    </html>
  )
}