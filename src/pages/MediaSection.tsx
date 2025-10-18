import Video from "@/assets/Elegance Meets Comfort-VEED.mp4";

export default function TextVideoSection() {
  return (
    <section className="w-full h-screen  flex items-center">
     <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl">
            <video
              src={Video}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            />
          </div>
    </section>
  );
}
