import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo } from 'ember-data/relationships';

export default Model.extend({
  // Attributes
  autoApprovesAt: attr('date'),
  avatarUrl: attr('string'),
  bidAmountInCents: attr('number'),
  connectionName: attr('string'),
  contentTitle: attr('string'),
  contentWithDisclosure: attr('string'),
  createdAt: attr('date'),
  disclosureType: attr('string'),
  eligibleForDelegatedReview: attr('boolean'),
  expiresAt: attr('date'),
  imageContentUrl: attr('string'),
  inviteOnly: attr('boolean'),
  izeaxTermsAccepted: attr('boolean'),
  killFeeInCents: attr('number'),
  lastTransitionAt: attr('date'),
  name: attr('string'),
  offerContent: attr('string'), // content is a protected keyword in hbs templates
  pitch: attr('string'),
  platform: attr('string'),
  postUrl: attr('string'),
  contentOnlyPublishedUrl: attr('string'),
  publishedAt: attr('date'),
  qualityRating: attr('number'),
  reachWhenPublished: attr('number'),
  reasonDeclined: attr('string'), // update only
  requestedBidAmountInCents: attr('number'),
  requestedKillFeeInCents: attr('number'),
  revisionFeedback: attr('string'),

  // Skip Validations Content
  skipValidations: attr('boolean'),
  skipValidationsReason: attr('string'), // update only
  skipValidationsSignature: attr('string'), // update only

  startPublishingAt: attr('date'),
  state: attr('string'),
  supplementalTermsAccepted: attr('boolean'),
  videoContentUrl: attr('string'),
  dueAt: attr('date'),
  publishWindow: attr('number'),

  // Relationships
  opportunity: belongsTo('opportunity-mixin'),
  connection: belongsTo('connection'),
  contentConnection: belongsTo('content-connection')
});
