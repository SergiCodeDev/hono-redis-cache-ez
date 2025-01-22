import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { createClient } from 'redis'

const app = new Hono()

const client = createClient({
  url: 'redis://127.0.0.1:6379',
});

// const client = createClient({
//   socket: {
//     host: '127.0.0.1',
//     port: 6379
//     // ...
//   }
// });

app.get('/ejemplo', async (c) => {

  const respuestaRedis = await client.get('ejemplo')

  if (respuestaRedis) return c.json(JSON.parse(respuestaRedis))

  const response = await fetch('tu-url-para-cachear');
  const data = await response.json();

  // Guardar en caché con tiempo de expiración de 1 hora
  // await client.setEx('ejemplo', 3600, JSON.stringify(data));
  const resultadoGuardadoEnCache = await client.set('ejemplo', JSON.stringify(data))
  console.log(resultadoGuardadoEnCache)

  return c.json(data)
})

app.get('/ejemplo/:id', async (c) => {
  const { id } = c.req.param()

  const respuestaRedis = await client.get(`ejemplo-${id}`)

  if (respuestaRedis) return c.json(JSON.parse(respuestaRedis))

  const response = await fetch(`tu-url/${id}`);
  const data = await response.json();

  // await client.set(`ejemplo-${id}`, JSON.stringify(data))
  const resultadoGuardadoEnCache = await client.set(`ejemplo-${id}`, JSON.stringify(data))
  console.log(resultadoGuardadoEnCache)

  return c.json(data)
})


const port = 3000;

(async () => {
  await client.connect()
  console.log('Redis Iniciado')
  serve({
    fetch: app.fetch,
    port
  })
  console.log(`Server is running on http://localhost:${port}`)
})()
