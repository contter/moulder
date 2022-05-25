---
sidebar_position: 3
---

# Create Node

Node is a base element in the work of the framework.
Properties are bound to the node.

### Create the node
```javascript
// moulder.node - it's the root node.
const node = moulder.root.createNode('Name');
```
:::warning
The name of the node must be unique.
:::

Node may have the following actions:
- Hidden
- Blocked
- Deleted

By default the node has all actions enabled, but you can manually select
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
Nodes are not completely deleted. They change their state to deleted.
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

How to subscribe to property updates.

Read the - [Listening and change state](/docs/the-guide/listening-and-change-state).
