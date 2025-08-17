import NextImage, { ImageProps as NextImageProps } from "next/image"

export default function Image({ ...props }: NextImageProps) {
  return <NextImage {...props} className="rounded-md" style={{ color: "" }} />
}
