const GALLERY_ITEMS = [
  { label: "Corte y estilo", span: "row-span-2" },
  { label: "Color y mechas", span: "" },
  { label: "Laceados", span: "" },
  { label: "Tratamientos faciales", span: "row-span-2" },
  { label: "Peinados", span: "" },
  { label: "Paquetes de novias", span: "" },
];

export function Gallery() {
  return (
    <section
      id="galeria"
      className="bg-gradient-to-b from-white to-pastel/20 py-16 sm:py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center sm:mb-14">
          <p className="text-sm font-medium uppercase tracking-widest text-gold">
            Galería
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Nuestro trabajo
          </h2>
        </div>

        <div className="grid auto-rows-[180px] grid-cols-2 gap-3 sm:auto-rows-[220px] sm:gap-4 lg:grid-cols-4 lg:gap-5">
          {GALLERY_ITEMS.map((item, i) => (
            <div
              key={i}
              className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br from-pastel to-gold/20 ${item.span}`}
            >
              <div className="absolute inset-0 flex items-center justify-center transition-all group-hover:bg-ink/10">
                <span className="text-sm font-medium text-ink/50 transition-opacity group-hover:opacity-0">
                  {item.label}
                </span>
              </div>
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-ink/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                <p className="p-4 text-sm font-medium text-white">
                  {item.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
