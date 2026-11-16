import { useEffect, useRef, useState } from 'react'
import Alert from 'react-bootstrap/Alert'
import Button from 'react-bootstrap/Button'
import { cargarSpotifySdk } from '../lib/spotifySdk'
import {
  obtenerTokenSpotify,
  reproducirCancion,
} from '../api/spotify'

function mensajeError(err) {
  return err.response?.data?.detail ??
    err.message ??
    'No se pudo utilizar el reproductor.'
}

export default function ReproductorSpotify({
  accessToken,
  spotifyId,
  onOcupado,
}) {
  const reproductorRef = useRef(null)

  const [intento, setIntento] = useState(0)
  const [deviceId, setDeviceId] = useState(null)
  const [escuchando, setEscuchando] = useState(false)
  const [reintento, setReintento] = useState(0)
  const [ocupado, setOcupado] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (intento === 0) return

    let activo = true
    let reproductor

    setDeviceId(null)
    setEscuchando(false)
    setError('')

    async function preparar() {
      try {
        console.info('Spotify: cargando SDK')
        const Spotify = await cargarSpotifySdk()
        console.info('Spotify: SDK disponible')

        if (!activo) return

        reproductor = new Spotify.Player({
          name: 'MusicSwipe',
          volume: 0.5,
          getOAuthToken: (entregarToken) => {
            obtenerTokenSpotify(accessToken)
              .then((datos) => {
                console.info('Spotify: token recibido')
                if (activo) entregarToken(datos.access_token)
              })
              .catch((err) => {
                console.error('Spotify: falló la solicitud del token')
                if (activo) setError(mensajeError(err))
              })
          },
        })

        reproductorRef.current = reproductor

        reproductor.addListener('ready', ({ device_id }) => {
            console.info('Spotify: reproductor preparado')
          if (activo) setDeviceId(device_id)
        })

        reproductor.addListener('not_ready', () => {
          if (!activo) return
          setDeviceId(null)
          setEscuchando(false)
          setError('El reproductor perdió la conexión. Prepáralo nuevamente.')
        })

        const errores = [
          'initialization_error',
          'authentication_error',
          'account_error',
          'playback_error',
        ]

        errores.forEach((evento) => {
          reproductor.addListener(evento, ({ message }) => {
            if (!activo) return
            setError(message)
            setEscuchando(false)
          })
        })

        reproductor.addListener('autoplay_failed', () => {
          if (!activo) return
          setError('El navegador bloqueó el audio. Pulsa Escuchar tarjeta.')
          setEscuchando(false)
        })

        console.info('Spotify: iniciando conexión')
        const conectado = await reproductor.connect()
        console.info('Spotify: resultado de conexión', conectado)

        if (activo && !conectado) {
          setError('No se pudo conectar el reproductor. Inténtalo nuevamente.')
        }
      } catch (err) {
        if (activo) setError(mensajeError(err))
      }
    }

    preparar()

    return () => {
      activo = false
      reproductor?.disconnect()

      if (reproductorRef.current === reproductor) {
        reproductorRef.current = null
      }
    }
  }, [accessToken, intento])

  useEffect(() => {
    const reproductor = reproductorRef.current

    if (!reproductor || !deviceId) return

    let activo = true

    async function actualizarCancion() {
      setOcupado(true)
      onOcupado(true)

      try {
        const estado = await reproductor.getCurrentState()

        if (!activo) return

        if (estado && !estado.paused) {
            await reproductor.pause()
        }

        if (!activo || !escuchando || !spotifyId) return

        setError('')

        await reproducirCancion(accessToken, deviceId, spotifyId)
      } catch (err) {
        if (activo) {
          setError(mensajeError(err))
          setEscuchando(false)
        }
      } finally {
        if (activo) {
          setOcupado(false)
          onOcupado(false)
        }
      }
    }

    actualizarCancion()

    return () => {
      activo = false
    }
  }, [
    accessToken,
    deviceId,
    spotifyId,
    escuchando,
    reintento,
    onOcupado,
  ])

  async function escucharTarjeta() {
    const reproductor = reproductorRef.current

    if (!reproductor || !deviceId || !spotifyId || ocupado) return

    try {
      await reproductor.activateElement()
      setEscuchando(true)
      setReintento((valor) => valor + 1)
    } catch (err) {
      setError(mensajeError(err))
    }
  }

  return (
    <div className="mb-4">
      <div className="d-flex justify-content-center flex-wrap gap-2">
        <Button
          type="button"
          variant="outline-success"
          disabled={ocupado}
          onClick={() => setIntento((valor) => valor + 1)}
        >
          {deviceId ? 'Reconectar reproductor' : 'Preparar reproductor'}
        </Button>

        <Button
          type="button"
          variant="success"
          disabled={!deviceId || !spotifyId || ocupado}
          onClick={escucharTarjeta}
        >
          {ocupado ? 'Cambiando audio...' : 'Escuchar tarjeta'}
        </Button>

        <Button
          type="button"
          variant="outline-secondary"
          disabled={!deviceId || !escuchando || ocupado}
          onClick={() => setEscuchando(false)}
        >
          Pausar
        </Button>
      </div>

      {deviceId && (
        <p className="mt-2">Reproductor de Spotify preparado.</p>
      )}

      {error && (
        <Alert variant="danger" className="mt-3">
          {error}
        </Alert>
      )}
    </div>
  )
}