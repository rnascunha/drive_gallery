import ScrollContainer from "@/components/scrollContainer";
import { DisplayConfig, ImageDetail } from "../../types";
import GalleryDisplay from "./galleryDisplay";
import GridDisplay from "./gridDisplay";
import CenterContainer from "@/components/centerContainer";
import TitleHeader from "./titleHeader";
import FullHeightDisplay from "./fullHeightDisplay";

interface ImageDisplayProps {
  dir: gapi.client.drive.File;
  images: ImageDetail[];
  props: DisplayConfig;
}

export default function DisplayImage({
  dir,
  images,
  props,
}: ImageDisplayProps) {
  if (props.type === "fullHeight") {
    return <FullHeightDisplay dir={dir} images={images} props={props} />;
  }

  return (
    <ScrollContainer
      sx={{
        backgroundColor: props.backgroundColor,
        animation: "fadeIn ease 3s",
      }}
    >
      <CenterContainer maxWidth={props.maxWidth}>
        <TitleHeader dir={dir} props={props} />
        {props.type === "grid" ? (
          <GridDisplay images={images} props={props} />
        ) : (
          <GalleryDisplay images={images} props={props} />
        )}
      </CenterContainer>
    </ScrollContainer>
  );
  return;
}
