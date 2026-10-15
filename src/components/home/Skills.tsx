import Tag from "@/components/ui/Tag";

const SKILLS = [
  "Python (FastAPI, Django)",
  "C/C++",
  "SQL",
  "PostgreSQL & SQLite",
  "Redis",
  "Linux & Deployments",
  "REST API Design",
  "OAuth (PKCE) & JWT",
  "Async Workers & Retries",
];

export default function Skills() {
  return (
    <section id="skills" className="w-full max-w-[1120px] mx-auto px-6 py-10">
      <div className="flex flex-col gap-3">
        <span className="label">Skills</span>
        <div className="flex flex-wrap gap-2.5 items-center">
          {SKILLS.map((skill) => (
            <Tag key={skill} className="text-sm py-1 px-3">
              {skill}
            </Tag>
          ))}
        </div>
      </div>
    </section>
  );
}
