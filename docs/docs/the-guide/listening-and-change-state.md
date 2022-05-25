---
sidebar_position: 5
---

# Listening and change state

You can track changes in a property and a node.

### Changing the value at the property
```javascript
const propRandom = moulder.node.useProperty('between', 'Count', { min: 0, max: 10, minMin: 0, maxMax: 10  });

moulder.subscribe((reaction) => {
    reaction(
      () => propRandom.value,
      (value, prevValue) => {
        // 
      }
    );
});
```

### Changes in state at the property
```javascript
const propRandom = moulder.node.useProperty('between', 'Count', { min: 0, max: 10, minMin: 0, maxMax: 10  });

moulder.subscribe((reaction) => {
    reaction(
      () => propRandom.readState, 
      (value, prevValue) => {
        // 
      }
    );
});
```

### Changes in state at the node
```javascript
const node = moulder.root.createNode('Name');

moulder.subscribe((reaction) => {
    reaction(
      () => node.readState, 
      (value, prevValue) => {
        // 
      }
    );
});
```

