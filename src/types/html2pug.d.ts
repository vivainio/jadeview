declare module 'html2pug' {
  interface ConvertOptions {
    tabs?: boolean;
    fragment?: boolean;
  }

  function html2pug(
    html: string,
    options?: ConvertOptions
  ): string;

  export = html2pug;
} 