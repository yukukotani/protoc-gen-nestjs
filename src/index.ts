import { createEcmaScriptPlugin } from "@bufbuild/protoplugin";
import { version } from "../package.json";
import {
  makeJsDoc,
  localName,
  GeneratedFile,
} from "@bufbuild/protoplugin/ecmascript";
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
  f.print("export interface ", localServiceName, "Controller {");
  service.methods.forEach((method, i) => {
    if (i !== 0) {
      f.print();
    }
    printMethod(f, method);
  });
  f.print("}");

  const GrpcMethod = f.import("GrpcMethod", "@nestjs/microservices");
  const unaryMethodNames = service.methods
    .filter((method) => method.methodKind === MethodKind.Unary)
    .map((method) => `"${localName(method)}"`)
    .join(", ");
  f.print("export function ", localServiceName, "Methods() {");
  f.print("  return function (constructor: Function) {");
  f.print("    for (const method of [", unaryMethodNames, "]) {");
  f.print(
    "      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);"
  );
  f.print(
    "      ",
    GrpcMethod,
    `("`,
    localServiceName,
    `", method)(constructor.prototype[method], method, descriptor);`
  );
  f.print("    }");
  f.print("  };");
  f.print("}");
}

function printMethod(f: GeneratedFile, method: DescMethod) {
  if (method.methodKind === MethodKind.Unary) {
    f.print(makeJsDoc(method, "  "));
    f.print(
      "  ",
      localName(method),
      "(request: ",
      method.input,
      "): Promise<",
      method.output,
      ">;"
    );
  }
}
