import Component from '@ember/component';
import layout from '../templates/components/simple-badge';
import { inject as service } from '@ember/service';

export default Component.extend({
  /**
   * Services injected
   */
  store: service(),

  /**
   * Element customizations
   */
  layout,

  /**
   * Properties passed in.
   */
  alertMessage: null,

  /**
   * Actions
   */
  actions: {
    onClick() {

      let promise = this.store.findRecord('authenticated-user', "3");

      promise.then((user)=>{
        window.alert(`${this.alertMessage}: User is "${user.name}"`);
        console.log("@@@@@@@@@ user", user);
      });
    }
  }
});
