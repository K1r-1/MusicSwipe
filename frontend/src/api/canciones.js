import client from './client';

export async function listarCanciones(accessToken) {
    const respuesta = await client.get('canciones/', {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    })

    return respuesta.data
}
