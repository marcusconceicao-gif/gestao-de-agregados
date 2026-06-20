import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { ExternalLink } from "lucide-react";
import { ResourcePage } from "@/components/ResourcePage";
import { RESOURCES } from "@/lib/resources";

const search = z.object({ create: z.coerce.number().optional() });

export const Route = createFileRoute("/_authenticated/tacografos")({
  validateSearch: search,
  component: () => {
    const { create } = Route.useSearch();
    const nav = useNavigate();
    return (
      <div>
        <div className="px-6 pt-6">
          <a
            href="https://cronotacografo.rbmlq.gov.br/certificados/consultar"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline surface-card px-3 py-2"
          >
            <ExternalLink className="size-4" />
            Consultar certificado no INMETRO (cronotacografo.rbmlq.gov.br)
          </a>
        </div>
        <ResourcePage
          def={RESOURCES.tacografos}
          openCreate={!!create}
          onCreateClosed={() => nav({ to: "/tacografos", search: {} })}
        />
      </div>
    );
  },
});
