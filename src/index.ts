import { createEcmaScriptPlugin } from "@bufbuild/protoplugin";
import { version } from "../package.json";
import { makeJsDoc, localName, GeneratedFile, ImportSymbol } from "@bufbuild/protoplugin/ecmascript";
import { DescMethod, DescService, MethodKind } from "@bufbuild/protobuf";
import type { Schema } from "@bufbuild/protoplugin/ecmascript";

export const protocGenNestjs = createEcmaScriptPlugin({
  name: "protoc-gen-nestjs",
  version: `v${String(version)}`,
  generateTs,
});

function generateTs(schema: Schema) {
  for (const file of schema.files) {
    const f = schema.generateFile(file.name + "_nestjs.ts");
    f.preamble(file);
    // Convert the Message ImportSymbol to a type-only ImportSymbol
    for (const service of file.services) {
      printService(f, service);
    }
  }
}

function printService(f: GeneratedFile, service: DescService) {
  const localServiceName = localName(service);
  f.print(makeJsDoc(service));
  f.print`export interface ${localServiceName}Controller {`;
  service.methods.forEach((method, i) => {
    if (i !== 0) {
      f.print();
    }
    printMethod(f, method);
  });
  f.print("}");

  const GrpcMethod = f.import("GrpcMethod", "@nestjs/microservices");
  const GrpcStreamMethod = f.import("GrpcStreamMethod", "@nestjs/microservices");
  const unaryReqMethods = service.methods.filter((method) =>
    [MethodKind.Unary, MethodKind.ServerStreaming].includes(method.methodKind)
  );
  const streamReqMethods = service.methods.filter((method) =>
    [MethodKind.BiDiStreaming, MethodKind.ClientStreaming].includes(method.methodKind)
  );

  f.print();
  f.print`export function ${localServiceName}Methods() {`;
  f.print("  return function (constructor: Function) {");
  printGrpcMethodAnnotations(f, GrpcMethod, unaryReqMethods, service);
  printGrpcMethodAnnotations(f, GrpcStreamMethod, streamReqMethods, service);
  f.print("  };");
  f.print("}");
}

function printMethod(f: GeneratedFile, method: DescMethod) {
  const Observable = f.import("Observable", "rxjs");
  const isStreamReq = [MethodKind.BiDiStreaming, MethodKind.ClientStreaming].includes(method.methodKind);
  const isStreamRes = method.methodKind !== MethodKind.Unary;

  const reqType = isStreamReq ? [Observable, "<", method.input, ">"] : [method.input];
  const resType = isStreamRes ? [Observable, "<", method.output, ">"] : ["Promise<", method.output, ">"];

  f.print(makeJsDoc(method, "  "));
  f.print`  ${localName(method)}(request: ${reqType}): ${resType};`;
}

function printGrpcMethodAnnotations(
  f: GeneratedFile,
  annotation: ImportSymbol,
  methods: DescMethod[],
  service: DescService
) {
  const methodNames = methods.map((method) => `"${localName(method)}"`).join(", ");

  f.print`    for (const method of [${methodNames}]) {`;
  f.print`      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);`;
  f.print`      ${annotation}("${localName(service)}", method)(constructor.prototype[method], method, descriptor);`;
  f.print`    }`;
}
