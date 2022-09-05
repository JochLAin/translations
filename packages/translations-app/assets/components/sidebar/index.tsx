import useMain from "../../contexts";

export default function Sidebar() {
  const main = useMain();
  if (!main.currentDomain) return null;

  return <aside id="sidebar">

  </aside>;
}
