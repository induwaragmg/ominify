import Fastify from 'fastify';
import { clerkPlugin} from '@clerk/fastify';
import { shouldBeUser } from './middleware/authMiddleware.js';
import { connnectOrderDb } from '@repo/order-db';
import { OrderRoute } from './routes/order.js';

const fastify = Fastify();
fastify.register(clerkPlugin)


fastify.get("/health", (request, reply) => {
    return reply.status(200).send({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

fastify.get("/test", { preHandler: shouldBeUser }, (request, reply) => {

    return reply.send({ message: "Order service is authorized", userId: request.userId });
});

fastify.register(OrderRoute);  

const start = async () => {
    try {
        await connnectOrderDb();
        await fastify.listen({ port: 8001 });
        console.log('Order service is running on port 8001');
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
}

start();