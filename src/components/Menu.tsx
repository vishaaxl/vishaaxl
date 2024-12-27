import Link from "next/link";

interface MenuProps {}

const headerLinks = [
  { text: "Github", href: "https://github.com/vishaaxl" },
  { text: "Resume", href: "https://flowcv.com/resume/g86v5tef43" },
  { text: "Email", href: "mailto:vishaaxl@gmail.com" },
];
export default function Menu({}: MenuProps) {
  return (
    <div className="bg-white md:bg-transparent">
      <div className="container">
        <ul className="[&>*]:pb-2 py-2 md:py-4 font-medium flex md:gap-8 gap-4 capitalize text-sm md:text-lg justify-end">
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/blogs">Blogs</Link>
          </li>
          {headerLinks.map((headerLink) => (
            <li key={headerLink.text}>
              <a href={headerLink.href}>{headerLink.text}</a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
