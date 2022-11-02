# protoc-gen-nestjs

[![npm](https://img.shields.io/npm/v/protoc-gen-nestjs)](https://www.npmjs.com/package/protoc-gen-nestjs)
[![license](https://img.shields.io/npm/l/protoc-gen-nestjs)](https://github.com/yukukotani/protoc-gen-nestjs/blob/main/LICENSE)

The code generator for Protocol Buffers for [NestJS](https://docs.nestjs.com/microservices/grpc), based on [@bufbuild/protoc-gen-es](https://www.npmjs.com/package/@bufbuild/protoc-gen-es).

## Features

- Generates interfaces of controllers from gRPC services.
- Generates decorators that unifies `@GrpcMethod` and `@GrpcStreamMethod`.

## Installation

`@bufbuild/protoc-gen-es` and `@bufbuild/protobuf` is required. See [protoc-gen-es's doc](https://github.com/bufbuild/protobuf-es/tree/main/packages/protoc-gen-es#installation) for detail.

```
npm install --save-dev @bufbuild/protoc-gen-es protoc-gen-nestjs
npm install @bufbuild/protobuf
```

## Usage

The demo implementation is available [here](/demo).

### Generating codes

Add a new configuration file `buf.gen.yaml`:

```yaml
# buf.gen.yaml defines a local generation template.
# For details, see https://docs.buf.build/configuration/v1/buf-gen-yaml
version: v1
plugins:
  # This will invoke protoc-gen-es and write output to src/gen
  - name: es
    out: src/gen
    opt: target=ts
  # This will invoke protoc-gen-nestjs and write output to src/gen
  - name: nestjs
    out: src/gen
    opt: target=ts
```

Add the following script to your `package.json`:

```json
{
  "name": "your-package",
  "version": "1.0.0",
  "scripts": {
    "generate": "buf generate"
  }
  // ...
}
```

To generate code for all protobuf files within your project, simply run:

```
npm run generate
```

### Implementation

For example, the following definition:

```proto
service ElizaService {
  rpc Say(SayRequest) returns (SayResponse) {}
}

message SayRequest {
  string sentence = 1;
}
message SayResponse {
  string sentence = 1;
}
```

`ElizaServiceController` interface and `ElizaServiceMethods` decorator will be generated.

You can implement the controller like this:

```ts
@Controller()
@ElizaServiceMethods()
export class ElizaController implements ElizaServiceController {
  async say(request: SayRequest): Promise<SayResponse> {
    return new SayResponse({
      sentence: request.sentence,
    });
  }
}
```

Streaming is also supported. See [NestJS's doc](https://docs.nestjs.com/microservices/grpc) for detail.
