import { UpdateModuleEvent } from "../../hooks/types";

export type OnUpdateParam<T extends UpdateModuleEvent> = <K extends keyof T['param']>(key: K, p: T['param'][K]) => void
