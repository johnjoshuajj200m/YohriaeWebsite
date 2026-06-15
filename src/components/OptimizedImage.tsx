type OptimizedImageProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  /** Above-the-fold LCP candidate */
  priority?: boolean;
  sizes?: string;
  srcSet?: string;
};

/**
 * Performance-friendly image: explicit dimensions (CLS), lazy by default,
 * optional fetchpriority for LCP.
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = "",
  priority = false,
  sizes,
  srcSet,
}: OptimizedImageProps) {
  return (
    <img
      src={src}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading={priority ? "eager" : "lazy"}
      decoding={priority ? "sync" : "async"}
      fetchPriority={priority ? "high" : "auto"}
    />
  );
}
