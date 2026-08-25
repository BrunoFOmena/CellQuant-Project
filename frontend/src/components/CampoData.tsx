// Campo de data em dd/mm/aaaa (o valor guardado continua ISO aaaa-mm-dd)
import { useEffect, useState } from "react";
import { formatarDataBr, isoDeDataBr, mascararDigitacaoData } from "../utils/data";

export function CampoData({
  value,
  onChange,
  allowEmpty = false,
}: {
  value: string;
  onChange: (iso: string) => void;
  allowEmpty?: boolean;
}) {
  const [texto, setTexto] = useState(formatarDataBr(value));

  useEffect(() => {
    setTexto(formatarDataBr(value));
  }, [value]);

  return (
    <input
      type="text"
      inputMode="numeric"
      placeholder="dd/mm/aaaa"
      maxLength={10}
      value={texto}
      onChange={(e) => {
        const mascarado = mascararDigitacaoData(e.target.value);
        setTexto(mascarado);
        if (allowEmpty && mascarado === "") {
          onChange("");
          return;
        }
        const iso = isoDeDataBr(mascarado);
        if (iso) onChange(iso);
      }}
    />
  );
}
