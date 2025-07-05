declare module 'html2jade' {
  interface ConvertOptions {
    noemptypipe?: boolean;
    bodyless?: boolean;
    nspaces?: number;
    noattrcomma?: boolean;
  }

  function convertHtml(
    html: string,
    options: ConvertOptions,
    callback: (error: any, jade: string) => void
  ): void;

  export = { convertHtml };
} 