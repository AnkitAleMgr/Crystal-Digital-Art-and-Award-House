import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import { useInView } from "../../client/hooks/useInView";
import { StatCounter } from "../../client/components/pages/aboutUs/aboutUsStatCounter";
import { Section, SectionHeading, SectionLabel } from "../components/pages/home/homeSection";
import img6 from "../../../imports/image-6.png";
import img7 from "../../../imports/image-7.png";
import img8 from "../../../imports/image-8.png";


export function AboutPage() {
  const { ref: r1, visible: v1 } = useInView();
  return (
    <div style={{ paddingTop: "80px" }}>
      {/* Hero banner */}
      <div className="relative h-64 overflow-hidden">
        <ImageWithFallback
          src={img6}
          alt="Crystal Digital store"
          className="w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(15,23,42,0.85), rgba(37,99,235,0.6))",
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-center px-4">
          <div>
            <div
              className="text-xs font-bold tracking-widest uppercase mb-3"
              style={{ color: "#D4AF37" }}
            >
              About Us
            </div>
            <h1
              className="text-4xl font-bold text-white"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Our Story
            </h1>
          </div>
        </div>
      </div>

      {/* Story */}
      <Section bg="white">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <div
            ref={r1}
            style={{
              opacity: v1 ? 1 : 0,
              transform: v1 ? "none" : "translateX(-30px)",
              transition: "all 0.7s ease",
            }}
          >
            <SectionLabel>Who We Are</SectionLabel>
            <SectionHeading>
              Crystal Digital Art & Award House
            </SectionHeading>
            <p className="text-gray-500 mt-5 mb-5 leading-relaxed text-base">
              Established in the heart of Pokhara, Crystal
              Digital Art & Award House has grown into the
              region's most trusted provider of customized
              awards, trophies, plaques, digital printing, and
              branding solutions. We serve schools,
              corporations, sports organizations, government
              bodies, and individuals across Nepal.
            </p>
            <p className="text-gray-500 mb-5 leading-relaxed text-base">
              Our state-of-the-art laser engraving and digital
              printing equipment, combined with our team's
              creative expertise, enables us to craft
              award-winning products that leave lasting
              impressions.
            </p>
            <div className="grid grid-cols-2 gap-4 mt-8">
              {[
                {
                  title: "Our Mission",
                  desc: "To deliver premium, personalized awards and printing solutions that celebrate achievements with elegance and precision.",
                },
                {
                  title: "Our Vision",
                  desc: "To be Nepal's leading award and digital craft company, known for quality, creativity, and exceptional customer care.",
                },
                {
                  title: "Core Values",
                  desc: "Quality, Creativity, Integrity, Innovation, and Customer Satisfaction guide everything we do.",
                },
                {
                  title: "Our Commitment",
                  desc: "On-time delivery, competitive pricing, and lifetime quality guarantee on all our products.",
                },
              ].map((v) => (
                <div
                  key={v.title}
                  className="p-4 rounded-xl"
                  style={{
                    background: "#F8FAFC",
                    border: "1px solid rgba(37,99,235,0.08)",
                  }}
                >
                  <h4
                    className="font-bold text-gray-800 text-sm mb-1.5"
                    style={{
                      fontFamily: "Poppins, sans-serif",
                    }}
                  >
                    {v.title}
                  </h4>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {v.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div
              className="rounded-2xl overflow-hidden h-60 shadow-lg"
              style={{ background: "#EFF6FF" }}
            >
              <ImageWithFallback
                src={img7}
                alt="Award store collection"
                className="w-full h-full object-cover"
              />
            </div>
            <div
              className="rounded-2xl overflow-hidden h-60 shadow-lg mt-8"
              style={{ background: "#EFF6FF" }}
            >
              <ImageWithFallback
                src={img8}
                alt="Trophy collection"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </Section>

      {/* Stats */}
      <section
        className="py-16"
        style={{
          background:
            "linear-gradient(135deg, #1E3A8A, #2563EB)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <StatCounter
              target={10}
              label="Years of Experience"
            />
            <StatCounter
              target={5000}
              label="Happy Customers"
            />
            <StatCounter
              target={12000}
              label="Completed Projects"
            />
            <StatCounter target={800} label="Custom Designs" />
          </div>
        </div>
      </section>

      {/* Map */}
      <Section bg="#F8FAFC">
        <div className="text-center mb-10">
          <SectionLabel>Find Us</SectionLabel>
          <SectionHeading>Our Location</SectionHeading>
        </div>
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          <div
            className="lg:col-span-2 rounded-2xl overflow-hidden shadow-lg"
            style={{ height: "380px" }}
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3515.8!2d83.988759!3d28.2206565!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3995944e9985132f%3A0x135f56a80ed54d24!2sCrystal%20Digital%20Art%20%26%20Craft!5e0!3m2!1sen!2snp!4v1720000000000"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Crystal Digital Art & Award House location"
            />
          </div>
          <div className="flex flex-col gap-4">
            {[
              {
                icon: MapPin,
                label: "Address",
                val: "Darbarthok Marga 1, Samsung Galli, Pokhara 33700, Nepal",
              },
              {
                icon: Phone,
                label: "Phone",
                val: "061-523459 / 9856012712",
              },
              {
                icon: Mail,
                label: "Email",
                val: "globallinksks@gmail.com",
              },
              {
                icon: Clock,
                label: "Business Hours",
                val: "Mon–Sat: 9:00 AM – 7:00 PM",
              },
            ].map((info) => {
              const Icon = info.icon;
              return (
                <div
                  key={info.label}
                  className="flex gap-4 p-4 rounded-xl"
                  style={{
                    background: "white",
                    border: "1px solid rgba(0,0,0,0.06)",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "#EFF6FF" }}
                  >
                    <Icon
                      size={18}
                      style={{ color: "#2563EB" }}
                    />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-0.5 font-medium">
                      {info.label}
                    </div>
                    <div className="text-sm text-gray-700 font-medium leading-snug">
                      {info.val}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Section>
    </div>
  );
}