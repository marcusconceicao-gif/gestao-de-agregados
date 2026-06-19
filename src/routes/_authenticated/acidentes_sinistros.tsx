import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { ResourcePage } from "@/components/ResourcePage";
import { RESOURCES } from "@/lib/resources";

const search = z.object({ create: z.coerce.number().optional() });

export const Route = createFileRoute("/_authenticated/acidentes_sinistros")({
  validateSearch: search,
  component: () => {
    const { create } = Route.useSearch();
    const nav = useNavigate();
    return <ResourcePage def={RESOURCES.acidentes_sinistros} openCreate={!!create} onCreateClosed={() => nav({ to: "/acidentes_sinistros", search: {} })} />;
  },
});
