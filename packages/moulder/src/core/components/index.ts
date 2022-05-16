import { IMoulderComponent } from '../types';

interface IComponents {
  [key: string]: IMoulderComponent;
}

export const components: IComponents = {};

export const registerComponent = (name: string, comp: IMoulderComponent) => {
  components[name] = comp;
};
