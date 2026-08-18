import { Kafka } from 'kafkajs';

export const createKafkaClient = (service: string ) => {
    // CHANGE 1: Read Kafka brokers from the environment so the same code works
    // in local development, Docker, and later Kubernetes/cloud environments.
    const brokers = process.env.KAFKA_BROKERS
        ?.split(',')
        .map((broker) => broker.trim())
        .filter(Boolean);

    // CHANGE 2: Fail immediately with a clear configuration error instead of
    // silently falling back to an incorrect localhost address in production.
    if (!brokers || brokers.length === 0) {
        throw new Error('KAFKA_BROKERS environment variable is not configured');
    }

    return new Kafka({
        clientId: service,
        brokers,
    });
};