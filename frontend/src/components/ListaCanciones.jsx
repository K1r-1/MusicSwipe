import {useEffect, useState} from 'react';
import Alert from 'react-bootstrap/Alert';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import {listarCanciones, guardarCancion} from '../api/canciones';

export default function ListaCanciones({accessToken}) {
    const [canciones, setCanciones] = useState([])
    const [cargando,  setCargando] = useState(true)
    const [error, setError] = useState('')
    const [indiceActual, setIndiceActual] = useState(0)
    const [guardandoId, setGuardandoId] = useState(null)
    const [mensajeGuardado, setMensajeGuardado] = useState('')
    const [errorGuardado, setErrorGuardado] = useState('')

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
        if (!cancionActual || guardandoId !== null) return
        
        setMensajeGuardado('')
        setErrorGuardado('')
        avanzarCancion()
    }

    async function manejarMeGusta(cancionId) {
        setGuardandoId(cancionId)
        setMensajeGuardado('')
        setErrorGuardado('')

        if (guardandoId !== null) return

        try {
            await guardarCancion(accessToken, cancionId)
            setMensajeGuardado('Canción guardada correctamente.')
            avanzarCancion()
        } catch (err) {
            if (err.response?.status === 401) {
                setErrorGuardado('Tu sesión no es válida o ha expirado.')
            } else if (err.response?.status === 400) {
                const datos = err.response.data

                setErrorGuardado(
                    datos.detail ??
                    datos.cancion_id?.[0] ??
                    'No se pudo guardar la canción.',
                )
            } else if (!err.response) {
                setErrorGuardado('No se pudo conectar con el servidor.')
            } else {
                setErrorGuardado('No se pudo guardar la canción')
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
        <section>
            <h2>Descubrir Música</h2>

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
                <Card calssName="mx-auto" style={{maxWidth: '26rem'}}>
                    <Card.Body>
                        <Card.Title>{cancionActual.titulo}</Card.Title>

                        <Card.Text>{cancionActual.artista}</Card.Text>

                        <p className="mb-3">
                            Canción {indiceActual + 1} de {canciones.length}
                        </p>
                        
                        <div className="d-flex justify-content-center g ap-3">
                            <Button 
                            type="button"
                            variant="outline-secondary"
                            onClick={manejarPasar}
                            disabled={guardandoId !== null}
                            >
                                Pasar
                            </Button>

                            <Button
                            type="button"
                            variant="success"
                            onClick={() => manejarMeGusta(cancionActual.id)}
                            disabled={guardandoId !== null}
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