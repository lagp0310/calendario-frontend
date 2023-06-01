import { useCallback, useEffect, useRef, useState, MouseEvent } from "react";
import { Calendar } from "react-calendar";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Popper from "./Popper";

const filtrarNotasPorFecha = (fecha: string, date: Date) => {
  const fechaNota = new Date(fecha);
  const mes = fechaNota.getMonth() + 1;
  const dia = fechaNota.getDate();
  const year = fechaNota.getFullYear();

  return (
    mes === date.getMonth() + 1 &&
    dia === date.getDate() &&
    year === date.getFullYear()
  );
};

const Calendario = () => {
  const [fecha, onChangeFecha] = useState(new Date());
  const [elementoAncla, setElementoAncla] = useState<HTMLElement | null>(null);
  const [nota, setNota] = useState<string | null>(null);
  const [editarNota, setEditarNota] = useState(false);
  const [idNota, setIdNota] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const queryClient = useQueryClient();

  useQuery({
    queryKey: ["notas"],
    queryFn: async () => await axios.get("http://localhost:3333/notas"),
  });

  const onClickDia = useCallback(
    (_value: Date, event: MouseEvent<HTMLButtonElement>) => {
      if (
        (event.target as EventTarget & { nodeName: string }).nodeName !== "DIV"
      ) {
        if (textareaRef.current) textareaRef.current.value = "";
        setNota(null);
        setIdNota(null);
        setEditarNota(false);
      }

      setElementoAncla(event.currentTarget);
    },
    [setNota, setIdNota, setEditarNota, setElementoAncla]
  );

  const obtenerJSXNotas = useCallback(
    (date: Date) =>
      (queryClient.getQueryData(["notas"]) as any)?.data
        .filter(({ fecha }: { fecha: string }) =>
          filtrarNotasPorFecha(fecha, date)
        )
        .map(({ id, nota }: { id: number; nota: string }) => (
          <div
            key={id}
            className="bg-green-500 rounded-lg my-2 px-2 max-h-16 leading-normal whitespace-nowrap text-ellipsis overflow-clip"
            onClick={(event) => {
              setIdNota(id);
              setEditarNota(true);
              setElementoAncla(event.currentTarget);
              setNota(nota);
            }}
          >
            {nota}
          </div>
        )),
    [queryClient]
  );

  const escapePulsado = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setElementoAncla(null);
        setNota(null);
        setIdNota(null);
        setEditarNota(false);
      }
    },
    [setElementoAncla, setNota, setIdNota, setEditarNota]
  );

  useEffect(() => {
    document.addEventListener("keydown", escapePulsado, false);

    return () => {
      document.removeEventListener("keydown", escapePulsado, false);
    };
  }, [escapePulsado]);

  return (
    <div
      id="contenedor"
      className="flex justify-center w-full align-middle h-full"
      onClick={(event) => {
        const { nodeName, id } = event.target as EventTarget & {
          nodeName: string;
          id: string;
        };
        if (nodeName === "DIV" && id === "contenedor") setElementoAncla(null);
      }}
    >
      <div className="flex w-5/6 h-[80%] self-center">
        <Popper
          fecha={fecha}
          elementoAncla={elementoAncla}
          setElementoAncla={setElementoAncla}
          textareaRef={textareaRef}
          editarNota={editarNota}
          nota={nota}
          setNota={setNota}
          idNota={idNota}
          setIdNota={setIdNota}
        />
        <Calendar
          locale="es-VE"
          onChange={(value) => onChangeFecha(value as Date)}
          onActiveStartDateChange={() => setElementoAncla(null)}
          onViewChange={() => setElementoAncla(null)}
          onClickDay={(value, event) => onClickDia(value, event)}
          value={fecha}
          className="w-full h-auto overflow-auto"
          tileContent={({ date, view }) =>
            view === "month" ? (
              <div className="w-full max-h-40 overflow-auto">
                {obtenerJSXNotas(date)}
              </div>
            ) : null
          }
        />
      </div>
    </div>
  );
};

export default Calendario;
