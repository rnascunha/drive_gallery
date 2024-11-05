import { DisplayConfig, ImageDetail } from "../../types";
import ImageCarousel from "./imageCarousel";

interface GalleryDisplayProps {
  props: DisplayConfig;
  images: ImageDetail[];
}

export default function GalleryDisplay({ images, props }: GalleryDisplayProps) {
  return (
    <ImageCarousel
      props={props.gallery}
      images={images}
      showImageName={props.showImageName}
      showImageDescription={props.showImageDescription}
    />
  );
}