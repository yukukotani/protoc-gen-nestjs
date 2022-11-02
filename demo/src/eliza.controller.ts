import { Controller } from "@nestjs/common";
import {
  ElizaServiceController,
  ElizaServiceMethods,
} from "../gen/buf/connect/demo/eliza/v1/eliza_nestjs";
import {
  SayRequest,
  SayResponse,
} from "../gen/buf/connect/demo/eliza/v1/eliza_pb";

@Controller()
@ElizaServiceMethods()
export class ElizaController implements ElizaServiceController {
  async say(request: SayRequest): Promise<SayResponse> {
    return new SayResponse({
      sentence: request.sentence,
    });
  }
}
