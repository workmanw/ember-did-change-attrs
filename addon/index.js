import Ember from 'ember';

function isEqual(key, a, b) {
  return a === b;
}

export default Ember.Mixin.create({
  _didChangeAttrsBuffer: null, //this tracks previous state of any `trackAttrChanges`
  didChangeAttrsConfig: [], //attributes to track

  didReceiveAttrs() {
    this._super(...arguments);

    let buffer = this.get('_didChangeAttrsBuffer');

    if (buffer === null) { //first run
      let config = this.get('didChangeAttrsConfig');
      let trackedAttrs = config.attrs;
      let initialValues = {};

      for (let i=0; i<trackedAttrs.length; i++) {
        let key = trackedAttrs[i];
        initialValues[key] = this.get(key);
      }

      this.set('_didChangeAttrsBuffer', initialValues);
    }
  },

  didUpdateAttrs() {
    this._super(...arguments);

    let config = this.get('didChangeAttrsConfig');
    let equalityFn = config.isEqual || isEqual;

    let trackedAttrs = config.attrs;
    let oldValues = this.get('_didChangeAttrsBuffer');
    let changes = {};

    for (let i=0; i<trackedAttrs.length; i++) {
      let key = trackedAttrs[i];
      let current = this.get(key);
      let previous = oldValues[key];

      if (!equalityFn(key, previous, current)) {
        changes[key] = { previous, current };
        oldValues[key] = current;
      }
    }

    if(Object.keys(changes).length > 0) {
      this.didChangeAttrs(changes);
    }
  },
});
