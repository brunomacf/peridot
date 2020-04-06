import Service, { inject as service } from '@ember/service';
import { computed, get } from '@ember/object';
import ObjectProxy from '@ember/object/proxy';
import PromiseProxyMixin from '@ember/object/promise-proxy-mixin';

export default Service.extend({
  // Injected services
  store: service(),

  org: computed(function() {
    let promise = get(this, 'store').query('whitelabel-organization', {
      filter: {
        domain: window.location.hostname
      }
    }).then((orgs) => {
      return orgs.firstObject;
    });

    return ObjectProxy.extend(PromiseProxyMixin).create({ promise });
  })

});
