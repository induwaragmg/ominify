#!/bin/bash
# ============================================================
# Kafka One-Shot Topic Initialization Script
# Idempotently creates required microservice topics with 1 partition
# and replication factor 3 across all 3 KRaft brokers.
# ============================================================

set -e # Exit immediately if any unhandled error occurs

# Bootstrap brokers list inside internal Compose network
BROKERS="kafka-broker-1:9092,kafka-broker-2:9092,kafka-broker-3:9092"

echo "Waiting for Kafka KRaft cluster metadata and leader quorum readiness..."
# Retry loop verifying cluster metadata API readiness (not just TCP port availability)
until kafka-broker-api-versions.sh --bootstrap-server "$BROKERS" > /dev/null 2>&1; do
  echo "Kafka cluster metadata not fully ready yet. Retrying in 2 seconds..."
  sleep 2
done
echo "Kafka cluster metadata is ready."

# List of required microservice topics
TOPICS=(
  "order.created"
  "payment.successful"
  "product.created"
  "product.deleted"
  "user.created"
)

# Loop over each topic to idempotently create it with 1 partition and replication factor 3
for TOPIC in "${TOPICS[@]}"; do
  echo "Ensuring topic '$TOPIC' exists with 1 partition and replication factor 3..."
  # Retry loop to handle ongoing KRaft controller/leader election
  until kafka-topics.sh --bootstrap-server "$BROKERS" \
    --create \
    --if-not-exists \
    --topic "$TOPIC" \
    --partitions 1 \
    --replication-factor 3; do
    echo "Failed creating topic '$TOPIC'. Retrying in 2 seconds..."
    sleep 2
  done
done

echo "Verifying created topics and partition leaders..."
for TOPIC in "${TOPICS[@]}"; do
  kafka-topics.sh --bootstrap-server "$BROKERS" --describe --topic "$TOPIC"
done

echo "Kafka topic initialization completed successfully."
