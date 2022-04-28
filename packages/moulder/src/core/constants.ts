export const USE_REQUEST_CAPTURE = 'X_REQUEST_CAPTURE';
export const USE_RESPONSE_CAPTURE = 'X_RESPONSE_CAPTURE';

export const USE_SET_CONF = 'X_USE_SET_CONF';

export const USE_PREPARE = 'X_PREPARE';
export const RESPONSE_PREPARE = 'X_RESPONSE_PREPARE';

export const RESPONSE_VIEWPORT = 'X_RESPONSE_VIEWPORT';

export const USE_SET_THEME = 'X_USE_SET_THEME';

export const IFRAME_ALLOW = 'gyroscope; accelerometer; xr-spatial-tracking; microphone; camera;';
export const IFRAME_SANDBOX = 'allow-same-origin,allow-scripts';
export const RESERVED_WORDS: string[] = 'node,root'.toLowerCase().split(',');

// NEW
export const USE_SET_NODE = 'X_USE_SET_NODE';
export const USE_SET_PARAM = 'X_USE_SET_PARAM';
export const USE_SET_PARAM_STATE = 'X_USE_SET_PARAM_STATE';
export const USE_PROXY_TARGET = 'X_USE_PROXY_TARGET';
export const USE_SWITCH_NODE = 'X_USE_SWITCH_NODE';
export const USE_REGENERATE = 'X_USE_REGENERATE';

export const USE_SET_STATE = 'X_USE_SET_STATE';
export const USE_SET_RESPONSE_STATE = 'X_USE_SET_RESPONSE_STATE';
export const USE_RUN_ASSET = 'X_USE_RUN_ASSET';

export const USE_PING = 'X_PING';

export const USE_ADD_ASSET = 'X_ADD_ASSET';
export const USE_REMOVE_ASSET = 'X_REMOVE_ASSET';

export const IS_HASH = new URLSearchParams(window.location.search).get('hash')?.length ?? 0 > 0;
export const IS_ON_FRAME = window.parent !== window;
// // Dev, enable iframes, run in iframe content. TODO disable dev
export const IS_DEV = parseInt(new URLSearchParams(window.location.search).get('dev') ?? '0', 10) === 1;
// // If run in our editor
export const IS_TYPE = parseInt(new URLSearchParams(window.location.search).get('type') ?? '0', 10);
// If in token
export const IS_STATE = parseInt(new URLSearchParams(window.location.search).get('t') ?? '0', 10) === 1;
// If check
export const IS_CHECK = parseInt(new URLSearchParams(window.location.search).get('check') ?? '0', 10) === 1;
// If is editor mode
// @ts-ignore
const en = Math.random();
const is_editor = {['{{{MOULDER_IS_EDITOR}}}']: en};
export const IS_EDITOR = is_editor['{{{MOULDER_IS_EDITOR}}}'] === en && (parseInt(new URLSearchParams(window.location.search).get('editor') ?? '0', 10) === 1);

export const IPFS_PREFIX_URL = 'https://ipfs.io/ipfs/';
export const URL = window.location.origin + window.location.pathname;

export const THEMES = [
  'light',
  'dark',
  'cupcake',
  'bumblebee',
  'emerald',
  'corporate',
  'synthwave',
  'retro',
  'cyberpunk',
  'valentine',
  'halloween',
  'garden',
  'forest',
  'aqua',
  'lofi',
  'pastel',
  'fantasy',
  'wireframe',
  'black',
  'luxury',
  'dracula',
  'cmyk',
  'autumn',
  'business',
  'acid',
  'lemonade',
  'night',
  'coffee',
  'winter'
];

// SET FROM POST_MESSAGE
export const TEMPLATE_FORMATS = [
  {
    label: 'Poster 2:3 (1600x2400)',
    width: 1600,
    height: 2400,
    value: 1
  },
  {
    label: 'Poster 16:9 (2048x1152)',
    width: 2048,
    height: 1152,
    value: 2
  },
  {
    label: 'Twitter Banner (1500x500)',
    width: 1500,
    height: 500,
    value: 3
  },
  {
    label: 'Twitter Post (1024x512)',
    width: 1024,
    height: 512,
    value: 4
  },
  {
    label: 'Instagram Post (1080x1080)',
    width: 1080,
    height: 1080,
    value: 5
  },
  {
    label: 'Postcard (1500x2100)',
    width: 1500,
    height: 2100,
    value: 6
  }
];
