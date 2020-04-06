import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo } from 'ember-data/relationships';
import { computed } from '@ember/object';
import { isPresent } from '@ember/utils';
import ListOwner from 'izea-components/mixins/list-owner';

export default Model.extend(ListOwner, {

  // Editable in Exchange Admin
  accountsCanAddPhoneNumber: attr('boolean'),
  additionalTerm: attr('string'),
  name: attr('string'),
  country: attr('string'),
  address: attr('string'),
  phone: attr('string'),
  defaultLocale: attr('string'),
  autoApproveOpps: attr('boolean'),
  autoApproveLists: attr('boolean'),
  allowCreatorSearch: attr('boolean'),
  allowConnectionSearch: attr('boolean'),
  allowMultiChannelSearch: attr('boolean'),
  allowContentLibrary: attr('boolean'),
  allowSignups: attr('boolean'),
  allowListExport: attr('boolean'),
  allowVizSearch: attr('boolean'),
  customTermEnabled: attr('boolean'),
  defaultTimeZone: attr('string'),
  izeaManaged: attr('boolean'),
  maxCreatorAccounts: attr('number'),
  maxMarketerAccounts: attr('number'),
  allowBulkEmails: attr('boolean'),
  allowCreatorContactInfo: attr('boolean'),
  privateNetwork: attr('boolean'),
  allowEntireNetworkOpportunities: attr('boolean'),
  adminMustReviewAllOpportunities: attr('boolean'),
  incomingOpportunityReviews: attr('string'),
  allowDraftDownloads: attr('boolean'),
  promotedPostsEnabled: attr('boolean'),
  trialAccessChat: attr('boolean'),

  sponsorshipComponents: attr('object'),
  contentComponents: attr('object'),
  otherOpportunityComponents: attr('object'),

  campaignMessagingEnabled: attr('boolean'),
  creatorReviewMessagingEnabled: attr('boolean'),

  moatEnabled: attr('boolean'),

  allowMcp: attr('boolean'),
  allowMcpMultiChannelSocialPosts: attr('boolean'),
  allowMcpFacebookPosts: attr('boolean'),
  allowMcpInstagramPosts: attr('boolean'),
  allowMcpInstagramStoryPosts: attr('boolean'),
  allowMcpTwitterPosts: attr('boolean'),
  allowMcpYoutubePosts: attr('boolean'),
  allowMcpBlogPosts: attr('boolean'),
  allowMcpPinterestPosts: attr('boolean'),
  allowMcpArticles: attr('boolean'),

  // Not editable in Exchange Admin
  stripeCustomerId: attr('string'),
  enterprise: attr('boolean'),
  enterpriseFeatures: attr('boolean'),
  showIzeaBranding: attr('boolean'),
  logoUrl: attr('string'),

  // Theming stuff
  whitelabelEnabled: attr('boolean'),
  // of the way that we override the association with a method in app/models/organization.rb
  masterOrganizationId: attr('number'),

  // Relationships
  creditLine: belongsTo('credit-line'),
  masterOrganization: belongsTo('organization', { inverse: null }),
  defaultSupplementalTerm: belongsTo('supplemental-term'),

  hasSponsorshipComponents: computed('sponsorshipComponents', function() {
    return isPresent(this.sponsorshipComponents);
  }),

  hasContentComponents: computed('contentComponents', function() {
    return isPresent(this.contentComponents);
  }),

  hasContentAmp: computed('otherOpportunityComponents', function() {
    return this.otherOpportunityComponents.includes('content_amp');
  }),

  masterOrg: computed('masterOrganization', function() {
    if (isPresent(this.masterOrganization)) {
      return this.masterOrganization;
    } else {
      return this;
    }
  })
});
