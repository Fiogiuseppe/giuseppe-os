import { importLinkedInPosts } from '../lib/linkedin/import-posts.server';

const URLS = process.argv.slice(2);

async function main(): Promise<void> {
  if (URLS.length === 0) {
    console.error('Usage: npx tsx scripts/import-linkedin-posts.ts <linkedin-post-url> [...]');
    process.exit(1);
  }

  const { imported, errors } = await importLinkedInPosts(URLS);

  console.log(`Imported: ${imported.length}`);
  for (const item of imported) {
    console.log(`- [${item.created ? 'new' : 'updated'}] ${item.title}`);
    console.log(`  ${item.url}`);
  }

  if (errors.length > 0) {
    console.error(`Errors: ${errors.length}`);
    for (const error of errors) {
      console.error(`- ${error.url}: ${error.message}`);
    }
    process.exit(1);
  }
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
