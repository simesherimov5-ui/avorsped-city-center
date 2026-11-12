// A font file imported from code (app/layout.tsx preloads two): the bundler gives its public URL.
declare module "*.woff2" {
  const src: string;
  export default src;
}
