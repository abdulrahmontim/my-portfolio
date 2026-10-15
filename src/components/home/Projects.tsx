import { projects } from "@/data/projects";
import ProjectCard from "@/components/ProjectCard";

export default function Projects() {
  return (
    <section id="projects" className="py-5 border-top">
      <h2 className="fw-bold section-title high-contrast-text mb-4">Selected Engineering Work</h2>

      <div className="row g-4">
        {projects.map((project) => (
          <ProjectCard key={project.title} project={project} />
        ))}
      </div>
    </section>
  );
}
