import { Server } from 'socket.io';
import { server } from '../../app';
import { COOKIE_MAX_AGE_MILIS } from '../../constants';
import { corsOptions, pool, prisma } from '../../config';
import { createAdapter } from '@socket.io/postgres-adapter';
import { listenerWrapper } from '../../utils/listener-wrapper';
import { UserStatus } from '@prisma/client';

export const io = new Server(server, {
  cookie: {
    name: 'io',
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production' ? true : false,
    maxAge: COOKIE_MAX_AGE_MILIS,
  },
  cors: corsOptions,
});

io.adapter(createAdapter(pool));

require('./middlewares');

const onConnection = listenerWrapper(async (socket) => {
  const start = new Date();
  // handling user status
  console.log(`client(id=${socket.user.id}, sid=${socket.id}) connected!`);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: socket.user.id },
      data: { status: UserStatus.ONLINE },
    }),
    prisma.userSockets.create({
      data: {
        socketId: socket.id,
        user: { connect: { id: socket.user.id } },
      },
    }),
  ]);
  socket.on('disconnect', async () => {
    console.log(`client(id=${socket.user.id}, sid=${socket.id}) disconnected!`);
    const [_, userSocketsCount] = await prisma.$transaction([
      prisma.userSockets.delete({
        where: { socketId: socket.id },
      }),
      prisma.userSockets.count({ where: { userId: socket.user.id } }),
    ]);
    if (userSocketsCount == 0) {
      await prisma.user.update({
        where: { id: socket.user.id },
        data: { status: UserStatus.OFFLINE },
      });
    }
  });
  require('./users-handler')(io, socket);
  const diffTime = new Date().getTime() - start.getTime();
  const seconds = (diffTime / 1000).toFixed(4);
  socket.emit('ready', seconds);
});

io.on('connection', onConnection);