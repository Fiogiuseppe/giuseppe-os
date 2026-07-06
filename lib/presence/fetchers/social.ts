import { GIUSEPPE_PRESENCE, UREES_PRESENCE } from '../canonical';
import type { PresenceChannelReport } from '../types';

export function linkedinPresenceChannel(): PresenceChannelReport {
  return {
    id: 'linkedin',
    label: GIUSEPPE_PRESENCE.channels.linkedin.label,
    url: GIUSEPPE_PRESENCE.channels.linkedin.profileUrl,
    status: 'needs_auth',
    statusNote:
      'LinkedIn richiede API ufficiale o OAuth. Giuseppe OS seguirà solo https://www.linkedin.com/in/fiogiuseppe/ — nessuna ricerca generica.'
  };
}

export function instagramPresenceChannel(): PresenceChannelReport {
  return {
    id: 'instagram',
    label: GIUSEPPE_PRESENCE.channels.instagram.label,
    url: GIUSEPPE_PRESENCE.channels.instagram.profileUrl,
    status: 'needs_auth',
    statusNote:
      'Instagram richiede Meta API. Giuseppe OS seguirà solo @fiogiuseppe — nessuna ricerca generica.'
  };
}

export function ureesInstagramPresenceChannel(): PresenceChannelReport {
  return {
    id: 'urees_instagram',
    label: UREES_PRESENCE.channels.instagram.label,
    url: UREES_PRESENCE.channels.instagram.profileUrl,
    status: 'needs_auth',
    statusNote:
      'Instagram richiede Meta API. Giuseppe OS seguirà solo @urees__ — nessuna ricerca generica.'
  };
}
