import { notFound } from "next/navigation";
import MarkdownIt from "markdown-it";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";

import { getPostBySlug } from "@/utils/posts";

interface PageProps {
  params: {
    slug: string;
  };
}

export default async function Blog({ params }: PageProps) {
  const { slug } = params;

  const post: any = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const md: MarkdownIt = new MarkdownIt({
    highlight: function (str, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return `<pre class="hljs"><code>${
            hljs.highlight(str, { language: lang }).value
          }</code></pre>`;
        } catch (__) {
          console.error("Highlighting failed:", __);
        }
      }
      return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`;
    },
  });

  const contentHtml = md.render(post.content);

  return (
    <div className="container-blog pt-8">
      <div className="py-10">
        <h1 className="feature-title text-4xl lg:text-6xl font-semibold leading-tight">
          {post.title}
        </h1>
        <h4 className="mt-4 md:text-xl">{post.subtitle}</h4>
        <h5 className="text-gray-500 text-sm md:text-base pt-2">{post.date}</h5>
      </div>
      <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
    </div>
  );
}
