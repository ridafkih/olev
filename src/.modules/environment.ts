import type { Type } from "arktype"

/**
 * Validates the environment variables on instantiation against the
 * arktype validation schema.
 */
export class EnvironmentVariableManager<ArkTypeValidationType extends Type> {
  private validatedProcessEnv: ArkTypeValidationType["infer"]
  
  constructor(
    processEnv: NodeJS.ProcessEnv,
    { assert }: ArkTypeValidationType
  ) {
    this.validatedProcessEnv = assert(processEnv);
  }

  public get<
    Key extends keyof ArkTypeValidationType["infer"]
  >(key: Key): ArkTypeValidationType["infer"][Key] {
    return this.validatedProcessEnv[key];
  }

  public getAll(): ArkTypeValidationType["infer"] {
    return this.validatedProcessEnv;
  }
}
