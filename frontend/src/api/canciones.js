import client from './client';

export async function listarCanciones(accessToken) {
    const respuesta = await client.get('canciones/', {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    })

    return respuesta.data
}

export async function crearCancion(accessToken, datos) {
    const respuesta = await client.post('canciones/', datos, {
        headers: {
            Authorization:`Bearer ${accessToken}`,
        },
    })

    return respuesta.data
}

export async function actualizarCancion(accessToken, cancionId, datos) {
  const respuesta = await client.patch(`canciones/${cancionId}/`, datos, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  return respuesta.data
}

export async function eliminarCancion(accessToken, cancionId) {
  await client.delete(`canciones/${cancionId}/`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
}