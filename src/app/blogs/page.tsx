import { getAllPosts } from "@/utils/posts";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";

interface pageProps {}

export default function BlogPosts({}: pageProps) {
  const posts = getAllPosts();

  return (
    <div className="container pt-8">
      <div className="p-8 flex flex-col justify-start lg:justify-center gap-5 overflow-hidden w-full relative">
        <h2 className="feature-title text-4xl lg:text-6xl font-semibold leading-tight">
          Explore Engaging Insights, Tips, and More!
        </h2>
        <p className="feature-description text-right lg:text-left text-xl md:text-2xl max-w-[600px]">
          Have something on your mind or some correction?
        </p>
        <a
          href="mailto:vishaaxl@gmail.com"
          className="cta-button max-w-fit text-sm md:text-base mt-4 font-medium py-4 px-8 rounded-full bg-foreground text-background flex items-center gap-4"
        >
          Suggest a topic <FaArrowRight className="float" />
        </a>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
        {posts.map(({ slug, title, subtitle, author, date }: any) => {
          return (
            <Card
              key={slug}
              title={title}
              subtitle={subtitle}
              author={author}
              date={date}
              slug={slug}
            />
          );
        })}
      </div>
    </div>
  );
}

interface CardProps {
  title: string;
  subtitle: string;
  author: string;
  date: string;
  slug: string;
}

const Card = ({ title, subtitle, author, date, slug }: CardProps) => {
  return (
    <div className="h-60 border bg-white flex flex-col justify-between rounded-lg relative overflow-hidden p-6">
      <div>
        <h3 className="text-xl font-semibold">{title}</h3>
        <h4 className="mt-4 text-sm md:text-base">{subtitle}</h4>
      </div>
      <div>
        <h5 className="mt-4 text-sm md:text-base">{author}</h5>
        <h5 className="text-gray-500 text-sm md:text-base">{date}</h5>
      </div>
      <div className="absolute bottom-4 right-4 bg-white rounded-full w-8 h-8 flex items-center justify-center cursor-pointer">
        <Link href={`/blogs/${slug}`} className="text-black text-lg font-bold">
          &rarr;
        </Link>
      </div>
    </div>
  );
};
