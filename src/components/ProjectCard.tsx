import { Project } from "@/data/projects";
import Card from "@/components/ui/Card";
import Tag from "@/components/ui/Tag";

interface ProjectCardProps {
  project: Project;
  index: number;
}

export default function ProjectCard({ project, index }: ProjectCardProps) {
  const indexLabel = String(index + 1).padStart(2, "0");

  return (
    <Card className="flex flex-col h-full">
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="font-mono text-xs font-semibold text-muted">
          {indexLabel}
        </span>
        {project.subtitle && (
          <span className="font-mono text-xs text-primary font-medium">
            {project.subtitle}
          </span>
        )}
      </div>

      <h3 className="font-display font-bold text-[22px] text-text mb-2">
        {project.title}
      </h3>

      <div className="mb-4">
        <a
          href={project.repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-secondary hover:text-primary font-semibold text-sm inline-flex items-center gap-1 transition-colors"
        >
          GitHub Repo &rarr;
        </a>
      </div>

      <p className="text-muted text-[15px] leading-relaxed mb-4">
        {project.description}
      </p>

      {project.bullets && project.bullets.length > 0 && (
        <ul className="text-sm text-muted space-y-2 mb-6 list-disc list-inside leading-relaxed">
          {project.bullets.map((bullet, idx) => (
            <li key={idx} className="marker:text-primary">
              <span className="text-text">{bullet}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-border/50">
        {project.stack.map((tech) => (
          <Tag key={tech}>{tech}</Tag>
        ))}
      </div>
    </Card>
  );
}
