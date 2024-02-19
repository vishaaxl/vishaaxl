import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";

import { api } from "utils/lib";
import BlogCard from "components/Blog/BlogCard";
import Transition from "components/global/Transition";

interface Props {
  posts: any;
}

const Blog: NextPage<Props> = ({ posts }) => {
  return (
    <Transition id="blog">
      <div>
        <Head>
          <title>Blog | Vishal Shukla</title>
          <meta
            name="description"
            content="Blogs about programming and web development"
          />
          <link
            rel="icon"
            href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🗿</text></svg>"
          />
        </Head>
        <a href="https://virtueanalytics.com/shouldnt-be-indexed">Test</a>
        <div className="text-3xl">Latest Blogs</div>
        <div className="center flex-wrap flex-col">
          {posts.slice(0, 3).map((post: any, index: string) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>

        <div className="text-3xl">All Blogs</div>
        <div className="center flex-wrap flex-col">
          {posts.map((post: any, index: string) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      </div>
    </Transition>
  );
};

export const getStaticProps: GetStaticProps = (context) => {
  const articles = api.getAllArticles([
    "slug",
    "title",
    "description",
    "date",
    "coverImage",
    "excerpt",
    "timeReading",
    "cover",
    "tags",
  ]);
  return { props: { posts: articles } };
};
export default Blog;
