---
sidebar_position: 5
---

# Listening and change state

Вы можете отслеживать изменения у свойства и ноды.

### Изменения значения у свойства
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

### Изменения состояние у свойства
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

### Изменения состояние у ноды
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

