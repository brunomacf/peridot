import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo, hasMany } from 'ember-data/relationships';

export default Model.extend({
  // Attributes
  active: attr('boolean'),
  askingPriceInCents: attr('number'),
  avatarUrl: attr('string'),
  cpe: attr('number'),
  disconnectedAt: attr('date'),
  facebookType: attr('string'),
  googleAnalyticsConnected: attr('boolean'),
  name: attr('string'),
  oauthExpiredAt: attr('date'),
  offersCount: attr('number'),
  platform: attr('string'),
  platformId: attr('string'),
  promotionSetupComplete: attr('boolean'),
  quality: attr('number'),
  reach: attr('number'),
  sensitiveContent: attr('boolean'),
  suggestedAskingPrice: attr('string'),
  tags: attr('string'),
  url: attr('string'),

  // Relationships
  account: belongsTo('account', {
    inverse: null
  }),

  offers: hasMany('offer')
});
