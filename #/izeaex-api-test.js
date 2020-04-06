//import JSONAPIAdapter from '@ember-data/adapter/json-api';
import JSONAPIAdapter from 'ember-data/adapters/json-api';
import { computed } from '@ember/object';
import { underscore } from '@ember/string';
import { pluralize } from 'ember-inflector';
import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';

let adapter = {
  // Properties
  host: 'http://api.iex.com:5500',
  namespace: 'v5',
  headers: computed(function() {
    let headers = {};

    console.log("@@@@@@@@ header YES");

    headers['X-IZEA-Account-ID'] = "3";

    /*if (isPresent(this.currentUser.account) && !get(this, 'currentUser.signedInAsEnterprise')) {
      if (!isBlank(get(this, 'currentUser.account.id'))) {
        headers['X-IZEA-Account-ID'] = get(this, 'currentUser.account.id');
      }
    }*/
    return headers;
  }),

  authorize(xhr) {
    console.log("@@@@@@@@ authorize YES");

    let accessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImlhdCI6MTU4MjgxMTg2NiwianRpIjoiYThmZGUzNzMtOTQ0Zi00YmQxLTgxYWUtOTJkMGVmODdkODZlIn0.mXe-8gu3BGviJY4x_PmGpuWpK9XsS2iviYlAg9BDvF4";
    xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
  },

  // pathForType is necessary because our API contains underscored attributes.
  // JSON API spec suggests camelCased attributes, so we need to tell Ember how
  // to handle these attributes
  pathForType(type) {
    console.log("@@@@@@@@ pathForType YES", type);

    return underscore(pluralize(type.replace("-test", "")));
  }
};

if (window.__APP === 'izeaex') {
  adapter.authorizer = 'authorizer:application';
}

export default JSONAPIAdapter.extend(DataAdapterMixin, adapter);
