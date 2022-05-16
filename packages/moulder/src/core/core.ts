import { MOULDER_IS_EDITOR, MOULDER_IS_HASH } from './constants';
import './relay';
import './capture/event';
import { runEditor } from './editor';
import { getType } from './utils';
import { EType } from './types';
import { runProperty } from './windows/property';
import { runNode } from './windows/node';
import { runAsset } from './windows/asset';
import { registerComponent } from './components';
import { betweenComponent, booleanComponent } from './components/default';
import { runToken } from './token';

if (MOULDER_IS_HASH) {
  // From token
  runAsset();
} else if (window.MOULDER_TOKEN) {
  runToken();
} else if (MOULDER_IS_EDITOR) {
  runEditor();
} else if (getType() === EType.PROPERTY) {
  runProperty();
} else if (getType() === EType.NODE) {
  runNode();
} else if (getType() === EType.ASSET) {
  runAsset();
}

registerComponent('between', betweenComponent());
registerComponent('boolean', booleanComponent());
