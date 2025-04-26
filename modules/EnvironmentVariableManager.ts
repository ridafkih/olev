import type { Type } from "arktype"

export class EnvironmentVariableManager<ArkTypeValidationType extends Type> {
  private validatedProcessEnv: ArkTypeValidationType["infer"]
  
  constructor(
    processEnv: NodeJS.ProcessEnv,
    { assert }: ArkTypeValidationType
  ) {
    this.validatedProcessEnv = assert(processEnv);
  }

  public getValue<
    Key extends keyof ArkTypeValidationType["infer"]
  >(key: Key): ArkTypeValidationType["infer"][Key] {
    return this.validatedProcessEnv[key];
  }
}
