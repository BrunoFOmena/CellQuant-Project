// Aba Significado clínico — tabela de apoio
export function Significado() {
  return (
    <section className="card">
      <h2>ACHADO × INTERPRETAÇÃO USUAL</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Achado</th>
              <th>Interpretação usual</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>LCR límpido, &lt; 5 leucócitos/µL</td>
              <td>Padrão dentro da normalidade em adultos.</td>
            </tr>
            <tr>
              <td>Pleocitose com predomínio de polimorfonucleares</td>
              <td>Compatível com processo bacteriano agudo.</td>
            </tr>
            <tr>
              <td>Pleocitose com predomínio de mononucleares</td>
              <td>Sugestiva de etiologia viral, fúngica ou tuberculosa.</td>
            </tr>
            <tr>
              <td>Hemácias presentes em grande quantidade</td>
              <td>
                Punção traumática ou hemorragia subaracnóidea — comparar tubos
                sequenciais.
              </td>
            </tr>
            <tr>
              <td>Aspecto turvo / purulento</td>
              <td>Alta celularidade; priorizar bacterioscopia e cultura.</td>
            </tr>
            <tr>
              <td>Contagem muito elevada com diluição aplicada</td>
              <td>Conferir fator de diluição antes de liberar o resultado.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="alerta-amarelo">
        <strong>Aviso:</strong> conteúdo apenas de apoio técnico ao laboratório. A
        conclusão diagnóstica é responsabilidade exclusiva do médico assistente.
      </div>
    </section>
  );
}
