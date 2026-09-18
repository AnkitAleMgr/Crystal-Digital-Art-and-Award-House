// ── HOME PAGE ─────────────────────────────────────────────────────────────────

import { useNavigate } from "react-router-dom";
import { FeaturedProducts } from "../../client/components/pages/home/homeFeatureProducts";
import { WhyChooseUs } from "../../client/components/pages/home/homeWhyChooseUs";
import { Testimonials } from "../../client/components/pages/home/homeTestimonials";
import { ServicesGrid,} from "../../client/components/pages/home/homeService";
import { HeroCarousel } from "../components/pages/home/homeCaurousel";
import { Section, SectionHeading, SectionLabel } from "../components/pages/home/homeSection";

export function HomePage() {
  const navigate = useNavigate();

  const goToGallery = () => {
    navigate("/gallery");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToQuote = () => {
    const el = document.getElementById("premium-products");

    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      return;
    }

    navigate("/contact");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div>
      <HeroCarousel onQuote={goToQuote} onGallery={goToGallery} />

      <Section bg="#F8FAFC">
        <SectionLabel>What We Do</SectionLabel>

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-10">
          <SectionHeading>Our Services</SectionHeading>

          <p className="max-w-xl text-sm leading-relaxed text-gray-500">
            From premium awards and trophies to precision engraving and digital
            printing, we create customized products for every milestone and
            occasion.
          </p>
        </div>

        <ServicesGrid />
      </Section>

      <Section bg="white" id="premium-products">
        <SectionLabel>Featured Collection</SectionLabel>

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-10">
          <SectionHeading>Premium Awards & Products</SectionHeading>

          <button
            onClick={goToGallery}
            className="self-start lg:self-auto px-5 py-2.5 rounded-xl text-sm font-semibold text-blue-600 border border-blue-200 hover:bg-blue-50 transition-colors"
          >
            View Full Gallery →
          </button>
        </div>

        <FeaturedProducts />
      </Section>

      <Section bg="#0F172A">
        <div className="text-center mb-10">
          <SectionLabel>Why Crystal Digital</SectionLabel>

          <SectionHeading light>
            Built Around Quality & Service
          </SectionHeading>

          <p className="max-w-2xl mx-auto mt-4 text-sm leading-relaxed text-blue-100">
            Quality materials, modern equipment, creative design, and dependable
            service come together to make every order memorable.
          </p>
        </div>

        <WhyChooseUs />
      </Section>

      {/* FIXED: removed the extra } */}
      <Section bg="linear-gradient(135deg, #1E3A8A, #2563EB)">
        <div className="text-center mb-8">
          <SectionLabel>Customer Stories</SectionLabel>

          <SectionHeading light>
            What Our Customers Say
          </SectionHeading>
        </div>

        <Testimonials />
      </Section>

      <Section bg="#F8FAFC">
        <div
          className="relative overflow-hidden rounded-3xl p-8 lg:p-14 text-center"
          style={{
            background: "linear-gradient(135deg, #1F2937, #374151)",
          }}
        >
          <div className="relative">
            <SectionLabel>Ready to Create?</SectionLabel>

            <h2
              className="text-2xl lg:text-4xl font-bold text-white mb-4"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Turn Your Idea Into a Memorable Award
            </h2>

            <p className="max-w-2xl mx-auto text-gray-300 text-sm lg:text-base leading-relaxed mb-7">
              Tell us what you need and our team will help with design,
              customization, pricing, and delivery.
            </p>

            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => navigate("/contact")}
                className="px-7 py-3.5 rounded-xl font-bold text-white transition-all hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
                }}
              >
                Request a Quote
              </button>

              <button
                onClick={goToGallery}
                className="px-7 py-3.5 rounded-xl font-semibold text-white border border-white/30 hover:bg-white/10 transition-all"
              >
                Explore Gallery
              </button>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}