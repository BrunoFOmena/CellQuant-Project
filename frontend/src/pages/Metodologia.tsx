// Aba Metodologia — passos e fórmula
export function Metodologia() {
  return (
    <section className="card">
      <h2>PASSOS DA CONTAGEM EM CÂMARA</h2>
      <ol className="lista">
        <li>Homogeneizar o LCR suavemente por inversão.</li>
        <li>Preencher a câmara de Neubauer por capilaridade, evitando bolhas.</li>
        <li>Aguardar 1–2 minutos para sedimentação das células.</li>
        <li>
          Contar leucócitos nos 4 quadrantes de canto (400x). O campo começa em 4;
          altere se contar quantidade diferente de quadrantes grandes.
        </li>
        <li>
          Contar hemácias no retículo central (1 quadrante grande = 0,1 µL). O
          campo começa em 1. Se contar mais quadrantes grandes (cantos ou outros),
          ajuste o número antes de salvar.
        </li>
        <li>
          Fazer diferencial (polimorfonucleares × mononucleares), preferencialmente
          em pelo menos 100 células.
        </li>
        <li>Registrar a diluição usada quando a amostra for muito celular.</li>
      </ol>

      <div className="caixa-formula">
        <strong>FÓRMULA APLICADA</strong>
        <p>células/µL = total contado ÷ (nº quadrantes × 0,1) × diluição</p>
        <p className="hint">
          Cada quadrante grande da Neubauer possui volume de 0,1 µL. Forma
          equivalente: total × diluição × 10 ÷ nº de quadrantes. O mesmo critério
          vale para leucócitos e hemácias — o que muda é quantos quadrantes você
          informa.
        </p>
      </div>

      <div className="alerta-vermelho">
        Atenção — amostras hemorrágicas ou com coágulo: punção traumática eleva
        falsamente a contagem de leucócitos. Amostras coaguladas devem ser
        rejeitadas e recoletadas.
      </div>
    </section>
  );
}
