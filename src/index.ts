import { createEcmaScriptPlugin } from "@bufbuild/protoplugin";
import { version } from "../package.json";
import { makeJsDoc, localName } from "@bufbuild/protoplugin/ecmascript";
import { MethodKind } from "@bufbuild/protobuf";
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
      const localServiceName = localName(service);
      f.print(makeJsDoc(service));
      f.print("export interface ", localServiceName, "Controller {");
      service.methods.forEach((method, i) => {
        if (i !== 0) {
          f.print();
        }
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
      });
    }
    f.print("}");
  }
}
