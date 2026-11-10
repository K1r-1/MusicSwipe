import client from './client';

export async function iniciarSesion(username, password) {
    const respuesta = await client.post('token/', {
        username,
        password,
    })

    return respuesta.data
}