import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const fastify = Fastify({ logger: true });
const DB_PATH = join(__dirname, 'db.json');

// Middleware для статики
fastify.register(fastifyStatic, {
  root: join(__dirname, 'public'),
  prefix: '/',
});

// Инициализация БД
async function initDB() {
  try {
    await fs.access(DB_PATH);
  } catch {
    await fs.writeFile(DB_PATH, JSON.stringify({ users: [] }, null, 2));
  }
}

// Чтение БД
async function readDB() {
  const data = await fs.readFile(DB_PATH, 'utf-8');
  return JSON.parse(data);
}

// Запись БД
async function writeDB(data) {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
}

// GET /api/users
fastify.get('/api/users', async (request, reply) => {
  const db = await readDB();
  return db.users;
});

// POST /api/users
fastify.post('/api/users', async (request, reply) => {
  const { name, email } = request.body;
  
  if (!name || !email) {
    return reply.status(400).send({ error: 'Name and email are required' });
  }
  
  const db = await readDB();
  const newUser = {
    id: Date.now(),
    name,
    email,
  };
  
  db.users.push(newUser);
  await writeDB(db);
  
  return reply.status(201).send(newUser);
});

// Запуск сервера
async function start() {
  await initDB();
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Server running at http://localhost:3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
