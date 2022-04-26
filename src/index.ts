import * as core from '@actions/core';
import fs from 'fs';
import path from 'path';
import {markdownToBlocks} from '@tryfabric/martian';
import {Client as NotionClient} from '@notionhq/client';

async function main() {
  const inputs = {
    file: core.getInput('file', {required: true}),
    notion_token: core.getInput('notion_token', {required: true}),
    notion_id: core.getInput('notion_id', {required: true}),
  };

  const fn = path.join(
    process.env.GITHUB_WORKSPACE || '/github/workspace',
    inputs.file
  );
  core.info(`Resulting file path: ${fn}`);

  core.info('Reading Markdown file...');
  const markdown = fs.readFileSync(fn, {encoding: 'utf-8'});
  core.startGroup('Markdown file');
  core.info(markdown);
  core.endGroup();

  core.info('Converting Markdown to Notion blocks...');
  const blocks = markdownToBlocks(markdown);
  core.startGroup('Notion blocks');
  core.info(JSON.stringify(blocks, null, 2));
  core.endGroup();

  core.info('Creating Notion Client...');
  const client = new NotionClient({auth: inputs.notion_token});

  core.info('Appending blocks...');
  const res = await client.blocks.children.append({
    block_id: inputs.notion_id,
    children: blocks,
  });
  core.startGroup('API response');
  core.info(JSON.stringify(res, null, 2));
  core.endGroup();
}

main().catch(e => {
  core.setFailed(e instanceof Error ? e.message : e + '');
});
