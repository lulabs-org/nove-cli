import { expect } from 'chai';

import { loginWithApiKey } from '../helpers/authentication.js';
import { createTestHome, removeTestHome, runCli } from '../helpers/cli.js';
import { listen } from '../helpers/http-server.js';

async function runEmptyListInvalid(testHome: string, args: string[]): Promise<void> {
  const server = await listen((_request, response) => {
    response.setHeader('content-type', 'application/json');
    response.end(JSON.stringify(
      args[0] === 'user'
        ? { items: [], total: 0, totalPages: 0 }
        : { data: [], total: 0, totalPages: 0 },
    ));
  });

  try {
    const result = await runCli(args, { HOME: testHome, NOVE_API_URL: server.url });
    expect(result.code, args.join(' ')).to.equal(1);
    expect(result.stderr, args.join(' ')).not.to.equal('');
  } finally {
    await server.close();
  }
}

async function runPagedListCase(
  testHome: string,
  args: string[],
  itemKey: 'data' | 'items',
): Promise<void> {
  const pages: string[] = [];
  const server = await listen((request, response) => {
    const page = new URL(request.url ?? '/', 'http://localhost').searchParams.get('page') ?? '';
    pages.push(page);
    response.setHeader('content-type', 'application/json');
    response.end(JSON.stringify({
      [itemKey]: [{ id: `id-${page}`, label: page === '1' ? 'Alpha' : 'Zulu' }],
      page: Number(page),
      total: 2,
      totalPages: 2,
    }));
  });

  try {
    const result = await runCli(
      [...args, '--all', '--fields', 'id,label', '--sort', 'label:desc'],
      { HOME: testHome, NOVE_API_URL: server.url },
    );
    expect(result.code, args.join(' ')).to.equal(0);
    expect(pages, args.join(' ')).to.deep.equal(['1', '2']);
    expect(result.stdout.indexOf('id-2'), args.join(' ')).to.be.lessThan(result.stdout.indexOf('id-1'));
    expect(result.stdout, args.join(' ')).to.include('Showing 2 of 2');
  } finally {
    await server.close();
  }
}

describe('list command matrix', () => {
  let testHome: string;

  beforeEach(async () => {
    testHome = createTestHome('nove-cli-list-matrix-');
    await loginWithApiKey(testHome);
  });

  afterEach(() => {
    removeTestHome(testHome);
  });

  it('validates all list presentation flags even when the API returns no rows', async () => {
    const invalidFlags = [
      ['meeting', 'list', '--fields', ','], ['meeting', 'list', '--sort', 'id:sideways'],
      ['minute', 'list', '--fields', ','], ['minute', 'list', '--sort', 'id:sideways'],
      ['minute', 'speaker-summary', 'list', 'minute-1', '--fields', ','],
      ['meeting', 'participants', 'meeting-1', '--sort', 'id:sideways'],
      ['order', 'list', '--fields', ','], ['order', 'list', '--sort', 'id:sideways'],
      ['product', 'list', '--fields', ','], ['product', 'list', '--sort', 'id:sideways'],
      ['tracking-report', 'list', '--fields', ','], ['tracking-report', 'list', '--sort', 'id:sideways'],
      ['user', 'list', '--sort', 'id:sideways'],
    ];
    await Promise.all(invalidFlags.map((args) => runEmptyListInvalid(testHome, args)));
  });

  it('fetches, merges, selects, and sorts every paginated resource family', async () => {
    await Promise.all([
      runPagedListCase(testHome, ['meeting', 'list'], 'data'),
      runPagedListCase(testHome, ['meeting', 'participants', 'meeting-1'], 'data'),
      runPagedListCase(testHome, ['minute', 'list'], 'data'),
      runPagedListCase(testHome, ['minute', 'speaker-summary', 'list', 'minute-1'], 'data'),
      runPagedListCase(testHome, ['order', 'list'], 'items'),
      runPagedListCase(testHome, ['product', 'list'], 'items'),
      runPagedListCase(testHome, ['tracking-report', 'list'], 'data'),
      runPagedListCase(testHome, ['user', 'list'], 'items'),
    ]);
  });
});
