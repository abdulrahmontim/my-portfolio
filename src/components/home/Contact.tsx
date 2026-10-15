import { EMAIL_LINK, SOCIAL_LINKS } from "@/lib/site";

export default function Contact() {
  return (
    <section id="contact" className="py-5 border-top text-center my-4 mx-auto" style={{ maxWidth: "600px" }}>
      <h2 className="fw-bold high-contrast-text mb-3">Get In Touch</h2>
      <p className="high-contrast-text fs-5 mb-4">
        I am currently open to new backend engineering opportunities. Whether you have a question or just want to say hi, I&apos;ll try my best to get back to you!
      </p>
      <div className="d-flex justify-content-center flex-wrap gap-3">
        <a href={EMAIL_LINK} className="btn btn-lg btn-green fw-bold px-4">
          Say Hello
        </a>
        {SOCIAL_LINKS.map((item) => (
          <a
            key={item.name}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-lg btn-outline-green fw-bold px-4"
          >
            {item.name}
          </a>
        ))}
      </div>
    </section>
  );
}
