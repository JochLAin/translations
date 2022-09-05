import { SyntheticEvent } from "react";
import useMain, { MainProvider } from "../contexts";
import { TRANSLATIONS } from "../examples";
import Sidebar from "./sidebar";
import Settings from "./settings";

export default function IndexWrapper() {
  return <MainProvider translations={TRANSLATIONS}>
    <Index />
  </MainProvider>;
}

function Index() {
  return <>
    <Sidebar />
    <main>
      <Main />
    </main>
  </>;
}

function Main() {
  const main = useMain();

  if (!main.translations) {
    return <Importer />;
  }
  if (!main.started) {
    return <Configuration />;
  }
  return <main>
    Hello world !
  </main>;
}

function Configuration() {
  const main = useMain();

  return <article>
    <h2>{main.translate('Configuration')}</h2>
    <Settings />
  </article>;
}

function Importer() {
  return <main>
    Import here !
  </main>;
}
