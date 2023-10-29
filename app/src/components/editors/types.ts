import { UpdateModuleParamEvent } from "../../hooks/types";

export type OnUpdateParam<T extends UpdateModuleParamEvent> = <K extends keyof T['param']>(key: K, p: T['param'][K]) => void
