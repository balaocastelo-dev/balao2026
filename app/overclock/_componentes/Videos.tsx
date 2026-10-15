import { Clapperboard } from "lucide-react";
import { VIDEOS, idDoYoutube, type VideoOverclock } from "../_dados/videos";
import { BotaoDemonstracao } from "./ui";

/**
 * Seção de vídeos. Lê a lista VIDEOS de `_dados/videos.ts`. Lista vazia =
 * "em breve" com o convite para a demonstração ao vivo.
 */

function Reprodutor({ video, grande }: { video: VideoOverclock; grande?: boolean }) {
  const id = video.youtube ? idDoYoutube(video.youtube) : null;
  return (
    <figure className="overflow-hidden rounded-2xl border border-(--oc-linha) bg-(--oc-painel)">
      <div className="relative aspect-video bg-black">
        {id ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}?rel=0`}
            title={video.titulo}
            loading="lazy"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        ) : video.arquivo ? (
          <video
            src={video.arquivo}
            poster={video.capa}
            controls
            preload="none"
            playsInline
            className="absolute inset-0 h-full w-full"
          >
            <track kind="captions" />
          </video>
        ) : null}
      </div>
      <figcaption className="px-5 py-4">
        <p className={`font-bold ${grande ? "text-xl" : "text-lg"}`}>{video.titulo}</p>
        {video.descricao ? <p className="mt-1 text-base text-(--oc-suave)">{video.descricao}</p> : null}
      </figcaption>
    </figure>
  );
}

export default function Videos() {
  const validos = VIDEOS.filter((v) => (v.youtube && idDoYoutube(v.youtube)) || v.arquivo);
  const demonstracao = validos.find((v) => v.tipo === "demonstracao");
  const comerciais = validos.filter((v) => v !== demonstracao);

  if (validos.length === 0) {
    return (
      <div className="flex flex-col gap-6 rounded-2xl border border-dashed border-(--oc-linha) p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="flex items-start gap-4">
          <Clapperboard className="mt-1 h-8 w-8 shrink-0 text-(--oc-laranja)" aria-hidden />
          <div>
            <p className="text-xl font-bold">Os vídeos estão em gravação.</p>
            <p className="mt-1 text-(--oc-suave)">
              Enquanto isso, a gente mostra o sistema ao vivo, funcionando na loja, pelo WhatsApp ou por
              chamada de vídeo.
            </p>
          </div>
        </div>
        <BotaoDemonstracao className="w-full shrink-0 sm:w-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {demonstracao ? <Reprodutor video={demonstracao} grande /> : null}
      {comerciais.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {comerciais.map((v) => (
            <Reprodutor key={`${v.titulo}-${v.youtube ?? v.arquivo}`} video={v} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
