import type { DataSourceId } from './types';

export type DataSourceDefinition = {
  id: DataSourceId;
  label: string;
  description: string;
  requiredEnvVars: string[];
  defaultAccounts: string[];
};

export const DATA_SOURCE_DEFINITIONS: Record<DataSourceId, DataSourceDefinition> = {
  instagram: {
    id: 'instagram',
    label: 'Instagram',
    description: 'Posts, captions, comments, and metrics from Business/Creator accounts.',
    requiredEnvVars: ['META_APP_ID', 'META_APP_SECRET'],
    defaultAccounts: ['@fiogiuseppe', '@urees__']
  },
  linkedin: {
    id: 'linkedin',
    label: 'LinkedIn',
    description: 'Profile posts, comments, and creator analytics via Community Management API.',
    requiredEnvVars: ['LINKEDIN_CLIENT_ID', 'LINKEDIN_CLIENT_SECRET'],
    defaultAccounts: ['fiogiuseppe']
  },
  calendar: {
    id: 'calendar',
    label: 'Google Calendar',
    description: 'Events and time blocks — read-only schedule signals.',
    requiredEnvVars: ['GOOGLE_CALENDAR_CLIENT_ID', 'GOOGLE_CALENDAR_CLIENT_SECRET'],
    defaultAccounts: []
  },
  gmail: {
    id: 'gmail',
    label: 'Gmail',
    description: 'Metadata-only email signals — never full mailbox dumps.',
    requiredEnvVars: ['GMAIL_CLIENT_ID', 'GMAIL_CLIENT_SECRET'],
    defaultAccounts: []
  },
  github: {
    id: 'github',
    label: 'GitHub',
    description: 'Commits, PRs, and repository activity.',
    requiredEnvVars: ['GITHUB_TOKEN'],
    defaultAccounts: []
  },
  health: {
    id: 'health',
    label: 'Health',
    description: 'Apple Health / wearable summaries — aggregated metrics only.',
    requiredEnvVars: ['HEALTH_CONNECTOR_ENABLED'],
    defaultAccounts: []
  },
  books: {
    id: 'books',
    label: 'Books',
    description: 'Reading activity from Goodreads or manual logs.',
    requiredEnvVars: ['BOOKS_CONNECTOR_ENABLED'],
    defaultAccounts: []
  },
  spotify: {
    id: 'spotify',
    label: 'Spotify',
    description: 'Listening history and creative mood signals.',
    requiredEnvVars: ['SPOTIFY_CLIENT_ID', 'SPOTIFY_CLIENT_SECRET'],
    defaultAccounts: []
  },
  figma: {
    id: 'figma',
    label: 'Figma',
    description: 'Design file activity and comments.',
    requiredEnvVars: ['FIGMA_ACCESS_TOKEN'],
    defaultAccounts: []
  },
  manual_import: {
    id: 'manual_import',
    label: 'Manual import',
    description: 'User-approved JSON/CSV imports with explicit attribution.',
    requiredEnvVars: [],
    defaultAccounts: ['giuseppe']
  }
};

export function getDataSourceDefinition(source: DataSourceId): DataSourceDefinition {
  return DATA_SOURCE_DEFINITIONS[source];
}
