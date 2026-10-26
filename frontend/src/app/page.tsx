export const metadata = { title: "Frutero Pottsville Plant" };

// The demo is one self-contained page, served from public/demo.html and shown here full-screen.
export default function Home() {
  return (
    <iframe
      src="/demo.html"
      title="Frutero demo platform"
      style={{ position: "fixed", inset: 0, width: "100%", height: "100%", border: 0 }}
    />
  );
}
