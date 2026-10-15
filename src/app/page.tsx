import Hero from "@/components/home/Hero";
import Skills from "@/components/home/Skills";
import Projects from "@/components/home/Projects";
import HomeChallenge from "@/components/home/HomeChallenge";
import HomeWriting from "@/components/home/HomeWriting";
import Contact from "@/components/home/Contact";

export default function Home() {
  return (
    <>
      <Hero />
      <Skills />
      <Projects />
      <HomeChallenge />
      <HomeWriting />
      <Contact />
    </>
  );
}
