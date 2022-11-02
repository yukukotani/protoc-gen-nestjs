import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ElizaController } from "./eliza.controller";

@Module({
  controllers: [ElizaController],
})
export class AppModule implements NestModule {
  configure(_: MiddlewareConsumer) {
    // noop
  }
}
