import Image from "next/image";
import "./homepage-redesign.css";
import { AccountLink } from "@/components/customer/account-link";

const plans = [
  { name: "Hatchback", price: "2,499", image: "/images/hatchback.png" },
  { name: "Sedan", price: "2,799", image: "/images/sedan.png" },
  { name: "SUV", price: "3,199", image: "/images/suv.png" },
];

export default function Home() {
  return (
    <main className="homepage">
      <header className="nav">
        <a className="logo" href="#top" aria-label="goodmiles home">
          goodmiles<span>.</span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#services">Services</a>
          <a href="#how">How it works</a>
          <a href="#plans">Plans</a>
          <a href="#event">Event</a>
        </nav>
        <div className="nav-account">
          <AccountLink />
          <a className="nav-cta" href="/booking">
            Request a visit
          </a>
        </div>
      </header>
      <section className="hero" id="top">
        <div
          className="hero-image"
          role="img"
          aria-label="A dark blue luxury sedan"
        />
        <div className="hero-content">
          <h1>
            Car care, 
            <br />
            right where
            <br />
            you park.
          </h1>
          <p className="hero-copy">Professional detailing without the trip.</p>
          <div className="actions">
            <a className="button primary" href="/booking">
              Request a visit
            </a>
            <a className="button outline" href="#plans">
              Explore our plans
            </a>
          </div>
        </div>
        <div className="hero-bottom">
          <span>The goodmiles experience</span>
          <span>Scroll to explore ↓</span>
        </div>
      </section>
      <section className="intro section" id="about">
        <div>
          <h2>Care that comes to you.</h2>
        </div>
        <div
          className="intro-photo"
          role="img"
          aria-label="A professional preparing detailing equipment"
        />
        <div className="intro-copy">
          <p>
            Exceptional care should fit around your day. goodmiles brings
            professional automotive detailing to your apartment community, so
            your car gets the attention it deserves while you get on with yours.
          </p>
          <a className="text-link" href="#how">
            How it works
          </a>
        </div>
      </section>
      <section className="details section">
        <h2>Thoughtful care, every visit.</h2>
        <div className="details-grid">
          <div
            className="detail-photo detail-large"
            aria-label="Detailed wheel and tyre"
            role="img"
          />
          <div
            className="detail-photo detail-small"
            aria-label="Premium vehicle interior"
            role="img"
          />
        </div>
        <p>
          A precise finish.
          <br />A different kind of feeling.
        </p>
      </section>
      <section className="services section" id="services">
        <div className="section-heading">
          <div>
            <h2>Inside and out.</h2>
          </div>
          <p>Thoughtful care, from the first wipe to the final inspection.</p>
        </div>
        <div className="service-grid">
          <article className="service-panel exterior">
            <div>
              <span>Exterior</span>
              <h3>Exterior care</h3>
              <p>
                Waterless exterior cleaning, glass, mirrors, wheels and tyres,
                finished with a careful inspection.
              </p>
            </div>
          </article>
          <article className="service-panel interior">
            <div>
              <span>Interior</span>
              <h3>Interior care</h3>
              <p>
                Light cabin care including vacuuming, floor mats, dashboard,
                console and interior glass.
              </p>
            </div>
          </article>
        </div>
        <p className="note">
          Heavily muddy or gritty vehicles may need an alternative cleaning
          method. Deep restoration is not included in standard plans.
        </p>
      </section>
      <section className="how section" id="how">
        <div>
          <h2>From request to visit.</h2>
        </div>
        <div className="steps">
          {[
            [
              "01",
              "Choose your plan",
              "Explore the care available for your vehicle.",
            ],
            [
              "02",
              "Tell us where you park",
              "Include your vehicle and apartment details in a visit request.",
            ],
            [
              "03",
              "Leave the care to us",
              "Your detailer visits during a scheduled service window.",
            ],
            [
              "04",
              "Follow every visit",
              "Service records keep you connected to your car’s care.",
            ],
          ].map(([n, title, copy]) => (
            <div className="step" key={n}>
              <span>{n}</span>
              <div>
                <h3>{title}</h3>
                <p>{copy}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="section plans" id="plans">
        <div className="section-heading">
          <div>
            <h2>Care on repeat.</h2>
          </div>
          <p>Consistent care for the car you count on.</p>
        </div>
        <div className="plan-grid">
          {plans.map((plan, i) => (
            <article
              className={`plan ${i === 1 ? "featured" : ""}`}
              key={plan.name}
            >
              <Image
                className="plan-image"
                src={plan.image}
                alt={`Illustrative ${plan.name} vehicle`}
                width={411}
                height={226}
              />
              <div className="plan-top">
                <span>0{i + 1} / Membership</span>
                {i === 1 && <span>Sedan care</span>}
              </div>
              <h3>
                {plan.name}
                <br />
                Care
              </h3>
              <p className="price">
                ₹{plan.price} <small>/ 28 days</small>
              </p>
              <div className="rule" />
              <p>Proposed: 8 detailing visits</p>
              <ul>
                <li>Two visits per week</li>
                <li>Exterior and light interior care</li>
                <li>Scheduled service windows</li>
                <li>Digital service records</li>
              </ul>
              <a
                className="plan-link"
                href={`/booking?category=${encodeURIComponent(plan.name)}`}
              >
                Request a visit
              </a>
            </article>
          ))}
        </div>
        <p className="note">
          Memberships are coming soon. Prices are provisional. You can request
          an individual visit now, subject to apartment availability.
        </p>
      </section>
      <section className="trust section">
        <div>
          <h2>Care you can count on.</h2>
          <div
            className="trust-photo"
            role="img"
            aria-label="Professional car care setup"
          />
        </div>
        <div className="trust-copy">
          <p>
            Professional care is built on attention, transparency and a
            thoughtful approach to every visit.
          </p>
          <ul>
            <li>Identifiable detailers</li>
            <li>Digital service records</li>
            <li>Scheduled service windows</li>
            <li>Pre-service condition checks</li>
            <li>Quality inspections</li>
            <li>Customer support</li>
          </ul>
        </div>
      </section>
      <section className="event section" id="event">
        <div>
          <h2>Meet us in person.</h2>
          <p>
            Join us for a live demonstration of premium automotive detailing at
            your apartment community.
          </p>
          <div className="event-date">
            28 to 29 November 2026 <span>•</span> Location to be confirmed
          </div>
          <p className="event-note">
            Event registration details are coming soon.
          </p>
        </div>
        <div className="event-mark">
          g<span>.</span>
        </div>
      </section>
      <section className="faq section">
        <div>
          <h2>Your questions, answered.</h2>
          <p>Questions about goodmiles? Start here.</p>
        </div>
        <div className="faq-list">
          <details>
            <summary>What is waterless detailing?</summary>
            <p>
              Waterless detailing uses suitable products and methods to clean a
              vehicle with little or no water. The method depends on the
              vehicle’s condition.
            </p>
          </details>
          <details>
            <summary>Is it safe for my car’s paint?</summary>
            <p>
              Suitable products and techniques are important. Heavily muddy or
              gritty vehicles may require an alternative cleaning method.
            </p>
          </details>
          <details>
            <summary>What does a visit include?</summary>
            <p>
              Plans include exterior care and light interior detailing. Access
              to the interior depends on your chosen arrangements.
            </p>
          </details>
          <details>
            <summary>How does billing work?</summary>
            <p>
              Prices shown are provisional and cover a 28-day cycle, not a
              calendar month.
            </p>
          </details>
          <details>
            <summary>Where is goodmiles available?</summary>
            <p>
              Service is planned for approved apartment communities.
              Availability and registration details will be confirmed.
            </p>
          </details>
        </div>
      </section>
      <footer>
        <a className="logo" href="#top">
          goodmiles<span>.</span>
        </a>
        <p>Professional car care. Right where you park.</p>
        <a href="#top">Back to top ↑</a>
      </footer>
    </main>
  );
}
