import Model, { attr } from '@ember-data/model';
import { computed, get } from '@ember/object';

export default Model.extend({
  campaignMessagingEnabled: attr('boolean'),
  logoUrl: attr('string'),
  name: attr('string'),
  primaryColor: attr('string'),
  secondaryColor: attr('string'),

  useUniqueIzeaColors: computed('name', function() {
    let name = get(this, 'name');

    return name === 'IZEA' || name === 'IZEA Worldwide';
  })
});
