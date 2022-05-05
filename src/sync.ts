import * as core from '@actions/core';
import {Client} from '@notionhq/client';
import {ListBlockChildrenResponse} from '@notionhq/client/build/src/api-endpoints';
import {markdownToBlocks} from '@tryfabric/martian';
import {Inputs} from '.';

type BlockObjectRequest = ReturnType<typeof markdownToBlocks>[number];
type ExistingBlock = ListBlockChildrenResponse['results'][number] & {
  type: BlockObjectRequest['type'];
};

export async function deleteExisting(client: Client, inputs: Inputs) {
  let existing = await client.blocks.children.list({
    block_id: inputs.notion_id,
  });

  if (existing.results.length > 1)
    core.warning(
      'The given page contains more than one child. The action will use the first available synced block, all other blocks will be ignored.'
    );

  let target = (existing.results as ExistingBlock[]).find(
    b => b.type === 'synced_block'
  );

  while (!target && existing.has_more && existing.next_cursor) {
    existing = await client.blocks.children.list({
      block_id: inputs.notion_id,
      start_cursor: existing.next_cursor,
    });
    target = (existing.results as ExistingBlock[]).find(
      b => b.type === 'synced_block'
    );
  }

  if (target) {
    core.info('Existing synced block found.');
    core.info('Deleting existing synced block...');
    await client.blocks.delete({
      block_id: target.id,
    });
    core.info('Block deleted successfully.');
  } else core.info('No previous block found.');
}

export async function appendNew(
  client: Client,
  inputs: Inputs,
  blocks: BlockObjectRequest[]
) {
  const res = await client.blocks.children.append({
      block_id: inputs.notion_id,
      children: [
        {
          type: 'synced_block',
          synced_block: {
            synced_from: null,
            // @ts-expect-error It will complain about the fact that we're not making sure that `blocks` doesn't contain another synced_block
            children: blocks,
          },
        },
      ],
    }),
    {id} = res.results[0];

  core.info(`New block appended successfully. ID: ${id}`);
  core.setOutput('block_id', id);
}
