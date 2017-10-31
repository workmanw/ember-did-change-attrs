import WeakMap from 'ember-weakmap';
import Ember from 'ember';

function isEqual(key, a, b) {
  return a === b;
}

export default Ember.Mixin.create({
  _didChangeAttrsWeakMap: null, //this tracks previous state of any `trackAttrChanges`
  didChangeAttrsConfig: [], //attributes to track

  didReceiveAttrs() {
    this._super(...arguments);

    let weakMap = this.get('_didChangeAttrsWeakMap');

    if (weakMap === null) { //first run
      let config = this.get('didChangeAttrsConfig');
      let trackedAttrs = config.attrs;
      let initialValues = {};

      for (let i=0; i<trackedAttrs.length; i++) {
        let key = trackedAttrs[i];
        initialValues[key] = this.get(key);
      }

      weakMap = new WeakMap();
      weakMap.set(this, initialValues);
      this.set('_didChangeAttrsWeakMap', weakMap);
    }
  },

  didUpdateAttrs() {
    this._super(...arguments);

    let config = this.get('didChangeAttrsConfig');
    let trackedAttrs = config.attrs;
    let oldValues = this.get('_didChangeAttrsWeakMap').get(this);
    let changes = {};

    for (let i=0; i<trackedAttrs.length; i++) {
      let key = trackedAttrs[i];
      let current = this.get(key);
      let previous = oldValues[key];

      if (!isEqual(key, previous, current)) { //TODO: configurable equality fn
        changes[key] = { previous, current };
        oldValues[key] = current;
      }
    }

    if(Object.keys(changes).length > 0) {
      this.didChangeAttrs(changes);
    }
  },
});
