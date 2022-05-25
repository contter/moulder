---
sidebar_position: 2
---

# Use Property

The properties are displayed in the right sidebar. The properties are fully customizable, and you can easily write your own components for them (link how to write your own).

Let's see how the default component of between works, which returns a random number from a given range.

The property is bound to a specific node ([read here how to create a node](/docs/the-guide/create-node)).

```javascript
// moulder.node - it's the root node.
const propRandom = moulder.node.useProperty('between', 'Count', { min: 0, max: 10, minMin: 0, maxMax: 10  });
```

#### Arguments
1. The name of component.
2. The name of property (unique).
3. The state of property (key - value).


### Get a value
```javascript
const val = propRandom.value;
```

### Change the state of property
```javascript
propRandom.change({ value: 10 });
// or
propRandom.change({ min: 5 });
```

How to subscribe to property updates.

Read the - [Listening and change state](/docs/the-guide/listening-and-change-state).
