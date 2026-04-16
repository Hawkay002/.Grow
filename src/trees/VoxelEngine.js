import { cherryblossom } from './presets/CherryBlossom';
import { pine } from './presets/Pine';
import { socotradragon } from './presets/SocotraDragon';
import { maple } from './presets/Maple';
import { juniper } from './presets/Juniper';
import { baobab } from './presets/Baobab';
import { weepingwillow } from './presets/WeepingWillow';
import { cactus } from './presets/Cactus';
import { magnolia } from './presets/Magnolia';

const PRESETS = {
  cherryblossom,
  pine,
  'socotra dragon': socotradragon,
  maple,
  juniper,
  baobab,
  'weeping willow': weepingwillow,
  cactus,
  'southern magnolia': magnolia
};

export const TREE_THEMES = Object.keys(PRESETS).reduce((acc, key) => {
  acc[key] = PRESETS[key].theme;
  return acc;
}, {});

export function generateTree(treeType, qrData, qrSize) {
  const preset = PRESETS[treeType] || PRESETS.cherryblossom;
  return preset.generate(qrData, qrSize);
}
