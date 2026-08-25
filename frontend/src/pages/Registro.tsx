// Aba Registro — identificação do exame
import { useApp } from "../context/AppContext";
import { CampoData } from "../components/CampoData";

export function Registro() {
  const { registro, setRegistro, registroCompleto, setAba } = useApp();

  return (
    <section className="card">
      <h2>Identificação do exame</h2>

      <div className="form-grid">
        <label>
          Operador*
          <input
            value={registro.operador}
            onChange={(e) =>
              setRegistro((r) => ({ ...r, operador: e.target.value }))
            }
            placeholder="Nome do técnico / biomédico"
          />
        </label>
        <label>
          Prontuário*
          <input
            value={registro.prontuario}
            onChange={(e) =>
              setRegistro((r) => ({ ...r, prontuario: e.target.value }))
            }
            placeholder="Ex.: PR-100234"
          />
        </label>
        <label>
          Paciente (opcional)
          <input
            value={registro.paciente}
            onChange={(e) =>
              setRegistro((r) => ({ ...r, paciente: e.target.value }))
            }
            placeholder="Nome do paciente"
          />
        </label>
        <label>
          Data do exame
          <CampoData
            value={registro.data_exame}
            onChange={(iso) =>
              setRegistro((r) => ({ ...r, data_exame: iso }))
            }
          />
        </label>
      </div>

      {!registroCompleto && (
        <div className="alerta-vermelho">
          Preencha os campos obrigatórios: Operador e Prontuário
        </div>
      )}

      <button
        type="button"
        className="btn btn-azul"
        onClick={() => {
          if (!registroCompleto) return;
          setAba("contador");
        }}
      >
        Ir para Contador →
      </button>
    </section>
  );
}
