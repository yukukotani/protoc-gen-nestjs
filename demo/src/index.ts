import { ConsoleLogger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { join } from "path";
import { AppModule } from "./app.module";

async function bootstrap() {
  const logger = new ConsoleLogger();

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      logger: logger,
      transport: Transport.GRPC,
      options: {
        package: ["buf.connect.demo.eliza.v1"],
        protoPath: [join(__dirname, "../proto/eliza.proto")],
        url: "localhost:5000",
      },
    }
  );

  await app.listen();
}
bootstrap();
