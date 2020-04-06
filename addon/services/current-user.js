import Service, { inject as service } from '@ember/service';
import { computed, get, set } from '@ember/object';
import { alias, filterBy, or, equal } from '@ember/object/computed';
import jwtDecode from 'jwt-decode';
import { A } from '@ember/array';
import { isPresent } from '@ember/utils';
import { arrayToTruthMap } from '@izea/peridot-ember-addon/utils/data-transformation';

export default Service.extend({
  // Injected services
  session: service(),
  store: service(),
  currentOrg: service(),
  features: service(),

  routeBasedSignedInAs: null,

  accountPermissions: filterBy('user.permissions', 'resourceType', 'account'),
  sponsorshipCampaignPermissions: filterBy('user.permissions', 'resourceType', 'sponsorship_campaign'),
  creatorReviewPermissions: filterBy('sponsorshipCampaignPermissions', 'role', 'enterprise_creator_review'),
  contentMinePermissions: filterBy('sponsorshipCampaignPermissions', 'role', 'enterprise_asset_library'),
  allAccountPermissionIds: computed('accountPermissions.[]', function() {
    let permissions = get(this, 'accountPermissions');
    let ids = A();

    if (isPresent(permissions)) {
      permissions.map((permission) => {
        ids.pushObject(get(permission, 'resourceId'));
      });
    }

    return ids;
  }),
  systemRolePermissions: filterBy('user.permissions', 'resourceType', '*'),

  // Computed properties
  user: computed('session.isAuthenticated', function() {
    let isAuthenticated = get(this, 'session.isAuthenticated');

    if (!isAuthenticated) {
      return;
    }

    let promise = get(this, 'store').findRecord('authenticated-user', this._getUserId(), {
      include: [
        'last_used_account',
        'last_used_account.current_subscription',
        'last_used_account.current_subscription.plan',
        'last_used_account.organization',
        'last_used_account.organization.credit_line',
        'last_used_account.organization.master_organization',
        'permissions'
      ].join(',')
    });

    promise.then((user)=>{
      get(this, 'features').setup(arrayToTruthMap(get(user, 'activeFeatures')));
    });

    return promise;
  }),
  account: alias('user.lastUsedAccount'),
  canBulkEmailCreators: alias('account.organization.allowBulkEmails'),

  activeFeatures: computed('user.activeFeatures', function() {
    return arrayToTruthMap(get(this, 'user.activeFeatures'));
  }),

  hasPermissionRole(roleDesired) {
    let userPermissionRoles = get(this, 'user.permissions');
    let isTrue = false;
    let resourceId = get(this, 'currentOrg.org.id');
    if (userPermissionRoles) {
      userPermissionRoles.forEach(function(permission) {
        if (get(permission, 'role') === roleDesired) {
          if (get(permission, 'resourceId') === resourceId) {
            isTrue = true;
          }
        }
      });
    }
    return isTrue;
  },

  hasSystemRole(role) {
    let roleMap = get(this, 'systemRolePermissions').map((perm) => perm.role);
    return roleMap.includes(role);
  },

  // set from certain routes that make it clear what signedInAs the user is going for
  setRouteBasedSignedInAs(routeBasedSignedInAs) {
    set(this, 'routeBasedSignedInAs', routeBasedSignedInAs);
  },

  // prefer knowing what type of user we are acting as by route, but fall back to user.lastAccountUsed
  signedInAs: computed('user.lastAccountUsed', function() {
    return get(this, 'routeBasedSignedInAs') || get(this, 'user.lastAccountUsed');
  }),

  signedInAsMarketer: equal('signedInAs', 'marketer'),

  signedInAsCreator: equal('signedInAs', 'creator'),

  signedInAsOrganizationAdmin: equal('signedInAs', 'partner'),

  signedInAsEnterprise: equal('signedInAs', 'enterprise'),

  signedInAsExchangeAdmin: equal('signedInAs', 'admin'),

  signedInAsMarketerOrEnterprise: or('signedInAsMarketer', 'signedInAsEnterprise'),

  messagingEnabled: or('account.organization.masterOrg.{campaignMessagingEnabled,creatorReviewMessagingEnabled}'),
  messagingFeatures: computed('account.organization.masterOrg.{campaignMessagingEnabled,creatorReviewMessagingEnabled}',
    'account.organization.trialAccessChat', function() {
      return {
        campaignMessagingEnabled: get(this, 'account.organization.masterOrg.campaignMessagingEnabled'),
        creatorReviewMessagingEnabled: get(this, 'account.organization.masterOrg.creatorReviewMessagingEnabled'),
        trialAccessChatEnabled: get(this, 'account.organization.trialAccessChat')
      };
    }),
  canDownloadDrafts: alias('account.organization.masterOrg.allowDraftDownloads'),

  signedInAsDiscoveryMarketer: computed('signedInAsMarketer', 'account.discovery', function() {
    return get(this, 'signedInAsMarketer') && get(this, 'account.discovery');
  }),

  signedInAsNonDiscoveryMarketer: computed('signedInAsMarketer', 'signedInAsDiscoveryMarketer', function() {
    return get(this, 'signedInAsMarketer') && !(get(this, 'signedInAsDiscoveryMarketer'));
  }),

  hasContentComponents: computed('account.organization.contentComponents', function() {
    return isPresent(get(this, 'account.organization.contentComponents'));
  }),

  hasSponsorshipComponents: computed('account.organization.sponsorshipComponents', function() {
    return isPresent(get(this, 'account.organization.sponsorshipComponents'));
  }),

  hasEnabledOpportunityComponents: computed('signedInAsDiscoveryMarketer', 'hasContentComponents', 'hasSponsorshipComponents', function() {
    if (get(this, 'signedInAsDiscoveryMarketer')) {
      return false;
    } else {
      return get(this, 'hasContentComponents') || get(this, 'hasSponsorshipComponents');
    }
  }),

  showMessaging: computed('signedInAsDiscoveryMarketer', 'signedInAsMarketer', 'signedInAsEnterprise', 'messagingFeatures.trialAccessChatEnabled', function() {
    return (get(this, 'signedInAsMarketer') || get(this, 'signedInAsEnterprise'))
      && !get(this, 'signedInAsDiscoveryMarketer')
      && !get(this, 'messagingFeatures.trialAccessChatEnabled');
  }),

  isEbyline: computed('account.organization.name', function() {
    let name = get(this, 'account.organization.name');
    return name === 'Ebyline';
  }),

  // Private methods
  _getUserId() {
    let token = get(this, 'session.data.authenticated.access_token');

    let tokenData = jwtDecode(token);

    return tokenData.userId;
  }
});
