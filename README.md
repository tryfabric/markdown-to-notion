# Markdown to Notion

Load a Markdown file into Notion with GitHub Actions.

## How does it work?

This action will read your Markdown file and convert it to Notion blocks using [`martian`](https://github.com/instantish/martian).  
It will then append a synced block to your page containing the result of the conversion.  
By default, the action will delete the first synced block it'll find in the page: this way it's able to quickly update your page without causing duplicates. Please keep in mind that you're not supposed to add other blocks to the page, otherwise the action may not work properly.

## Inputs

```yaml
- uses: tryfabric/markdown-to-notion@v1
  with:
    # The local path of the Markdown file to load.
    file: ./your/file.md

    # The token to use to access the Notion API. See the "How do I get a token?" FAQ for more info.
    notion_token: ${{ secrets.YOUR_INTEGRATION_TOKEN }}

    # The ID of the page you want the file loaded into. See the "How do I find the page ID?" FAQ for more info.
    notion_id: YourPageID

    # Whether to delete the existing block.
    # Default: true
    delete_existing: false
```

## Outputs

The action provides these outputs:

- `block_id`: the ID of the new block that has been appended.

For more info on how to use outputs, see the [`steps` context docs](https://docs.github.com/en/actions/learn-github-actions/contexts#steps-context).

## FAQs

### How do I get a token?

[Create a new intergration](https://www.notion.so/my-integrations) and save its token to a [new repository secret](https://docs.github.com/en/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository).  
Share your page with your integration and update your workflow to use the secret.

### How do I find the page ID?

Go to your page in Notion, then look at the URL. Notion URLs are formatted like this:

```none
https://notion.so/<TITLE>-<PAGEID>
https://notion.so/<TITLE>-<PAGEID>#<BLOCKID>
```

Both `<PAGEID>` and `<BLOCKID>` (when present) are dash-less UUIDv4 strings, here's an example: `17e70ad9dc1941adbd2d19155fc4ac8f`.  
To get the page ID, simply copy the first ID in the URL.

```none
https://notion.so/title-01ff8594fa8a4fb192cf017f8fdbf8d4
-> ID: 01ff8594fa8a4fb192cf017f8fdbf8d4

https://notion.so/othertitle-d673994443b34640a1768ac23cc202e2#49fc54c8af564f8cb052ce34fb590809
-> ID: d673994443b34640a1768ac23cc202e2
```

---

Build with :blue_heart: by the team behind [Fabric](https://tryfabric.com).
