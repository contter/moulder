---
sidebar_position: 2
---

# Use The Property

Свойства отображают в правом сайдбаре.
Свойства полностью настраиваемыеб вы можете легко написать свои компоненты для них (ссылка как написать свой).

Рассмотрим как работает дефолный компонент `between`, который возвращает случайной число из заданного интервале.

Свойство привязывается к конкретной ноде (как создать ноду - [читать здесь](/)).

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

Как подписаться на обновления свойста.

Читать статью - [Listening and change state](/).
