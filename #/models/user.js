import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo } from 'ember-data/relationships';

export default Model.extend({
  // Attributes
  avatarUrl: attr('string'),
  country: attr('string'),
  language: attr('string'),
  name: attr('string'),
  email: attr('string'),
  reach: attr('number'),
  initials: attr('string'),
  confirmed: attr('boolean'),
  lastSignInAt: attr('date'),

  // Relationships
  organization: belongsTo('organization'),
  masterOrganization: belongsTo('organization')
});
