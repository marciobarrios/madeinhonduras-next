import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import sharp from "sharp";
import { generateVariants } from "../scripts/image-variants.mjs";
test("EXIF-rotated local masters produce unique correctly sized, metadata-free variants", async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "mih-images-"));
  try {
    const source = await sharp({
      create: { width: 1200, height: 800, channels: 3, background: "#156274" },
    })
      .jpeg()
      .withMetadata({ orientation: 6 })
      .toBuffer();
    const result = await generateVariants(
      source,
      "orientation-fixture",
      directory,
    );
    assert.equal(result.width, 800);
    assert.equal(result.height, 1200);
    assert.deepEqual(
      result.srcSet.map((v) => v.width),
      [480, 800],
    );
    for (const v of result.srcSet) {
      const meta = await sharp(
        path.join(directory, path.basename(v.src)),
      ).metadata();
      assert.equal(meta.width, v.width);
      assert.equal(meta.height, v.height);
      assert.equal(meta.exif, undefined);
      assert.equal(meta.orientation, undefined);
    }
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
