import * as core from '@actions/core';
import fs from 'fs';
import path from 'path';
import {markdownToBlocks} from '@tryfabric/martian';
import {Client as NotionClient} from '@notionhq/client';
import {appendNew, deleteExisting} from './sync';

export interface Inputs {
  delete_existing: boolean;
  file: string;
  notion_id: string;
  notion_token: string;
}

async function main() {
  const inputs: Inputs = {
    delete_existing: core.getBooleanInput('delete_existing', {required: true}),
    file: core.getInput('file', {required: true}),
    notion_id: core.getInput('notion_id', {required: true}),
    notion_token: core.getInput('notion_token', {required: true}),
  };

  const fn = path.join(
    process.env.GITHUB_WORKSPACE || '/github/workspace',
    inputs.file
  );
  core.info(`Resulting file path: ${fn}`);

  core.startGroup('Reading Markdown file');
  const markdown = fs.readFileSync(fn, {encoding: 'utf-8'});
  core.info('Files read successfully.');
  core.debug(markdown);
  core.endGroup();

  core.startGroup('Converting Markdown to Notion blocks');
  const blocks = markdownToBlocks(markdown);
  core.info(`${blocks.length} resulting Notion blocks.`);
  core.debug(JSON.stringify(blocks, null, 2));
  core.endGroup();

  core.startGroup('Creating Notion Client');
  const client = new NotionClient({auth: inputs.notion_token});
  core.info('Client created successfully.');
  core.endGroup();

  if (inputs.delete_existing) {
    core.startGroup('Deleting existing block');
    await deleteExisting(client, inputs);
    core.endGroup();
  } else core.info('Not trying to delete existing block.');

  core.startGroup('Appending new block');
  await appendNew(client, inputs, blocks);
  core.endGroup();
}

main().catch(e => {
  core.setFailed(e instanceof Error ? e.message : e + '');
});
