export default function Skills() {
  return (
    <section id="skills" className="py-5">
      <h2 className="fw-bold section-title high-contrast-text mb-4">Core Technologies & Skills</h2>
      <div className="row g-4">
        <div className="col-md-4">
          <div className="p-4 border rounded h-100 bg-body-tertiary">
            <h3 className="h4 fw-bold text-green mb-3">Languages & Frameworks</h3>
            <ul className="list-unstyled high-contrast-text fs-5 mb-0">
              <li className="mb-2">▹ Python (FastAPI, Django)</li>
              <li className="mb-2">▹ C/C++</li>
              <li className="mb-2">▹ SQL</li>
            </ul>
          </div>
        </div>
        <div className="col-md-4">
          <div className="p-4 border rounded h-100 bg-body-tertiary">
            <h3 className="h4 fw-bold text-green mb-3">Data & Infrastructure</h3>
            <ul className="list-unstyled high-contrast-text fs-5 mb-0">
              <li className="mb-2">▹ PostgreSQL & SQLite</li>
              <li className="mb-2">▹ Redis</li>
              <li className="mb-2">▹ Linux & Deployments</li>
            </ul>
          </div>
        </div>
        <div className="col-md-4">
          <div className="p-4 border rounded h-100 bg-body-tertiary">
            <h3 className="h4 fw-bold text-green mb-3">Architecture & Concepts</h3>
            <ul className="list-unstyled high-contrast-text fs-5 mb-0">
              <li className="mb-2">▹ REST API Design</li>
              <li className="mb-2">▹ OAuth (PKCE) & JWT</li>
              <li className="mb-2">▹ Async Workers & Retries</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
