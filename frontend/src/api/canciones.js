import client from './client';

export async function listarCanciones(accessToken) {
    const respuesta = await client.get('canciones/', {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    })

    return respuesta.data
}

export async function guardarCancion(accessToken, cancionId) {
    const respuesta = await client.post(
        'guardadas/',
        {cancion_id: cancionId},
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        },
    )

    return respuesta.data
}
