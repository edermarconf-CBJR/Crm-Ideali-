"use client";
import { useEffect, useRef } from "react";
export function Dialogo({
  titulo,
  fechar,
  children,
}: {
  titulo: string;
  fechar: () => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  return (
    <dialog ref={ref} onCancel={fechar} aria-labelledby="titulo-dialogo">
      <div className="subtitulo">
        <h2 id="titulo-dialogo">{titulo}</h2>
        <button
          className="fechar"
          type="button"
          aria-label="Fechar"
          onClick={fechar}
        >
          ×
        </button>
      </div>
      {children}
    </dialog>
  );
}
