import Experience from "@/components/experience";
import AudioPlayer from "@/components/AudioPlayer";

export default function Home() {
  return (
    <>
      <Experience defaultSecretOpen={true} />
      <AudioPlayer />
    </>
  );
}
