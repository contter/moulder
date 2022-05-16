import { MOULDER_CONTAINER_ID } from './constants';

export const container = document.createElement('div');
container.id = MOULDER_CONTAINER_ID;

if (!document.body.classList.contains('init')) {
  document.body.classList.add('init');
  document.body.append(container);
}
