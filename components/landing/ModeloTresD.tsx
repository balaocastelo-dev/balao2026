"use client";

import { useState } from "react";
import Image from "next/image";
import { Rotate3d } from "lucide-react";
import Model3DViewer from "@/components/Model3DViewer";

/**
 * O PC gamer em 3D (Sketchfab), que a pessoa gira com o dedo ou o mouse.
 * O visualizador pesa vários megabytes: só carrega quando a pessoa pede,
 * para a página abrir rápida no celular.
 */
const MODELO = "44833fc6db3a43ce88be66609c1fe619";

export default function ModeloTresD({ capa }: { capa: string }) {
  const [aberto, setAberto] = useState(false);
  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] border border-[var(--cpt-fio)] bg-[var(--cpt-superficie)] sm:aspect-[16/9]">
      {aberto ? (
        <Model3DViewer
          title="PC gamer em 3D"
          src={`https://sketchfab.com/models/${MODELO}/embed?ui_theme=dark&transparent=1&autostart=1&ui_infos=0&ui_watermark=0&ui_controls=0&ui_general_controls=0&ui_fullscreen=0&ui_help=0&ui_hint=0&ui_vr=0&ui_settings=0&ui_annotations=0&ui_stop=0&camera=0&dnt=1`}
          className="h-full w-full"
          allow="autoplay; fullscreen; xr-spatial-tracking"
          allowFullScreen
        />
      ) : (
        <button type="button" onClick={() => setAberto(true)} className="group absolute inset-0 block w-full text-left">
          <Image src={capa} alt="Peças de um PC gamer separadas, como numa vista explodida" fill sizes="(min-width: 1024px) 70vw, 100vw" className="object-cover opacity-70 transition-opacity group-hover:opacity-90" />
          <span className="absolute inset-0 grid place-items-center">
            <span className="cpt-botao cpt-botao--acao">
              <Rotate3d className="h-5 w-5" aria-hidden />
              Girar o PC em 3D
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
