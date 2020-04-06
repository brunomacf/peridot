import JSONAPIAdapter from 'ember-data/adapters/json-api';
import { computed, get } from '@ember/object';
import { inject as service } from '@ember/service';
import { underscore } from '@ember/string';
import { isPresent, isBlank } from '@ember/utils';
import { pluralize } from 'ember-inflector';
import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';

let adapter = {
  // Injected services
  currentUser: service(),
  session: service(),

  // Properties
  host: 'http://api.iex.com:5500',
  namespace: 'v5',
  headers: computed('currentUser.account', function() {
    let headers = {};
    if (isPresent(get(this, 'currentUser.account')) && !get(this, 'currentUser.signedInAsEnterprise')) {
      if (!isBlank(get(this, 'currentUser.account.id'))) {
        headers['X-IZEA-Account-ID'] = get(this, 'currentUser.account.id');
      }
    }
    return headers;
  }),

  authorize(xhr) {
    let accessToken = get(this, 'session.data.authenticated.access_token');

    console.log("@@@@@@ accessToken", accessToken);

    xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
  },

  // pathForType is necessary because our API contains underscored attributes.
  // JSON API spec suggests camelCased attributes, so we need to tell Ember how
  // to handle these attributes
  pathForType(type) {
    console.log("@@@@@@@@ pathForType ADDON", type);
    return underscore(pluralize(type));
  }
};

if (window.__APP === 'izeaex') {
  adapter.authorizer = 'authorizer:application';
}

export default JSONAPIAdapter.extend(DataAdapterMixin, adapter);
