import { Project } from "@/data/projects";

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <div className="col-12 col-lg-6">
      <div className="card project-card bg-body-tertiary border h-100">
        <div className="card-body d-flex flex-column p-4">
          <h3 className="h4 fw-bold card-title high-contrast-text mb-1">{project.title}</h3>
          {project.subtitle && (
            <p className="text-green fw-bold mb-3" style={{ fontSize: "0.9rem" }}>
              {project.subtitle}
            </p>
          )}

          <div className="d-flex gap-3 mb-3">
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green fw-bold text-decoration-none"
            >
              GitHub Repo &rarr;
            </a>
          </div>

          <p className="card-text high-contrast-text mb-3">{project.description}</p>
          <ul className="card-text high-contrast-text mb-4">
            {project.bullets.map((bullet, idx) => (
              <li key={idx}>{bullet}</li>
            ))}
          </ul>

          <div className="d-flex flex-wrap gap-2 mt-auto">
            {project.stack.map((tech, idx) => (
              <span key={idx} className="tech-tag">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
