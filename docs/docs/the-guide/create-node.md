---
sidebar_position: 3
---

# Create The Node

Нода - ключевой элемент в работе фреймворка.
К ноде привязываются свойства.

### Create the node
```javascript
// moulder.node - it's the root node.
const node = moulder.root.createNode('Name');
```
:::warning
Название ноды должно быть уникально.
:::

Нода может имеет следующее опции:
- Скрыта
- Заблокированна
- Удалена

По умолчанию у ноды включены все опции, но вы можете выбрать вручную
```javascript
// only visible
const node1 = moulder.root.createNode('Name 1', { "actions": ["visible"]});
// only locked
const node2 = moulder.root.createNode('Name 2', { "actions": ["locked"]});
// only deleted
const node3 = moulder.root.createNode('Name 3', { "actions": ["deleted"]});
// без опций
const node4 = moulder.root.createNode('Name 4', { "actions": []});
```

### Delete the node
```javascript
node.remove();
```
:::info
Ноды не удаляются полность. У них меняется статус на deleted.
:::

### Change the state of node
```javascript
// set visible
node.setState({ visible: false });
// set locked
node.setState({ locked: false });
```

### Get children of node
```javascript
const children = node.children;
```

Как подписаться на обновления свойста.

Читать статью - [Listening and change state](/).
