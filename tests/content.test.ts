import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { fallbackBlocks, getPublishedBlocks, type SiteBlock } from "../lib/content";

function createBlock(overrides: Partial<SiteBlock> = {}): SiteBlock {
  return {
    slug: "hero",
    label: "Hero",
    eyebrow: "Eyebrow",
    title: "Title",
    body: "Body",
    ctaLabel: "Read more",
    ctaHref: "/read-more",
    sortOrder: 10,
    published: true,
    ...overrides
  };
}

describe("getPublishedBlocks", () => {
  it("returns published blocks from the database", async () => {
    const databaseBlocks = [
      createBlock({ slug: "hero", sortOrder: 10 }),
      createBlock({ slug: "features", sortOrder: 20 })
    ];
    let queryArgs: unknown;
    const client = {
      pageBlock: {
        findMany: async (args: unknown) => {
          queryArgs = args;
          return databaseBlocks;
        }
      }
    };

    const blocks = await getPublishedBlocks(client);

    assert.deepEqual(blocks, databaseBlocks);
    assert.deepEqual(queryArgs, {
      where: { published: true },
      orderBy: { sortOrder: "asc" }
    });
  });

  it("returns fallback blocks when the database has no published blocks", async () => {
    const client = {
      pageBlock: {
        findMany: async () => []
      }
    };

    assert.deepEqual(await getPublishedBlocks(client), fallbackBlocks);
  });

  it("returns fallback blocks when the database query fails", async () => {
    const client = {
      pageBlock: {
        findMany: async () => {
          throw new Error("database unavailable");
        }
      }
    };

    assert.deepEqual(await getPublishedBlocks(client), fallbackBlocks);
  });
});
