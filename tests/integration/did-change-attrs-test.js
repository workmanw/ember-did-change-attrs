import Ember from 'ember';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from 'ember-test-helpers';
import hbs from 'htmlbars-inline-precompile';
import DidChangeAttrs from 'ember-did-change-attrs';

function registerComponent(owner, hash, klass = Ember.Component) {
  owner.register('component:x-changer', klass.extend(DidChangeAttrs, hash));
}

module('Integration | DidChangeAttrs', function(hooks) {
  setupRenderingTest(hooks);

  test('Basic usage', async function(assert) {
    let changedAttrs, didChangeAttrsCallCount = 0;

    registerComponent(this.owner, {
      didChangeAttrsConfig: {
        attrs: ['email', 'isAdmin']
      },

      didChangeAttrs(changes) {
        this._super(...arguments);

        didChangeAttrsCallCount++;
        changedAttrs = changes;
      }
    });

    this.set('name', 'Tomster');
    this.set('email', 'ember@hamster.org');
    this.set('isAdmin', false);

    await render(hbs`{{x-changer email=email isAdmin=isAdmin name=name}}`);

    assert.equal(didChangeAttrsCallCount, 0, '`didChangeAttrs` is not called on initial render');

    this.set('email', 'emberjs@hamster.org');
    assert.equal(didChangeAttrsCallCount, 1, '`didChangeAttrs` is called when an attribute changed');

    assert.deepEqual(changedAttrs, {
      email: {
        previous: 'ember@hamster.org',
        current: 'emberjs@hamster.org'
      }
    }, '`changedAttrs` contains the attribute changes');

    this.set('name', 'TheTomster');
    assert.equal(didChangeAttrsCallCount, 1, '`didChangeAttrs` is not called when an untracked attribute is changed');
  });

  test('Custom isEqual', async function(assert) {
    let changedAttrs, didChangeAttrsCallCount = 0;

    registerComponent(this.owner, {
      didChangeAttrsConfig: {
        attrs: ['user', 'isAdmin'],
        isEqual(key, a, b) {
          if (key === 'user') {
            return (a && b) ? a.id === b.id : a === b;
          }
          return a === b;
        }
      },

      didChangeAttrs(changes) {
        this._super(...arguments);

        didChangeAttrsCallCount++;
        changedAttrs = changes;
      }
    });

    this.set('user', { name: 'Tomster', id: '123' });
    this.set('isAdmin', false);

    await render(hbs`{{x-changer user=user isAdmin=isAdmin}}`);

    assert.equal(didChangeAttrsCallCount, 0, '`didChangeAttrs` is not called on initial render');

    this.set('user', { name: 'TheTomster', id: '123' });

    assert.equal(didChangeAttrsCallCount, 0, '`didChangeAttrs` is not called because user entities are equal');

    this.set('user', { name: 'Zoey', id: '456' });

    assert.equal(didChangeAttrsCallCount, 1, '`didChangeAttrs` is called because user entities are not equal');
    assert.deepEqual(changedAttrs, {
      user: {
        previous: {
          id: '123',
          name: 'Tomster'
        },
        current: {
          id: '456',
          name: 'Zoey'
        }
      }
    }, '`user` included in `changedAttrs` because `user.id` is different');

    this.set('isAdmin', true);

    assert.equal(didChangeAttrsCallCount, 2, '`didChangeAttrs` is called because isAdmin changed');
    assert.deepEqual(changedAttrs, {
      isAdmin: {
        previous: false,
        current: true
      }
    }, '`isAdmin` included in `changedAttrs` because it changed');
  });
});
