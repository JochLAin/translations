import type { AppProps } from 'next/app';
import Head from "next/head";
import '../stylesheets/index.scss';

export default function App({ Component, pageProps }: AppProps) {
  return <>
    <Head>
      <title>Translate</title>
      <meta name="description" content="Translation catalog management app" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href="https://fonts.googleapis.com/css2?family=Abel&family=Caveat&family=Lato&display=swap" rel="stylesheet" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <Component {...pageProps} />
  </>;
}
