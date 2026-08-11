import type { APIContext } from 'astro';
import { buildFeed } from '../../data/feed';

export const GET = (context: APIContext) => buildFeed('en', context);
