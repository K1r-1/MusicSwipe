import { useState } from 'react'
import Alert from 'react-bootstrap/Alert'
import Button from 'react-bootstrap/Button'
import { obtenerUrlSpotify } from '../api/spotify'

export default function ConectarSpotify({ accessToken }) {
  const [conectando, setConectando] = useState(false)
  const [error, setError] = useState('')

  async function conectar() {
    setError('')

    const ventana = window.open('about:blank', '_blank')

    if (!ventana) {
      setError('Permite abrir ventanas emergentes para conectar Spotify.')
      return
    }

    ventana.opener = null
    setConectando(true)

    try {
      const url = await obtenerUrlSpotify(accessToken)
      ventana.location.href = url
    } catch (err) {
      ventana.close()

      if (err.response?.status === 401) {
        setError('Vuelve a iniciar sesión en MusicSwipe.')
      } else {
        setError('No se pudo iniciar la conexión con Spotify.')
      }
    } finally {
      setConectando(false)
    }
  }

  return (
    <div className="mb-3">
      <Button
        type="button"
        variant="success"
        onClick={conectar}
        disabled={conectando}
      >
        {conectando ? 'Abriendo Spotify...' : 'Conectar Spotify'}
      </Button>

      {error && (
        <Alert variant="danger" className="mt-2">
          {error}
        </Alert>
      )}
    </div>
  )
}