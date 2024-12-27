import { existsSync, readdirSync, readFileSync } from "fs";
import matter from "gray-matter";
import path from "path";

const postDir = path.join(process.cwd(), "src/post");

export const getAllPosts = () => {
  const fileNames = readdirSync(postDir);

  return fileNames.map((fileName) => {
    const filePath = path.join(postDir, fileName);
    const slug = fileName.replace(/\.md$/, "");
    const fileContent = readFileSync(filePath, "utf-8");

    const { content, data } = matter(fileContent);
    return {
      slug,
      content,
      ...data,
    };
  });
};
export const getPostBySlug = (slug: string) => {
  const filePath = path.join(postDir, `${slug}.md`);

  if (!existsSync(filePath)) {
    return null;
  }

  const fileContent = readFileSync(filePath, "utf-8");
  const { content, data } = matter(fileContent);

  return {
    slug,
    content,
    ...data,
  };
};
