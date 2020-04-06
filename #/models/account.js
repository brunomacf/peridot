import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo, hasMany } from 'ember-data/relationships';
import { equal } from '@ember/object/computed';
import { computed, get } from '@ember/object';
import { htmlSafe } from '@ember/string';
import ListOwner from 'izea-components/mixins/list-owner';
import FundsTransferrable from 'izea-components/mixins/funds-transferrable';

export default Model.extend(ListOwner, FundsTransferrable, {
  // Attributes
  accountType: attr('number'),
  availableBalanceInCents: attr('number'),
  avatarUrl: attr('string'),
  bannedAt: attr('string'),
  canAccessPayments: attr('boolean'),
  city: attr('string'),
  country: attr('string'),
  createdAt: attr('string'),
  discovery: attr('boolean'),
  discoveryPaid: attr('boolean'),
  earnedBalanceInCents: attr('number'),
  initials: attr('string'),
  inrank: attr('number'),
  name: attr('string'),
  phoneNumber: attr('string'),
  profileUrl: attr('string'),
  state: attr('string'),
  selfSignup: attr('boolean'),
  hideSensitiveContent: attr('boolean'),
  writerSkill: attr('number'),
  photographerSkill: attr('number'),
  videographerSkill: attr('number'),
  illustratorSkill: attr('number'),
  promotionSetupComplete: attr('boolean'),
  minor: attr('boolean'),

  // Relationships
  connections: hasMany('connection'),
  officialConnections: hasMany('connection', { inverse: null }),
  contentConnections: hasMany('connection', { inverse: null }),
  organization: belongsTo('organization'),
  currentAccessHistory: belongsTo('account-access-history'),
  currentSubscription: belongsTo('subscription'),

  // Computed properties
  isCreator: equal('accountType', 0),
  isMarketer: equal('accountType', 1),

  isCreatorAccount: computed('accountType', function() {
    return get(this, 'accountType') === 0;
  }),
  isMarketerAccount: computed('accountType', function() {
    return get(this, 'accountType') === 1;
  }),
  avatarUrlStyle: computed('avatarUrl', function() {
    return htmlSafe(`background-image: url('${get(this, 'avatarUrl')}')`);
  }),
  typeOfAccount: computed('accountType', function() {
    let accountTypeMapping = {
      0: 'Creator',
      1: 'Marketer'
    };
    let accountType = get(this, 'accountType');
    return accountTypeMapping[accountType];
  })
});
