// src/generate-zod.ts
import { getDMMF } from "@prisma/internals";
import fs from "fs";
import path from "path";

async function main() {
  // 1) Load schema.prisma
  const schemaPath = path.resolve(process.cwd(), "prisma/schema.prisma");
  const datamodel = fs.readFileSync(schemaPath, "utf-8");
  const {
    datamodel: { enums, models },
  } = await getDMMF({ datamodel });

  let out = "";
  out += `import { z } from 'zod';\n`;
  out += `import { Prisma } from '@prisma/client';\n\n`;

  // 2) Generate native enums + Zod schema
  for (const en of enums) {
    const vals = en.values.map((v) => `"${v.name}"`).join(", ");
    out += `export const ${en.name}_schema = z.enum([${vals}]);\n`;
    out += `export type ${en.name} = z.infer<typeof ${en.name}_schema>;\n\n`;
  }

  // 3) Generate model schemas (only scalars + enums)
  out += `// ———————— Model Schemas ————————\n`;
  for (const m of models) {
    out += `export const ${m.name}_schema = z.object({\n`;

    for (const f of m.fields) {
      // ignore relations
      if (f.kind !== "scalar" && f.kind !== "enum") continue;

      // 3.1) choose base Zod type
      let zodType: string;
      if (f.kind === "enum") {
        zodType = `${f.type}_schema`;
      } else {
        switch (f.type) {
          case "String":
            zodType = "z.coerce.string()";
            break;
          case "Int":
            zodType = "z.coerce.number().int()";
            break;
          case "Float":
            zodType = "z.coerce.number()";
            break;
          case "Boolean":
            zodType = "z.coerce.boolean()";
            break;
          case "DateTime":
            zodType = `z.preprocess((val: unknown) => val instanceof Date ? val : (typeof val === 'string' || typeof val === 'number' ? new Date(val) : undefined), z.date())`;
            break;
          case "Decimal":
            zodType = `z.preprocess(v => v instanceof Prisma.Decimal ? v.toNumber() : v, z.number())`;
            break;
          default:
            zodType = "z.any()";
        }
      }

      // 3.2) array?
      if (f.isList) zodType += ".array()";
      // 3.3) optional?
      if (!f.isRequired) zodType += ".optional().nullable()";

      out += `  ${f.name}: ${zodType},\n`;
    }

    out += `});\n`;
    out += `export type ${m.name} = z.infer<typeof ${m.name}_schema>;\n\n`;
  }

  // 4) Write to disk
  const target = path.resolve(__dirname, "generated", "zod.schema.ts");
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, out);
  console.log("✓ schemas generated in src/generated/zod.schema.ts");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
