import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo } from 'ember-data/relationships';

export default Model.extend({
  // Attributes
  createdAt: attr('date'),
  parentResourceId: attr('string'),
  parentResourceType: attr('string'),
  permission: attr('string'),
  resourceId: attr('string'),
  resourceType: attr('string'),
  role: attr('string'),

  // Relationships
  user: belongsTo('user'),
  authenticatedUser: belongsTo('authenticatedUser')
});
