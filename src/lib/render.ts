// Regenera todas as projeções a partir das fontes canônicas.
import { join } from "node:path";
import { writeCatalogMd } from "./catalog/store.ts";
import { loadEstado, saveEstado } from "./estado/store.ts";
import { writeRoutingMd } from "./routing/routing.ts";
import { PATHS } from "./workspace.ts";
import { existsSync, writeTextAtomic } from "./util.ts";
import { renderEstadoMd } from "./estado/render.ts";

export function renderAll(root: string): string[] {
  const done: string[] = [];
  if (existsSync(join(root, PATHS.estadoJson))) {
    const e = loadEstado(root);
    writeTextAtomic(join(root, PATHS.estadoMd), renderEstadoMd(e));
    done.push(PATHS.estadoMd);
  }
  if (existsSync(join(root, PATHS.catalogDir))) {
    writeCatalogMd(root);
    done.push(PATHS.catalogMd);
  }
  if (existsSync(join(root, PATHS.routingJson))) {
    writeRoutingMd(root);
    done.push(PATHS.routingMd);
  }
  return done;
}

export { saveEstado };
