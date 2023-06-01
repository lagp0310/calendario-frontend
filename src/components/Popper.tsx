import { Dispatch, MutableRefObject, useCallback } from "react";
import { default as MuiPopper } from "@mui/base/Popper";
import ClickAwayListener from "@mui/base/ClickAwayListener";
import { createPortal } from "react-dom";
import TextareaAutosize from "@mui/base/TextareaAutosize";
import dayjs from "dayjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

interface PopperProps {
  fecha: Date;
  elementoAncla: HTMLElement | null;
  setElementoAncla: Dispatch<React.SetStateAction<HTMLElement | null>>;
  textareaRef: MutableRefObject<HTMLTextAreaElement | null>;
  editarNota: boolean;
  nota: string | null;
  setNota: Dispatch<React.SetStateAction<string | null>>;
  idNota: number | null;
  setIdNota: Dispatch<React.SetStateAction<number | null>>;
}

const Popper = ({
  fecha,
  elementoAncla,
  setElementoAncla,
  textareaRef,
  editarNota,
  nota,
  setNota,
  idNota,
  setIdNota,
}: PopperProps) => {
  const open = Boolean(elementoAncla);
  const id = open ? "popover" : undefined;

  const handleClickAway = useCallback(() => {
    setElementoAncla(null);
  }, [setElementoAncla]);

  const queryClient = useQueryClient();

  const agregarNotaMutation = useMutation({
    mutationFn: async (objetoNota: { nota: string; fecha: string }) =>
      await axios.post("http://localhost:3333/notas", objetoNota),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notas"] });

      if (textareaRef.current) textareaRef.current.value = "";
      setNota(null);
      setElementoAncla(null);
    },
  });

  const editarNotaMutation = useMutation({
    mutationFn: async ({ id, nota }: { id: number; nota: string }) =>
      await axios.put(`http://localhost:3333/notas/${id}`, { nota }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notas"] });

      if (textareaRef.current) textareaRef.current.value = "";
      setNota(null);
      setIdNota(null);
      setElementoAncla(null);
    },
  });

  const eliminarNotaMutation = useMutation({
    mutationFn: async (id: number) =>
      await axios.delete(`http://localhost:3333/notas/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notas"] });

      setIdNota(null);
      setElementoAncla(null);
    },
  });

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <>
        {createPortal(
          <MuiPopper
            id={id}
            open={Boolean(elementoAncla)}
            anchorEl={elementoAncla}
          >
            <div className="absolute left-1/2 z-10 mt-3 w-screen max-w-xs -translate-x-1/2 transform px-4 sm:px-0 lg:max-w-sm">
              <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                <div className="relative flex flex-1 flex-col gap-3 bg-white p-7">
                  <TextareaAutosize
                    ref={textareaRef}
                    className="p-2 ring ring-blue-200 focus:outline-none rounded-lg"
                    onChange={(event: any) => setNota(event.target.value)}
                    placeholder="Nota Nueva"
                    value={nota ?? ""}
                    id="textarea-nota"
                  />
                  {editarNota ? (
                    <>
                      <button
                        className="flex-1 bg-blue-500 rounded-lg text-white py-2 disabled:opacity-30"
                        onClick={() => {
                          if (idNota && nota)
                            editarNotaMutation.mutate({ id: idNota, nota });
                        }}
                        disabled={
                          !nota ||
                          nota?.length === 0 ||
                          editarNotaMutation.isLoading
                        }
                      >
                        Editar Nota
                      </button>
                      <button
                        className={
                          "flex-1 bg-red-500 rounded-lg text-white py-2 disabled:opacity-30"
                        }
                        onClick={() => {
                          if (idNota) eliminarNotaMutation.mutate(idNota);
                        }}
                        disabled={eliminarNotaMutation.isLoading}
                      >
                        Eliminar Nota
                      </button>
                    </>
                  ) : (
                    <button
                      className="flex-1 bg-blue-500 rounded-lg text-white py-2 disabled:opacity-30"
                      onClick={() => {
                        if (nota && fecha)
                          agregarNotaMutation.mutate({
                            nota,
                            fecha: dayjs(fecha).format("YYYY-MM-DD"),
                          });
                      }}
                      disabled={
                        !nota ||
                        nota?.length === 0 ||
                        agregarNotaMutation.isLoading
                      }
                    >
                      Agregar Nota
                    </button>
                  )}
                </div>
              </div>
            </div>
          </MuiPopper>,
          document.body
        )}
      </>
    </ClickAwayListener>
  );
};

export default Popper;
