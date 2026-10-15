import { projects } from "@/data/projects";
import ProjectCard from "@/components/ProjectCard";

export default function Projects() {
  return (
    <section id="projects" className="w-full max-w-[1120px] mx-auto px-6 py-12">
      <div className="flex flex-col gap-2 mb-8">
        <span className="label">Selected work</span>
        <h2 className="font-display font-bold text-[36px] text-text">
          Systems I&apos;ve built
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((project, idx) => (
          <ProjectCard key={project.title} project={project} index={idx} />
        ))}
      </div>
    </section>
  );
}
