// App raiz — escolhe a página conforme a aba ativa
import { AppProvider, useApp } from "./context/AppContext";
import { Layout } from "./components/Layout";
import { Registro } from "./pages/Registro";
import { Contador } from "./pages/Contador";
import { Laudo } from "./pages/Laudo";
import { Consulta } from "./pages/Consulta";
import { Metodologia } from "./pages/Metodologia";
import { Significado } from "./pages/Significado";
import "./App.css";

function AppRoutes() {
  const { aba } = useApp();

  return (
    <Layout>
      {aba === "registro" && <Registro />}
      {aba === "contador" && <Contador />}
      {aba === "laudo" && <Laudo />}
      {aba === "consulta" && <Consulta />}
      {aba === "metodologia" && <Metodologia />}
      {aba === "significado" && <Significado />}
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
