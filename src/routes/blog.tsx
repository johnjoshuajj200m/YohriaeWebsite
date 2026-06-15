import { buildPageHead } from "@/lib/seo";
import { buildBlogPageSchema } from "@/lib/schema";
import { fetchPublishedBlogPostsForSchema } from "@/lib/schema-data";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/blog")({
  loader: async () => ({
    postsForSchema: await fetchPublishedBlogPostsForSchema(),
  }),
  head: ({ loaderData }) =>
    buildPageHead({
      title: "Blog — Stories, Insights & Updates from YOHRIAE",
      description:
        "YOHRIAE stories, insights, advocacy wins, and program updates — youth voices and community impact from Northern Nigeria.",
      path: "/blog",
      jsonLd: buildBlogPageSchema(loaderData?.postsForSchema ?? []),
    }),
});
