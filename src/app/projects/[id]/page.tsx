import { PROJECTS } from "@/app/data";
import ProjectDetail from "@/components/project/ProjectDetail";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import { getProjectSource } from "@/lib/mdx";
import { getMDXComponents } from "@/components/mdx";
import rehypePrettyCode from "rehype-pretty-code";
import remarkGfm from "remark-gfm";

interface ProjectPageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ index?: string; returnTo?: string }>;
}

export async function generateStaticParams() {
  return PROJECTS.map((p) => ({
    id: p.id,
  }));
}

export default async function ProjectPage({ params, searchParams }: ProjectPageProps) {
  const { id } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const projectIndex = PROJECTS.findIndex((p) => p.id === id);

  if (projectIndex === -1) {
    notFound();
  }

  const project = PROJECTS[projectIndex];
  const nextIndex = (projectIndex + 1) % PROJECTS.length;
  const nextProject = PROJECTS[nextIndex];

  const mdxData = getProjectSource(id);

  let mdxContent: React.ReactNode = null;
  if (mdxData) {
    const { content } = await compileMDX({
      source: mdxData.source,
      components: getMDXComponents(),
      options: {
        parseFrontmatter: false,
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [
            [
              rehypePrettyCode,
              {
                theme: "github-dark-default",
                keepBackground: false,
              },
            ],
          ],
        },
      },
    });
    mdxContent = content;
  }

  return (
    <ProjectDetail
      project={project}
      nextProject={nextProject}
      allProjects={PROJECTS}
      mdxContent={mdxContent}
      initialIndexOpen={resolvedSearchParams?.index === "1"}
      initialIndexReturnTo={resolvedSearchParams?.returnTo}
    />
  );
}
