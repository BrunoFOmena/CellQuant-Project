// App raiz — módulo da lateral + aba de cima
import { AppProvider, useApp } from "./context/AppContext";
import { Layout } from "./components/Layout";
import { Registro } from "./pages/Registro";
import { Contador } from "./pages/Contador";
import { Laudo } from "./pages/Laudo";
import { Consulta } from "./pages/Consulta";
import { Metodologia } from "./pages/Metodologia";
import { Significado } from "./pages/Significado";
import { Estatistica } from "./pages/Estatistica";
import { Manual } from "./pages/Manual";
import "./App.css";

function AppRoutes() {
  const { aba, secao } = useApp();

  return (
    <Layout>
      {secao === "tabela" && <Consulta />}
      {secao === "estatistica" && <Estatistica />}
      {secao === "manual" && <Manual />}
      {secao === "contador" && aba === "registro" && <Registro />}
      {secao === "contador" && aba === "contador" && <Contador />}
      {secao === "contador" && aba === "laudo" && <Laudo />}
      {secao === "contador" && aba === "metodologia" && <Metodologia />}
      {secao === "contador" && aba === "significado" && <Significado />}
    </Layout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}
