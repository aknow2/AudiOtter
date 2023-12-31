import { readonly, ref } from "vue"
import { AudiOtterState, Module, ModuleBrand, Position } from "./types"
import { canCreateLink, connectModules, createLinkId, createModuleCreator } from "./module_updater"

interface IntractiveEvent {
  itemId: string | undefined
  position: [number, number]
}


export interface IntractiveTool {
  onDown: (ev: IntractiveEvent) => void
  onUp: (ev: IntractiveEvent) => void
  onMove: (ev: IntractiveEvent) => void
}
const updateModulePosition = (state: AudiOtterState, position: [number, number], moduleId: string | undefined) => {
  if (moduleId === undefined) return;

  state.modules = state.modules.map((module) => {
    if (module.id === moduleId) {
      module.position = {
        x: position[0],
        y: position[1],
      }
    }
    return module;
  }
  );
}
const toggleSelectedItem = (state: AudiOtterState, itemId: string | undefined) => {
  const existItem = state.selectedItems.find((item) => item === itemId);
  // current only support single selection
  if (existItem || itemId === undefined) {
    state.selectedItems = [];
  } else {
    state.selectedItems = [itemId];
  }
};
export const createDefaultIntractiveTool = ({ state }: ToolContext): IntractiveTool  => ({
  onDown(ev) {
    if (ev.itemId === undefined) return;
    state.draggingItem = {
      id: ev.itemId,
      offset: ev.position,
    };
  },
  onMove(ev) {
    const { draggingItem } = state
    if (draggingItem) {
      const { id, offset } = draggingItem
      updateModulePosition(state, [ev.position[0] - offset[0], ev.position[1] - offset[1]], id);
    }
  },
  onUp(ev) {
    const { draggingItem } = state
    if (draggingItem) {
      const { id, offset } = draggingItem
      updateModulePosition(state, [ev.position[0] - offset[0], ev.position[1] - offset[1]], id);
      state.draggingItem = undefined;
    }
    toggleSelectedItem(state, ev.itemId);
  },
})

const createFeedback = (module: Module, state: AudiOtterState) => {
  state.feedBack = {
    brand: 'line',
    srcId: module.id,
    src: module.position,
    des: module.position,
  }
}

const updateFeedbackIfExist = (position: Position, state: AudiOtterState) => {
  const { feedBack } = state 
  if (feedBack) {
    state.feedBack = {
      ...feedBack,
      des: position,
    }
  }
}

export const createConnectingModuleTool = ({state}: ToolContext): IntractiveTool  => {
  return {
    onDown(ev) {
      const module = state.modules.find((m) => m.id === ev.itemId)
      if (module){
        createFeedback(module, state);
      }
    },
    onMove({ position }) {
      updateFeedbackIfExist({ x: position[0], y: position[1] }, state);
    },
    onUp({ itemId }) {
      const srcModule =  state.modules.find((m) => m.id === state.feedBack?.srcId)
      const desModule = state.modules.find((m) => m.id === itemId)
      if (desModule && srcModule) {
        const linkId = createLinkId(srcModule, desModule);
        if (canCreateLink(state.linkMap, srcModule, desModule, linkId)) {
          srcModule.destinations.push({ target: 'node', id: desModule.id });
          connectModules(srcModule, state);
          state.linkMap = new Map(state.linkMap)
        }
      }
      state.feedBack = undefined
      toggleSelectedItem(state, itemId);
    },
  }
};

export const createCreateModuleTool = (param: CreateModuleToolParam) => ({ state, changeTool }: ToolContext): IntractiveTool  => {
  const create = createModuleCreator(state)
  return {
    onDown() {},
    onMove() {},
    onUp({ itemId, position }) {
      if (itemId) return;
      const [x, y] = position
      create({
        type: param.type,
        x,
        y,
      })
      changeTool({ type: 'default' })
    },   
  }
}

interface ConnectingModuleToolParam {
  type: 'cable'
}

interface CreateModuleToolParam {
  type: ModuleBrand
}

interface defaultToolParam {
  type: 'default'
}

export type CreateToolParam = ConnectingModuleToolParam | defaultToolParam | CreateModuleToolParam
export type PaletteType = CreateToolParam['type']
const createToolCreator = (param: CreateToolParam) => {
  switch(param.type) {
    case 'cable':
      return createConnectingModuleTool
    case 'delay':
    case 'biquad_filter':
    case 'oscillator':
    case 'gain':
    case 'wave_shaper':
    case 'convolver':
    case 'recording':
      return createCreateModuleTool(param)
    default:
      return createDefaultIntractiveTool
  }
}

interface ToolContext {
  changeTool: (param: CreateToolParam) => void
  state: AudiOtterState
}
export const useIntractiveTool = (state: AudiOtterState) => {
  const selectedPalette = ref<PaletteType>('default')

  const changeTool = (param: CreateToolParam) => {
    selectedPalette.value = param.type
    tool.value = createToolCreator(param)(toolContext)
  }
  const toolContext: ToolContext = {
    changeTool,
    state,
  }
  const tool = ref<IntractiveTool>(createDefaultIntractiveTool(toolContext))

  return {
    tool,
    selectedPalette: readonly(selectedPalette),
    changeTool: toolContext.changeTool,
  }
}
