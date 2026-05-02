export type SeedStudent = {
  name: string;
  regNumber: string;
  slug: string;
};

const slugify = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const raw: Array<[string, string]> = [
  ["BIJAY THAKUR", "160-3-2-07579-2021"],
  ["CHHATRABIR SUTAR KARKI", "160-3-2-07580-2021"],
  ["KARAN KATTEL", "160-3-2-07581-2021"],
  ["KAUSHAL RAJ TRITAL", "160-3-2-07582-2021"],
  ["KISHAN KUMAR RAJBANSHI", "160-3-2-07583-2021"],
  ["MADAN GHIMIRE KHATRI", "160-3-2-07584-2021"],
  ["MD FIROJ MIYA", "160-3-2-07585-2021"],
  ["NIKHIL KUMAR SHAH", "160-3-2-07586-2021"],
  ["RAKESH KUMAR RAJBHAR", "160-3-2-07588-2021"],
  ["SUBIGYAN MISHRA", "160-3-2-07589-2021"],
];

export const SEED_STUDENTS: SeedStudent[] = raw.map(([name, regNumber]) => ({
  name,
  regNumber,
  slug: slugify(name),
}));

export const findSeedByReg = (regNumber: string): SeedStudent | undefined =>
  SEED_STUDENTS.find((s) => s.regNumber === regNumber);

export const findSeedBySlug = (slug: string): SeedStudent | undefined =>
  SEED_STUDENTS.find((s) => s.slug === slug);
