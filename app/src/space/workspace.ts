import * as PIXI from 'pixi.js';
import { DropShadowFilter } from '@pixi/filter-drop-shadow';
import { AudiOtterComposition } from '../hooks/AudiOtterState';
import { DeepReadonly } from 'vue';
import { Feedback, AudiOtterState, Module } from '../hooks/types';
import { IntractiveTool } from '../hooks/intractive_tool';
import DelayIcon from '../assets/icons/delay.svg';
import OscillatorIcon from '../assets/icons/oscillator.svg';
import BiquadSvg from '../assets/icons/biquad.svg';
import GainSvg from '../assets/icons/gain.svg';
import MicIcon from '../assets/icons/mic.svg';
import SpeakerIcon from '../assets/icons/speaker.svg';
import WaveShaperIcon from '../assets/icons/wave_shaper.svg';

type ModuleMap = {
  [key in Module['brand']]: string;
}

const moduleLabels: ModuleMap = {
  'mic_in': 'Mic.',
  'biquad_filter': 'Biquad',
  'delay': 'Delay',
  'speaker_out': 'Speaker',
  'gain': 'Gain',
  'oscillator': 'Osc.',
  'wave_shaper': 'Shaper'
}

const moduleIcons = {
  'mic_in': MicIcon,
  'biquad_filter': BiquadSvg,
  'delay': DelayIcon,
  'speaker_out': SpeakerIcon,
  'gain': GainSvg,
  'oscillator': OscillatorIcon,
  'wave_shaper': WaveShaperIcon,
}

type ModuleColors = {
  [key in Module['brand']]?: number;
}
const moduleFillColors: ModuleColors = {
  'mic_in': 0xF288C2,
  'oscillator': 0xF288C2,
  'speaker_out': 0xF25D27,
}

const componentSize = 60;
const halfOfComponent = componentSize / 2;

const createModuleComponent = (module: Module, selectedItemIds: readonly string[]) => {
  const { position, brand,  } = module;
  const group = new PIXI.Container();
  group.name = module.id;

  const body = new PIXI.Graphics()
    .beginFill(moduleFillColors[brand] ?? 0x683FBF)
    .drawRoundedRect(0, 0, componentSize, componentSize, 5)
    .endFill();
  group.addChild(body);

  const texture = PIXI.Texture.from(moduleIcons[brand]);
  const sprite = new PIXI.Sprite(texture);
  sprite.anchor.set(0.5);
  sprite.x = halfOfComponent;
  sprite.y = halfOfComponent - 5;
  group.addChild(sprite);


  const text = new PIXI.Text(moduleLabels[brand], {
     fontFamily: 'Arial',
     fontSize: 14,
     fill: 0xF2E4D8,
     align: 'center',
 });

 text.anchor.set(0.5);
 text.x = halfOfComponent;
 text.y = halfOfComponent + 20;


  group.addChild(text);

  const offset = selectedItemIds.indexOf(module.id) >= 0 ? 0 : 5;
  const dropShadowFilter = new DropShadowFilter();
  dropShadowFilter.color = 0x000010;
  dropShadowFilter.alpha = 0.5;
  dropShadowFilter.blur = 1;
  dropShadowFilter.offset = { x: offset, y: offset };
  body.filters = [dropShadowFilter];

  group.x = position.x;
  group.y = position.y;

  return group;
}

export interface Workspace {
  update: (state: AudiOtterComposition) => void;
}

const bindModuleEvent = (module: PIXI.DisplayObject, { tool }: AudiOtterComposition) => {
  module.eventMode = 'dynamic';
  module.on('pointerdown', (ev) => {
    ev.stopPropagation();
    tool.value.onDown({
      position: [ev.global.x - halfOfComponent, ev.global.y - halfOfComponent],
      itemId: module.name as string
    })
  });
  module.on('pointerup', (ev) => {
    ev.stopPropagation();
    tool.value.onUp({
      position: [ev.global.x - halfOfComponent, ev.global.y - halfOfComponent],
      itemId: module.name as string
    })
  });
  module.on('pointerupoutside', (ev) => {
    ev.stopPropagation();
    tool.value.onUp({
      position: [ev.global.x - halfOfComponent, ev.global.y - halfOfComponent],
      itemId: module.name as string
    })
  });
  module.on('pointermove', (ev) => {
    ev.stopPropagation();
    tool.value.onMove({
      position: [ev.global.x - halfOfComponent, ev.global.y - halfOfComponent],
      itemId: module.name as string
    })
  });
}

interface Point {
  x: number;
  y: number;
}
const drawLine = (line: PIXI.Graphics, source: Point, destination: Point, selected: boolean) => {
    line.clear();
    line.lineStyle(2, selected ? 0xff0000 : 0, 1);
    line.moveTo(source.x + halfOfComponent, source.y + halfOfComponent);
    line.lineTo(destination.x + halfOfComponent, destination.y + halfOfComponent);
};
const drawArrow = (arrow: PIXI.Graphics, source: Point, destination: Point, selected: boolean) => {
  const dx = destination.x - source.x;
  const dy = destination.y - source.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  if (length <= 0) return

  
  const color = selected ? 0xff0000 : 0;
  arrow.lineStyle(1, color, 1);
  arrow.beginFill(color);

  const unitDx = dx / length;
  const unitDy = dy / length;
  const arrowWidth = 15;
  const arrowX = (source.x + destination.x) / 2;
  const arrowY = (source.y + destination.y) / 2;
  arrow.moveTo(arrowX + halfOfComponent + unitDx * 20, arrowY + halfOfComponent + unitDy * 20);
  arrow.lineTo(arrowX + unitDy * arrowWidth + halfOfComponent, arrowY - unitDx * arrowWidth + halfOfComponent);
  arrow.lineTo(arrowX - unitDy * arrowWidth + halfOfComponent, arrowY + unitDx * arrowWidth + halfOfComponent);
  arrow.lineTo(arrowX + halfOfComponent + unitDx * 20, arrowY + halfOfComponent + unitDy * 20);

  arrow.endFill();
};

const drawLinks = (
  state: DeepReadonly<AudiOtterState>,
  tool: DeepReadonly<IntractiveTool>,
  ) => {
  const { modules, linkMap } = state;
  const links = new PIXI.Container();
  linkMap.forEach((link, key) => {
    const { sourceId, destinationId } = link;
    const connectableModule = modules.find((module) => module.id === sourceId);
    const outModule = modules.find((module) => module.id === destinationId);
    if (connectableModule && outModule) {
      const linkContainer = new PIXI.Container();
      const source = connectableModule.position;
      const destination = outModule.position;
      const line = new PIXI.Graphics();
      const selected = !!state.selectedItems.find((item) => item === key);
      drawLine(line, source, destination, selected);

      const arrow = new PIXI.Graphics();
      drawArrow(arrow, source, destination, selected);

      linkContainer.addChild(line);
      linkContainer.addChild(arrow);

      linkContainer.eventMode = 'dynamic';
      linkContainer.on('pointerup', (ev) => {
        ('pointerdown');
        tool.onUp({
          position: [ev.global.x, ev.global.y],
          itemId: key,
        });
      });
      links.addChild(linkContainer);
    }
  });
  return links;
}

const drawModules = (state: DeepReadonly<AudiOtterState>) => {
  const modules = new PIXI.Container();
  state.modules.forEach((module) => {
    const moduleComponent = createModuleComponent(module as Module, state.selectedItems);
    modules.addChild(moduleComponent);
  });
  return modules;
}

const bgColor = 0xF2E4D8
const drawBackground = (view: PIXI.ICanvas, tool: IntractiveTool) => {
    const bg = new PIXI.Graphics();
    bg.beginFill(bgColor, 0.001);  // 透明な四角形
    bg.drawRect(0, 0, view.width, view.height);
    bg.endFill();
    bg.eventMode='dynamic'
    bg.on('pointerdown', (ev) => {
      tool.onDown({
        position: [ev.globalX, ev.globalY],
        itemId: undefined,
      })
    })
    bg.on('pointermove', (ev) => {
      tool.onMove({
        position: [ev.globalX, ev.globalY],
        itemId: undefined,
      })
    })
    bg.on('pointerup', (ev) => {
      tool.onUp({
        position: [ev.globalX, ev.globalY],
        itemId: undefined,
      })
    })
    return bg
}

const drawFeedback = (feedback: Feedback) => {
  const line = new PIXI.Graphics();
  drawLine(line, feedback.src, feedback.des, false);
  return line
}

const createWorkspace = (view: HTMLCanvasElement): Workspace => {
  const pixiApp = new PIXI.Application({
    view,
    resizeTo: window,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: bgColor,
  });

  return {
    update: (composition: AudiOtterComposition) => {
      const { state, tool } = composition;
      const { feedBack } = state;
      pixiApp.stage.removeChildren();

      if (feedBack) {
        pixiApp.stage.addChild(
          drawFeedback(feedBack)
        );
      }

      const bg = drawBackground(pixiApp.view, tool.value)
      pixiApp.stage.addChild(bg);

      const board = new PIXI.Container();
      pixiApp.stage.addChild(board);
      const linkLayer = drawLinks(state, tool.value);
      board.addChild(linkLayer);
      const modules = drawModules(state);
      modules.children.forEach((module) => {
        bindModuleEvent(module, composition);
      })
      board.addChild(modules);
    },
  };
}

export default createWorkspace
