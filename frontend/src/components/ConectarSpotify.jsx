import { useState } from 'react'
import Alert from 'react-bootstrap/Alert'
import Button from 'react-bootstrap/Button'
import { obtenerUrlSpotify, obtenerTokenSpotify, } from '../api/spotify'

export default function ConectarSpotify({ accessToken }) {
  const [conectando, setConectando] = useState(false)
  const [error, setError] = useState('')
  const [comprobando, setComprobando] = useState(false)
  const [mensaje, setMensaje] = useState('')

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

  async function comprobarToken() {
  setComprobando(true)
  setMensaje('')
  setError('')

  try {
    const datos = await obtenerTokenSpotify(accessToken)

    setMensaje(
      datos.renovado
        ? 'El token de Spotify se renovó correctamente.'
        : 'El token de Spotify está vigente.',
    )
  } catch (err) {
      if (err.response?.status === 401) {
        setError('Vuelve a iniciar sesión en MusicSwipe.')
      } else if (err.response?.status === 429) {
        const espera = err.response.data.retry_after
        setError(`Espera ${espera} segundos antes de volver a comprobar.`)
      } else {
        setError(
          err.response?.data?.detail ??
          'No se pudo comprobar la conexión con Spotify.',
        )
      }
    } finally {
      setComprobando(false)
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

      <Button
        type="button"
        variant="outline-success"
        className="ms-2"
        onClick={comprobarToken}
        disabled={comprobando}
      >
        {comprobando ? 'Comprobando...' : 'Comprobar token'}
      </Button>

      {mensaje && (
        <Alert variant="success" className="mt-2">
          {mensaje}
        </Alert>
      )}

      {error && (
        <Alert variant="danger" className="mt-2">
          {error}
        </Alert>
      )}
    </div>
  )
}