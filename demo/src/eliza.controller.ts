import { Controller } from "@nestjs/common";
import { Observable, Subject } from "rxjs";
import { ElizaServiceController, ElizaServiceMethods } from "../gen/buf/connect/demo/eliza/v1/eliza_nestjs";
import {
  ConverseRequest,
  ConverseResponse,
  IntroduceRequest,
  IntroduceResponse,
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
  converse(request: Observable<ConverseRequest>): Observable<ConverseResponse> {
    const subject = new Subject<ConverseResponse>();

    request.subscribe({
      next(req) {
        const res = new ConverseResponse({
          sentence: req.sentence,
        });
        subject.next(res);
      },
      complete() {
        subject.complete();
      },
    });

    return subject.asObservable();
  }
  introduce(request: IntroduceRequest): Observable<IntroduceResponse> {
    const subject = new Subject<IntroduceResponse>();

    let count = 0;
    const job = setInterval(() => {
      count += 1;
      const res = new IntroduceResponse({
        sentence: `Sending to ${request.name}, ${count} time(s).`,
      });
      subject.next(res);

      if (count >= 5) {
        clearInterval(job);
        subject.complete();
      }
    }, 1000);

    return subject.asObservable();
  }
}
