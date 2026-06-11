import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { pageBlockInputFromFormData, validatePageBlockInput } from "../lib/page-block-input";

const validInput = {
  label: " Hero ",
  eyebrow: " Intro ",
  title: " Welcome ",
  body: " Body copy ",
  ctaLabel: " Learn more ",
  ctaHref: " /about ",
  sortOrder: "10",
  published: true
};

describe("validatePageBlockInput", () => {
  it("normalizes valid page block input", () => {
    const result = validatePageBlockInput(validInput);

    assert.deepEqual(result, {
      ok: true,
      data: {
        label: "Hero",
        eyebrow: "Intro",
        title: "Welcome",
        body: "Body copy",
        ctaLabel: "Learn more",
        ctaHref: "/about",
        sortOrder: 10,
        published: true
      }
    });
  });

  it("converts blank optional fields to null", () => {
    const result = validatePageBlockInput({
      ...validInput,
      eyebrow: " ",
      ctaLabel: "",
      ctaHref: ""
    });

    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.data.eyebrow, null);
      assert.equal(result.data.ctaLabel, null);
      assert.equal(result.data.ctaHref, null);
    }
  });

  it("rejects missing required content", () => {
    const result = validatePageBlockInput({
      ...validInput,
      label: "",
      title: " ",
      body: ""
    });

    assert.deepEqual(result, {
      ok: false,
      errors: ["label is required", "title is required", "body is required"]
    });
  });

  it("rejects invalid sort order values", () => {
    const result = validatePageBlockInput({
      ...validInput,
      sortOrder: "first"
    });

    assert.deepEqual(result, {
      ok: false,
      errors: ["sortOrder must be a number"]
    });
  });

  it("accepts anchors, relative paths, and HTTPS CTA links", () => {
    for (const ctaHref of ["#contact", "/pricing", "https://example.com"]) {
      assert.equal(validatePageBlockInput({ ...validInput, ctaHref }).ok, true);
    }
  });

  it("rejects unsafe CTA links", () => {
    for (const ctaHref of ["javascript:alert(1)", "http://example.com", "ftp://example.com"]) {
      const result = validatePageBlockInput({ ...validInput, ctaHref });

      assert.deepEqual(result, {
        ok: false,
        errors: ["ctaHref must be a relative path, anchor, or HTTPS URL"]
      });
    }
  });
});

describe("pageBlockInputFromFormData", () => {
  it("reads update form fields with block id suffixes", () => {
    const formData = new FormData();
    formData.set("label:block-1", "Hero");
    formData.set("eyebrow:block-1", "Intro");
    formData.set("title:block-1", "Welcome");
    formData.set("body:block-1", "Body copy");
    formData.set("ctaLabel:block-1", "Learn more");
    formData.set("ctaHref:block-1", "/about");
    formData.set("sortOrder:block-1", "10");
    formData.set("published:block-1", "on");

    assert.deepEqual(pageBlockInputFromFormData(formData, { suffix: "block-1" }), {
      label: "Hero",
      eyebrow: "Intro",
      title: "Welcome",
      body: "Body copy",
      ctaLabel: "Learn more",
      ctaHref: "/about",
      sortOrder: "10",
      published: true
    });
  });
});
