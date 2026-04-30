import { appendQueryHref } from "@/lib/admin-route-hrefs";

describe("admin route href helpers", () => {
  it("appends query params to hrefs that already contain a query string", () => {
    expect(
      appendQueryHref("/admin/time-settings/_/picker?courseSessionId=class-time", {
        draftStartTime: "08:30",
        draftEndTime: "10:00",
      }),
    ).toBe(
      "/admin/time-settings/_/picker?courseSessionId=class-time&draftStartTime=08%3A30&draftEndTime=10%3A00",
    );
  });

  it("adds the first query string when the href does not have one yet", () => {
    expect(
      appendQueryHref("/admin/time-settings", {
        courseSessionId: "class-time",
      }),
    ).toBe("/admin/time-settings?courseSessionId=class-time");
  });
});
