import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import type { Product } from "../backend";
import { useGetProducts } from "../hooks/useQueries";

const SEED_PRODUCTS: Product[] = [
  {
    id: 1n,
    name: "Diamond Solitaire Ring",
    description:
      "A timeless 18k gold ring with a brilliant round-cut diamond, perfect for every occasion.",
    imageUrl: "/assets/generated/ring-diamond-solitaire.dim_600x600.jpg",
    category: "Rings",
  },
  {
    id: 2n,
    name: "Sapphire Twist Ring",
    description:
      "Hand-crafted twisted gold band with a vibrant Ceylon sapphire set at the centre.",
    imageUrl: "/assets/generated/ring-sapphire-twist.dim_600x600.jpg",
    category: "Rings",
  },
  {
    id: 3n,
    name: "Pav\u00e9 Eternity Ring",
    description:
      "An exquisite eternity band fully set with pav\u00e9 diamonds in polished rose gold.",
    imageUrl: "/assets/generated/ring-eternity-pave.dim_600x600.jpg",
    category: "Rings",
  },
  {
    id: 4n,
    name: "Diamond Teardrop Pendant",
    description:
      "A delicate 18k gold chain suspending a pear-shaped diamond in a modern bezel setting.",
    imageUrl: "/assets/generated/necklace-diamond-pendant.dim_600x600.jpg",
    category: "Necklaces",
  },
  {
    id: 5n,
    name: "Pearl & Gold Choker",
    description:
      "Triple-strand lustrous Akoya pearls with an 18k gold lobster clasp, radiantly timeless.",
    imageUrl: "/assets/generated/necklace-pearl-choker.dim_600x600.jpg",
    category: "Necklaces",
  },
  {
    id: 6n,
    name: "Ruby Pendant Necklace",
    description:
      "Rich Burmese ruby suspended from a fine layered gold chain \u2014 bold, passionate, unforgettable.",
    imageUrl: "/assets/generated/necklace-ruby-pendant.dim_600x600.jpg",
    category: "Necklaces",
  },
  {
    id: 7n,
    name: "Emerald Drop Earrings",
    description:
      "Elegant long drop earrings in 18k gold, each set with a vivid Colombian emerald.",
    imageUrl: "/assets/generated/earrings-emerald-drops.dim_600x600.jpg",
    category: "Earrings",
  },
  {
    id: 8n,
    name: "Diamond Stud Earrings",
    description:
      "Brilliant-cut diamond studs in four-prong 18k gold settings \u2014 the definition of classic luxury.",
    imageUrl: "/assets/generated/earrings-diamond-studs.dim_600x600.jpg",
    category: "Earrings",
  },
  {
    id: 9n,
    name: "Gold Hoop Earrings",
    description:
      "Polished 18k yellow gold hoops with a pav\u00e9 diamond accent band \u2014 effortlessly sophisticated.",
    imageUrl: "/assets/generated/earrings-gold-hoops.dim_600x600.jpg",
    category: "Earrings",
  },
];

const CATEGORY_ORDER = ["Rings", "Necklaces", "Earrings"];

function CategoryPlaceholder({ category }: { category: string }) {
  return (
    <div className="w-full aspect-square bg-gradient-to-br from-jet to-[#2a2218] flex items-center justify-center">
      <span className="text-gold font-display text-lg font-semibold tracking-widest uppercase opacity-60">
        {category}
      </span>
    </div>
  );
}

function ProductCard({ product, index }: { product: Product; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white rounded-sm shadow-card overflow-hidden flex flex-col group"
    >
      <div className="overflow-hidden aspect-square">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <CategoryPlaceholder category={product.category} />
        )}
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-display text-lg font-semibold text-jet mb-2">
          {product.name}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-4">
          {product.description}
        </p>
        <button
          type="button"
          data-ocid={`product.view.button.${index + 1}`}
          className="btn-gold w-full py-2.5 px-4 rounded-sm text-center cursor-pointer"
        >
          View Product
        </button>
      </div>
    </motion.div>
  );
}

function ProductSection({
  category,
  products,
}: { category: string; products: Product[] }) {
  const id = category.toLowerCase();
  return (
    <section id={id} className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-gold font-body text-xs tracking-[0.3em] uppercase font-semibold">
            Collection
          </span>
          <h2 className="font-display text-4xl font-bold text-jet mt-2">
            {category}
          </h2>
          <div className="w-16 h-0.5 bg-gold mx-auto mt-4" />
        </motion.div>
        {products.length === 0 ? (
          <div
            data-ocid={`${id}.empty_state`}
            className="text-center py-16 text-muted-foreground"
          >
            <p className="font-display italic text-xl">
              Our {category.toLowerCase()} collection is being curated.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product, i) => (
              <ProductCard
                key={String(product.id)}
                product={product}
                index={i}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default function HomePage() {
  const { data: backendProducts, isLoading } = useGetProducts();

  const allProducts =
    backendProducts && backendProducts.length > 0
      ? backendProducts
      : SEED_PRODUCTS;

  const byCategory = (cat: string) =>
    allProducts.filter((p) => p.category === cat);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-jet py-6 text-center">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-gold tracking-wider">
          Altifition Jewellery
        </h1>
        <p className="text-white/70 font-body text-sm tracking-[0.25em] uppercase mt-1">
          Luxury Jewellery Collection
        </p>
      </header>

      {/* Navigation */}
      <nav className="bg-gold sticky top-0 z-50 shadow-gold nav-gold">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-center gap-1 py-0">
          {(
            [
              { label: "Home", href: "#top", ocid: "nav.home.link" },
              { label: "Rings", href: "#rings", ocid: "nav.rings.link" },
              {
                label: "Necklaces",
                href: "#necklaces",
                ocid: "nav.necklaces.link",
              },
              {
                label: "Earrings",
                href: "#earrings",
                ocid: "nav.earrings.link",
              },
              { label: "Contact", href: "#contact", ocid: "nav.contact.link" },
            ] as const
          ).map((item) => (
            <a
              key={item.label}
              href={item.href}
              data-ocid={item.ocid}
              className="font-body font-bold text-jet text-sm py-4 px-5 transition-colors duration-200 hover:bg-white hover:text-jet"
            >
              {item.label}
            </a>
          ))}
          <Link
            to="/admin"
            data-ocid="nav.admin.link"
            className="font-body font-medium text-jet/60 text-xs py-4 px-3 ml-auto transition-colors duration-200 hover:bg-white hover:text-jet"
          >
            Admin
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section
        id="top"
        className="relative bg-cover bg-center py-28 px-4 overflow-hidden"
        style={{ background: "#fdf2e9" }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage:
              "url('/assets/generated/hero-bg.dim_1600x600.jpg')",
          }}
        />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-gold font-body text-xs tracking-[0.35em] uppercase font-semibold mb-4"
          >
            Est. 2020 &mdash; Fine Jewellery
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-5xl md:text-6xl font-bold text-jet leading-tight mb-6"
          >
            Elegant Jewellery for
            <br />
            <em className="text-gold not-italic">Every Occasion</em>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="font-body text-jet/70 text-lg md:text-xl leading-relaxed mb-10"
          >
            Discover beautiful rings, necklaces and earrings crafted with
            elegance.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <a
              href="#rings"
              className="btn-gold inline-block py-3.5 px-10 rounded-sm text-sm"
            >
              Explore Collection
            </a>
            <a
              href="#contact"
              className="inline-block py-3.5 px-10 rounded-sm text-sm font-body font-semibold border-2 border-jet text-jet hover:bg-jet hover:text-cream transition-colors duration-200 tracking-widest uppercase text-xs"
            >
              Contact Us
            </a>
          </motion.div>
        </div>
      </section>

      {/* Divider */}
      <div className="bg-jet py-3 text-center">
        <p className="text-gold/70 font-body text-xs tracking-[0.4em] uppercase">
          Rings &bull; Necklaces &bull; Earrings &bull; Crafted with Elegance
        </p>
      </div>

      {/* Product Sections */}
      {isLoading ? (
        <div className="py-24 text-center" data-ocid="products.loading_state">
          <div className="inline-block w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          <p className="font-body text-muted-foreground mt-4">
            Loading collection&hellip;
          </p>
        </div>
      ) : (
        CATEGORY_ORDER.map((cat, ci) => (
          <div
            key={cat}
            className={ci % 2 === 0 ? "bg-background" : "bg-[#f9f9f4]"}
          >
            <ProductSection category={cat} products={byCategory(cat)} />
          </div>
        ))
      )}

      {/* About */}
      <section className="py-20 px-4 bg-[#f9f9f4] border-t border-border">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-gold font-body text-xs tracking-[0.3em] uppercase font-semibold">
              Our Story
            </span>
            <h2 className="font-display text-4xl font-bold text-jet mt-2 mb-6">
              About Altifition
            </h2>
            <div className="w-16 h-0.5 bg-gold mx-auto mb-8" />
            <p className="font-body text-jet/70 text-lg leading-relaxed">
              Altifition Jewellery offers premium jewellery collections
              including rings, necklaces and earrings crafted with elegance and
              luxury design. Our mission is to deliver timeless beauty and
              quality craftsmanship. Every piece in our collection is a
              testament to refined artistry \u2014 from the initial sketch to
              the final polish, we ensure that each jewel meets the highest
              standards of excellence.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 px-4 bg-[#fff8e7]">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-gold font-body text-xs tracking-[0.3em] uppercase font-semibold">
              Get In Touch
            </span>
            <h2 className="font-display text-4xl font-bold text-jet mt-2 mb-6">
              Contact Us
            </h2>
            <div className="w-16 h-0.5 bg-gold mx-auto mb-10" />
            <div className="flex flex-col sm:flex-row gap-8 justify-center">
              <div className="flex flex-col items-center gap-2 p-8 bg-white rounded-sm shadow-card">
                <div className="w-12 h-12 rounded-full bg-gold flex items-center justify-center mb-2">
                  <svg
                    aria-label="Email"
                    role="img"
                    className="w-5 h-5 text-jet"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <span className="font-body font-semibold text-jet uppercase tracking-widest text-xs">
                  Email
                </span>
                <span className="font-body text-muted-foreground">
                  hello@altifition.com
                </span>
              </div>
              <div className="flex flex-col items-center gap-2 p-8 bg-white rounded-sm shadow-card">
                <div className="w-12 h-12 rounded-full bg-gold flex items-center justify-center mb-2">
                  <svg
                    aria-label="Phone"
                    role="img"
                    className="w-5 h-5 text-jet"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <span className="font-body font-semibold text-jet uppercase tracking-widest text-xs">
                  Phone
                </span>
                <span className="font-body text-muted-foreground">
                  +1 (555) 234-5678
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-jet py-8 px-4 text-center">
        <p className="font-display text-gold text-lg font-semibold tracking-wider mb-1">
          Altifition Jewellery
        </p>
        <p className="font-body text-white/40 text-sm">
          &copy; 2026 Altifition Jewellery | All Rights Reserved
        </p>
        <p className="font-body text-white/25 text-xs mt-3">
          Built with &#x2665; using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-white/50 transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
