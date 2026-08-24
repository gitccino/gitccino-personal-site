import { describe, expect, it } from "bun:test";

import { jsonRequest, readCookie, request } from "./http";

interface CommentResponse {
  id: string;
  authorName: string;
  body: string;
  canDelete: boolean;
}

describe("comments API", () => {
  it("reuses the author name and enforces delete ownership", async () => {
    const firstResponse = await jsonRequest("/comments", "POST", {
      subject: "home",
      body: "First comment",
      website: "",
    });
    const ownerCookie = readCookie(firstResponse);
    const first = (await firstResponse.json()) as CommentResponse;

    expect(firstResponse.status).toBe(200);
    expect(first.body).toBe("First comment");
    expect(first.canDelete).toBe(true);

    const secondResponse = await jsonRequest(
      "/comments",
      "POST",
      {
        subject: "article:aschild",
        body: "Second comment",
        website: "",
      },
      ownerCookie,
    );
    const second = (await secondResponse.json()) as CommentResponse;

    expect(second.authorName).toBe(first.authorName);

    const ownerList = await request("/comments?subject=home", {
      headers: { cookie: ownerCookie },
    });
    const ownerComments = (await ownerList.json()) as CommentResponse[];

    expect(ownerComments).toHaveLength(1);
    expect(ownerComments[0]?.canDelete).toBe(true);

    const publicList = await request("/comments?subject=home");
    const publicComments = (await publicList.json()) as CommentResponse[];

    expect(publicComments[0]?.canDelete).toBe(false);
    expect(publicList.headers.get("set-cookie")).toBeNull();

    const outsiderResponse = await jsonRequest("/likes", "POST", {
      subject: "article:aschild",
      website: "",
    });
    const outsiderCookie = readCookie(outsiderResponse);

    const outsiderDelete = await jsonRequest(
      `/comments/${first.id}`,
      "DELETE",
      undefined,
      outsiderCookie,
    );

    expect(outsiderDelete.status).toBe(404);

    const ownerDelete = await jsonRequest(
      `/comments/${first.id}`,
      "DELETE",
      undefined,
      ownerCookie,
    );

    expect(ownerDelete.status).toBe(200);
    expect(await ownerDelete.json()).toEqual({ deleted: true });

    const afterDelete = await request("/comments?subject=home");

    expect(await afterDelete.json()).toEqual([]);
  });
});
