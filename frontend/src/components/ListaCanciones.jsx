import {useEffect, useState} from 'react';
import Alert from 'react-bootstrap/Alert';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import {listarCanciones } from '../api/canciones';
import {guardarEnSpotify} from '../api/spotify';
import ReproductorSpotify from './ReproductorSpotify'
import './ListaCanciones.css'

export default function ListaCanciones({accessToken}) {
    const [canciones, setCanciones] = useState([])
    const [cargando,  setCargando] = useState(true)
    const [error, setError] = useState('')
    const [indiceActual, setIndiceActual] = useState(0)
    const [guardandoId, setGuardandoId] = useState(null)
    const [mensajeGuardado, setMensajeGuardado] = useState('')
    const [errorGuardado, setErrorGuardado] = useState('')
    const [cambiandoAudio, setCambiandoAudio] = useState(false)

    useEffect(() => {
        let activo = true

        async function cargarCanciones(){
            setCargando(true)
            setError('')

            try {
                const datos = await listarCanciones(accessToken)

                if (activo) {
                    setCanciones(datos)
                    setIndiceActual(0)
                }
            } catch (err) {
                if(!activo) return

                if (err.response?.status === 401) {
                    setError('Tu sesión no es válida o ha expirado.')
                } else if (!err.response) {
                    setError('Error al conectar con el servidor.')
                } else {
                    setError('No se pudieron cargar las canciones.')
                }
            } finally {
                if (activo) {
                    setCargando(false)
                }
            }
        }

        cargarCanciones()

        return () => {
            activo = false
        }
    }, [accessToken])

    const cancionActual = canciones[indiceActual]

    function avanzarCancion() {
        setIndiceActual((indiceAnterior) => indiceAnterior + 1)
    }

    function manejarPasar() {
        if (!cancionActual || guardandoId !== null || cambiandoAudio) return
        
        setMensajeGuardado('')
        setErrorGuardado('')
        avanzarCancion()
    }

    async function manejarMeGusta() {
        if (!cancionActual || guardandoId !== null || cambiandoAudio) return

        const cancion = cancionActual

        setGuardandoId(cancion.id)
        setMensajeGuardado('')
        setErrorGuardado('')

        try {
            await guardarEnSpotify(accessToken, cancion.spotify_id)

            setMensajeGuardado(`"${cancion.titulo}" se guardó en Tus me gusta de Spotify.`)
            avanzarCancion()
        } catch (err) {
            if (err.response?.status === 401) {
            setErrorGuardado('Vuelve a iniciar sesión en MusicSwipe.')
            } else {
            setErrorGuardado(
                err.response?.data?.detail ??
                err.message ??
                'No se pudo guardar la canción en Spotify.',
                )
            }
        } finally {
            setGuardandoId(null)
        }
    }

    if (cargando) {
        return <p>Cargando canciones...</p>
    }

    if (error) {
        return <Alert variant="danger">{error}</Alert>
    }

    return (
        <section className="descubrimiento">
            <h2>Descubrir Música</h2>

            <ReproductorSpotify
                accessToken={accessToken}
                spotifyId={cancionActual?.spotify_id}
                onOcupado={setCambiandoAudio}
            />

            {mensajeGuardado && ( 
                <Alert variant="success">{mensajeGuardado}</Alert>
            )}

            {errorGuardado && (
                <Alert variant="danger">{errorGuardado}</Alert>
            )}

            {canciones.length === 0 ? (
                <p>Todavía no hay canciones disponibles.</p>
            ) : !cancionActual ? (
                <Alert variant="info">
                    Ya revisaste todas las canciones disponibles.
                </Alert>
            ) : (
                <Card className="mx-auto" style={{maxWidth: '26rem'}}>
                    <Card.Body>
                        <Card.Title>{cancionActual.titulo}</Card.Title>

                        <Card.Text>{cancionActual.artista}</Card.Text>

                        <a
                            href={`https://open.spotify.com/track/${cancionActual.spotify_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Abrir en Spotify
                        </a>

                        <p className="mb-3">
                            Canción {indiceActual + 1} de {canciones.length}
                        </p>
                        
                        <div className="d-flex justify-content-center gap-3">
                            <Button 
                            type="button"
                            variant="outline-secondary"
                            onClick={manejarPasar}
                            disabled={guardandoId !== null || cambiandoAudio}
                            >
                                Pasar
                            </Button>

                            <Button
                            type="button"
                            variant="success"
                            onClick={manejarMeGusta}
                            disabled={guardandoId !== null || cambiandoAudio}
                            >
                                {guardandoId !== null ? 'Guardando...' : 'Me gusta'}
                            </Button>
                        </div>
                    </Card.Body>
                </Card>
            )}
        </section>
    )
}