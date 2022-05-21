import { getParent, Instance, types } from 'mobx-state-tree';
import {
  IMoulderNodeState,
  IMoulderProperty,
  IMoulderPropertyOpts,
  IMoulderPropertyState,
} from '../types';
import { deepCopy, slugify } from '../utils';
import { components } from '../components';

const PropertyOptions = types.model({
  ignore: types.optional(types.boolean, false),
});

export const Property = types
  .model({
    id: types.identifier,
    name: types.string,
    component: types.string,
    state: types.optional(types.map(types.frozen()), {}),
    options: PropertyOptions,
  })
  .views((self) => ({
    get value() {
      return self.state.get('value');
    },
    get readState() {
      return Object.fromEntries(
        [...self.state.keys()].map((a) => [[a], self.state.get(a)])
      );
    },
    get node(): boolean {
      return getParent(self, 2) as Instance<typeof Node>;
    },
  }))
  .actions((self) => ({
    change(state) {
      if (!getParent<typeof Node>(self, 2).locked) {
        self.state.merge(state);
      }
    },
  }));

export const Node = types
  .model({
    id: types.identifier,
    name: types.string,
    properties: types.array(Property),
    state: types.optional(
      types.map(
        types.union(
          types.boolean,
          types.string,
          types.number,
          types.array(types.string),
          types.array(types.number)
        )
      ),
      {}
    ),
    childrenLocal: types.optional(types.array(types.late(() => Node)), []),
    options: types.optional(types.map(types.frozen()), {}),
  })
  .volatile<{}>((_) => ({
    // callbacks: {},
  }))
  .views((self) => ({
    get parent(): Instance<typeof Node> | undefined {
      return self.id === 'root' ? undefined : getParent(self, 2);
    },
    get visible(): boolean {
      return self.state.get('visible') as boolean;
    },
    get locked(): boolean {
      return self.state.get('locked') as boolean ?? false;
    },
    get collapse(): boolean {
      return self.state.get('collapse') as boolean;
    },
    get deleted(): boolean {
      return self.state.get('deleted') as boolean;
    },
    get readState() {
      return Object.fromEntries(
        [...self.state.keys()].map((a) => [[a], self.state.get(a)])
      );
    },
    get children() {
      return self.childrenLocal.filter((a) => !a.state.get('deleted'));
    },
  }))
  .actions((self) => ({
    setState(state: IMoulderNodeState) {
      // TODO Check action available
      self.state.merge(state);
    },

    useProperty(
      component: string,
      name: string,
      state: IMoulderPropertyState,
      options: IMoulderPropertyOpts = {}
    ): IMoulderProperty | null {
      const id = slugify(name);
      const comp = components[component];
      if (!comp) {
        throw new Error('Not find a component');
      }

      const exist = self.properties.find(
        (a) => a.id === id
      ) as unknown as IMoulderProperty | null;
      if (exist) {
        const value = comp.call(deepCopy(exist.state.toJSON()));
        exist.change({ value });
        return exist;
      }

      // Call component
      const value = comp.call(state);

      const prop = {
        id,
        name,
        component,
        options,
        value,
        state: {
          ...state,
          value,
        },
      };
      self.properties.push(prop);
      return self.properties.find(
        (a) => a.id === id
      ) as unknown as IMoulderProperty | null;
    },

    createNode(name: string, options = {}) {
      /// options // available Action // delete locked visible
      // TODO Validation
      const id = slugify(name);

      const exist = self.childrenLocal.find((a) => a.id === id);
      if (exist) {
        return exist;
      }

      const defaultOptions = {
        actions: ['visible', 'locked', 'deleted'],
      };

      const node: Instance<typeof Node> = {
        name,
        id,
        state: {
          collapse: false,
          locked: false,
          deleted: false,
          visible: true,
        },
        options: {
          ...defaultOptions,
          ...options,
        },
      };
      self.childrenLocal.push(node);

      return self.childrenLocal.find((a) => a.id === node.id);
    },

    remove() {
      if (!self.locked) {
        self.state.merge({ deleted: true });
      }
    },
  }));
