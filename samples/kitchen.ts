import { readFile } from 'node:fs/promises';

/** A dish that takes time to cook. */
export interface Recipe {
  name: string;
  minutes: number;
  tags?: string[];
}

const MAX_HEAT = 220;

@injectable()
export class Kitchen {
  private cache = new Map<string, Recipe>();

  async simmer(path: string, heat = 180): Promise<Recipe> {
    if (heat > MAX_HEAT) throw new Error(`Too hot: ${heat}°`);

    const raw = await readFile(path, 'utf8');
    const recipe: Recipe = JSON.parse(raw);
    this.cache.set(path, recipe);
    return /slow/i.test(recipe.name) ? { ...recipe, minutes: 90 } : recipe;
  }
}
