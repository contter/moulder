export const MOULDER_CONTAINER_ID = 'moulder';
// TODO Don't use in production
const en = Math.random();
const is_editor = { ['{MOULDER_IS_FLAG_EDITOR}']: en };
export const MOULDER_IS_EDITOR =
  is_editor['{MOULDER_IS_FLAG_EDITOR}'] === en && (parseInt(
    new URLSearchParams(window.location.search).get('editor') ?? '0',
    10
  ) === 1);
const ed = Math.random();
const is_dev = { ['{MOULDER_IS_FLAG_DEV}']: ed };
export const MOULDER_IS_DEV =
  is_dev['{MOULDER_IS_FLAG_DEV}'] === ed && (parseInt(
    new URLSearchParams(window.location.search).get('dev') ?? '0',
    10
  ) === 1);
export const MOULDER_IFRAME_ALLOW =
  'gyroscope; accelerometer; xr-spatial-tracking; microphone; camera;';
export const MOULDER_IFRAME_SANDBOX =
  'allow-same-origin allow-scripts allow-modals';
export const MOULDER_IPFS_PREFIX_URL = `${window.location.protocol}//${window.location.hostname}/ipfs/`; // 'https://ipfs.io/ipfs/';
export const MOULDER_ASSET_ID = parseInt(
  new URLSearchParams(window.location.search).get('id') ?? '0',
  10
);
export const MOULDER_IS_HASH = new URLSearchParams(window.location.search).get(
  'hash'
);
export const MOULDER_IS_CHECK =
  parseInt(
    new URLSearchParams(window.location.search).get('check') ?? '0',
    10
  ) === 1;

export const MOULDER_CONFIG_MAX_SIZE = 4000;
export const MOULDER_CONFIG_MIN_SIZE = 100;
export const MOULDER_CONFIG_DEFAULT_SIZE = 1000;

export const MOULDER_CMD_SET_STATE = 'MOULDER_CMD_SET_STATE';
export const MOULDER_CMD_PATCH_STORE = 'MOULDER_CMD_PATCH_STORE';
export const MOULDER_CMD_PROXY_SEND = 'MOULDER_CMD_PROXY_SEND';
export const MOULDER_CMD_PROXY = 'MOULDER_CMD_PROXY';
export const MOULDER_CMD_PROXY_RECEIVER = 'MOULDER_CMD_PROXY_RECEIVER';
export const MOULDER_PREFIX = 'MOULDER_';
export const MOULDER_CMD_REGENERATE = 'MOULDER_CMD_REGENERATE';
export const MOULDER_CMD_REPEAT = 'MOULDER_CMD_REPEAT';
export const MOULDER_CMD_APPLY = 'MOULDER_CMD_APPLY';
export const MOULDER_CMD_APPLIED = 'MOULDER_CMD_APPLIED';
export const MOULDER_CMD_CANCEL_APPLY = 'MOULDER_CMD_CANCEL_APPLY';
export const MOULDER_CMD_STATUS = 'MOULDER_CMD_STATUS';
export const MOULDER_CMD_READY = 'MOULDER_CMD_READY';
export const MOULDER_CMD_SET_THEME = 'MOULDER_CMD_SET_THEME';
export const MOULDER_CMD_REQUEST_CAPTURE = 'MOULDER_CMD_REQUEST_CAPTURE';
export const MOULDER_CMD_RESPONSE_CAPTURE = 'MOULDER_CMD_RESPONSE_CAPTURE';
export const MOULDER_CMD_CLEAR_SELECTION = 'MOULDER_CMD_CLEAR_SELECTION';
export const MOULDER_CMD_SET_CONF = 'MOULDER_CMD_SET_CONF';
export const MOULDER_CMD_ADD_ASSET = 'MOULDER_CMD_ADD_ASSET';
export const MOULDER_CMD_REMOVE_ASSET = 'MOULDER_CMD_REMOVE_ASSET';

export const MOULDER_IS_ON_FRAME = window.parent !== window;

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
  'winter',
];

export const TEMPLATES = [
  {
    label: 'Contter Image (1000x1000)',
    value: [1000, 1000],
    active: true,
  },
  {
    label: 'Twitter Cover (1500x500)',
    value: [1500, 500],
    active: false,
  },
  {
    label: 'Twitter Tweet Image (1200x675)',
    value: [1200, 675],
    active: false,
  },
  {
    label: 'Instagram Post (1080x1080)',
    value: [1080, 1080],
    active: false,
  },
  {
    label: 'Instagram Stories (1080x1920)',
    value: [1080, 1920],
    active: false,
  },
  {
    label: 'Facebook Post (1200x630)',
    value: [1200, 630],
    active: false,
  },
  {
    label: 'Youtube Cover (2560x1440)',
    value: [2560, 1440],
    active: false,
  },
  {
    label: 'Square 1:1 (1500x1500)',
    value: [1500, 1500],
    active: false,
  },
  {
    label: 'Landscape 16:9 (1920x1080)',
    value: [1920, 1080],
    active: false,
  },
  {
    label: 'Portrait 9:16 (1080x1920)',
    value: [1080, 1920],
    active: false,
  },
  {
    label: 'Office A4 (3508x2480)',
    value: [3508, 2480],
    active: false,
  },
];
