"""Small Python sample for checking syntax colors."""
from dataclasses import dataclass, field
import re

SLOW = re.compile(r"slow|braise", re.IGNORECASE)


@dataclass
class Recipe:
    name: str
    minutes: int = 30
    tags: list[str] = field(default_factory=list)

    @property
    def is_slow(self) -> bool:
        return self.minutes > 60 or bool(SLOW.search(self.name))


def simmer(recipe: Recipe, heat: float = 180.0) -> str:
    if heat > 220:
        raise ValueError(f"Too hot: {heat}°")
    status = "low and slow" if recipe.is_slow else "quick"
    return f"{recipe.name}: {status} ({recipe.minutes} min)"  # done
