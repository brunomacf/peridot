import Model, { attr, hasMany, belongsTo } from '@ember-data/model';
import { htmlSafe } from '@ember/string';
import { computed, get } from '@ember/object';
import _ from 'lodash';

export default Model.extend({
  // Attributes
  activeFeatures: attr('array'),
  adminRoles: attr(),
  avatarUrl: attr('string'),
  initials: attr('string'),
  locale: attr('string'),
  partnerAdmin: attr('boolean'),
  managed: attr('boolean'),
  name: attr('string'),
  companyName: attr('string'),
  email: attr('string'),
  password: attr('string'),
  partnerId: attr('number'),
  enterpriseSignup: attr('boolean'),
  selfSignup: attr('boolean'),
  discoverySelfSignup: attr('boolean'),
  partnerRoles: attr(),
  referralUrl: attr('string'),
  country: attr('string'),
  postalCode: attr('string'),
  actionables: attr(),
  createdAt: attr('string'),
  lastAccountUsed: attr('string'),
  
  createCreditCardStripeToken: attr('string'), // for adding credit card during sign up
  createAccountType: attr('string'), // 'marketer'
  planId: attr('number'), // for selecting desired plan (discovery only)
  discoveryTosAcceptance: attr('boolean'),
  voucherCode: attr('string'),

  // Relationships
  lastUsedAccount: belongsTo('account', { inverse: null }),
  permissions: hasMany('permissions'),

  // Computed properties
  avatarUrlStyle: computed('avatarUrl', function() {
    return htmlSafe(`background-image: url('${get(this, 'avatarUrl')}')`);
  }),

  hasSponsorshipActionables: computed('hasSponsorshipActionables', function() {
    let actionables = get(this, 'sponsorshipActionablesCount');
    return actionables > 0;
  }),

  hasContentActionables: computed('hasContentActionables', function() {
    let actionables = get(this, 'contentActionablesCount');
    return actionables > 0;
  }),

  hasContentAmpActionables: computed('actionables', function() {
    let actionables = get(this, 'actionables');
    return _.get(actionables, 'content_amp.new_offers', 0) > 0;
  }),

  sponsorshipActionablesCount: computed('sponsorshipActionables', function() {
    let actionables = get(this, 'actionables');
    return _.get(actionables, 'sponsorship.actionable_offers') + _.get(actionables, 'sponsorship.new_offers');
  }),

  contentActionablesCount: computed('contentActionables', function() {
    let actionables = get(this, 'actionables');
    return _.get(actionables, 'content.actionable_offers') + _.get(actionables, 'content.new_offers');
  }),

  contentAmpActionablesCount: computed('contentAmpActionables', function() {
    let actionables = get(this, 'actionables');

    let openArticleCount = actionables.content_amp.new_offers;
    return (openArticleCount > 99) ? '99+' : openArticleCount;
  })
});
