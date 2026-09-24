import type { InputHTMLAttributes } from "react";
type Props = InputHTMLAttributes<HTMLInputElement> & {
  rotulo: string;
  erro?: string;
  opcoes?: { valor: string; texto: string }[];
  longo?: boolean;
  amplo?: boolean;
};
export function Campo({ rotulo, erro, opcoes, longo, amplo, ...p }: Props) {
  const id = p.id ?? p.name!;
  return (
    <div className={"campo " + (amplo ? "amplo" : "")}>
      <label htmlFor={id}>{rotulo}</label>
      {opcoes ? (
        <select
          id={id}
          name={p.name}
          value={p.value}
          onChange={p.onChange as never}
          disabled={p.disabled}
          required={p.required}
        >
          {opcoes.map((o) => (
            <option key={o.valor} value={o.valor}>
              {o.texto}
            </option>
          ))}
        </select>
      ) : longo ? (
        <textarea
          id={id}
          name={p.name}
          value={p.value}
          onChange={p.onChange as never}
          rows={4}
          disabled={p.disabled}
        />
      ) : (
        <input
          {...p}
          id={id}
          aria-invalid={!!erro}
          aria-describedby={erro ? id + "-erro" : undefined}
        />
      )}{" "}
      {erro && (
        <small className="erro-campo" id={id + "-erro"}>
          {erro}
        </small>
      )}
    </div>
  );
}
export function Aviso({ erro, avisos }: { erro?: string; avisos?: string }) {
  return (
    <div aria-live="polite">
      {erro && (
        <p role="alert" className="aviso erro">
          {erro}
        </p>
      )}
      {avisos && <p className="aviso sucesso">{avisos}</p>}
    </div>
  );
}
