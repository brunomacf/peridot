import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo } from 'ember-data/relationships';

export default Model.extend({
  createdAt: attr('date'),
  enabled: attr('boolean'),
  creditLimit: attr('number'),
  creditLimitCents: attr('number'),
  paymentTermDays: attr('number'),
  memo: attr('string'),
  billingFrequency: attr('string'),
  organization: belongsTo('organization')
});
