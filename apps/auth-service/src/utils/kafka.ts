import { createProducer, createKafkaClient } from "@repo/kafka";

const kafka = createKafkaClient("email-service");
export const producer = createProducer(kafka);