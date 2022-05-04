declare module '*.svg' {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  export default content;
}

declare module '*.less' {
  const content: { [key in string]: string };
  export default content;
}
