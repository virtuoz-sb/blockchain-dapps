import { KafkaOptions, Transport } from "@nestjs/microservices";

// eslint-disable-next-line import/prefer-default-export
export const microserviceConfig: KafkaOptions = {
  transport: Transport.KAFKA,

  options: {
    client: {
      brokers: [process.env.KAFKA_BROKERS],
      ...(!!process.env.KAFKA_AUTH_ENABLE && {
        sasl: {
          mechanism: "plain",
          username: process.env.KAFKA_AUTH_SASL_USERNAME || "",
          password: process.env.KAFKA_AUTH_SASL_PASSWORD || "",
        },
      }),
    },
    consumer: {
      groupId: process.env.KAFKA_CONSUMER_GROUP_ID,
      allowAutoTopicCreation: true,
    },
  },
};
