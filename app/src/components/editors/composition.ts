import { Ref, ref } from "vue";
import { UpdateModuleEvent } from "../../hooks/types";

const createUpdater = <T extends UpdateModuleEvent>(ev: T, onChange: (ev: T) => void) => 
  <P extends T['param']> (refParam: Ref<P>) =>
  <K extends keyof P>(key: K, v: P[K]) => {
  refParam.value  = {
    ...refParam.value,
    [key]: v,
  }

  onChange({
    ...ev,
    param: refParam.value,
  } as T)
}
const useSourceModuleEditor = <T extends UpdateModuleEvent>(event: T, onChange: (ev: T) => void) => {
  const param = ref<T['param']>(event.param);
  const onUpdate = createUpdater(event, onChange)(param);
  return {
    param,
    onUpdate,
  }
}

export default useSourceModuleEditor
