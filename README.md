# ember-did-change-attrs

This addon is a WIP rethink of [ember-diff-attrs](https://github.com/workmanw/ember-diff-attrs) which offered a decorator style approach to this problem.

With `ember-did-change-attrs` we're going to solve the same problem using mixins instead of decorators. The hope is to offer a cleaner and more clear syntax without sacrificing functionality.


## Installation

`ember install ember-did-change-attrs`

## Usage

```js
import DidChangeAttrs from 'ember-did-change-attrs';

export default Ember.Component.extend(DidChangeAttrs, {
  didChangeAttrsConfig: {
    attrs: ['email', 'isAdmin']
  },

  didChangeAttrs(changes) {
    if(changes.email) {
      let oldEmail = changes.email.previous,
          newEmail = changes.email.current;
      // Do stuff
    }
  }
});
```
