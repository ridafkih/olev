import type { Type } from "arktype"

export class EnvironmentVariableManager<ArkTypeValidationType extends Type> {
  private validatedProcessEnv: ArkTypeValidationType["infer"]
  
  constructor(
    processEnv: NodeJS.ProcessEnv,
    { assert }: ArkTypeValidationType
  ) {
    this.validatedProcessEnv = assert(processEnv);
  }

  public getValue(key: keyof ArkTypeValidationType["infer"]) {
    return this.validatedProcessEnv[key];
  }
}
