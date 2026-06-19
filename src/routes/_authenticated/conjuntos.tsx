import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { ResourcePage } from "@/components/ResourcePage";
import { RESOURCES } from "@/lib/resources";

const search = z.object({ create: z.coerce.number().optional() });

export const Route = createFileRoute("/_authenticated/conjuntos")({
  validateSearch: search,
  component: () => {
    const { create } = Route.useSearch();
    const nav = useNavigate();
    return <ResourcePage def={RESOURCES.conjuntos} openCreate={!!create} onCreateClosed={() => nav({ to: "/conjuntos", search: {} })} />;
  },
});
