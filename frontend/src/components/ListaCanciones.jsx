import {useEffect, useState} from 'react';
import Alert from 'react-bootstrap/Alert';
import ListGroup from 'react-bootstrap/ListGroup';
import {listarCanciones} from '../api/canciones';

export default function ListaCanciones({accessToken}) {
    const [canciones, setCanciones] = useState([])
    const [cargando,  setCargando] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        let activo = true

        async function cargarCanciones(){
            setCargando(true)
            setError('')

            try {
                const datos = await listarCanciones(accessToken)

                if (activo) {
                    setCanciones(datos)
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

    if (cargando) {
        return <p>Cargando canciones...</p>
    }

    if (error) {
        return <Alert variant="danger">{error}</Alert>
    }

    return (
        <section>
            <h2>Canciones</h2>

            {canciones.length === 0 ? (
                <p>Todavía no hay canciones disponibles.</p>
            ) : (
                <ListGroup>
                    {canciones.map((cancion) =>(
                        <ListGroup.Item key={cancion.id}>
                            <strong>{cancion.titulo}</strong>
                            {' - '}
                            {cancion.artista}
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            )}
        </section>
    )
}