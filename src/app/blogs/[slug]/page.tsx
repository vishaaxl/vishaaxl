import { notFound } from "next/navigation";
import MarkdownIt from "markdown-it";
import MarkdownItPrism from "markdown-it-prism";
import { getPostBySlug } from "@/utils/posts";

import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-go.min.js";
import "prismjs/components/prism-yaml.min.js";
import "prismjs/components/prism-bash.min.js";
import "prismjs/components/prism-python.min.js";
import "prismjs/components/prism-docker.min.js";

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

  const md = new MarkdownIt().use(MarkdownItPrism);

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
