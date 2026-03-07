"use client";

import { Accordion } from "@/components/ui";

const faqCategories = [
  {
    title: "Visiting",
    items: [
      { id: "v1", question: "What ages is the playground designed for?", answer: "Our play spaces are designed for children ages 0-12. We have a dedicated toddler zone (0-3) and larger climbing structures for kids 3-12." },
      { id: "v2", question: "What are your hours?", answer: "Monday–Friday: 9am–6pm, Saturday–Sunday: 9am–7pm. Holiday hours may vary." },
      { id: "v3", question: "What should we bring?", answer: "Just socks for everyone (grip socks available for purchase at the front desk). We provide everything else." },
      { id: "v4", question: "Is food available?", answer: "Yes! Our cafe serves coffee, snacks, and light meals for parents. Outside food is not permitted in the play area." },
    ],
  },
  {
    title: "Booking",
    items: [
      { id: "b1", question: "How do I book an open play session?", answer: "Book online through our website in under 2 minutes. Select your date, time, and number of children." },
      { id: "b2", question: "Can I book same-day?", answer: "Yes! As long as spots are available, you can book up to 30 minutes before a session starts." },
      { id: "b3", question: "Can I modify or cancel a booking?", answer: "You can modify or cancel up to 24 hours before your session through your parent portal." },
    ],
  },
  {
    title: "Parties",
    items: [
      { id: "p1", question: "What party packages do you offer?", answer: "We offer Classic ($299), Premium ($449), and Ultimate ($599) packages with varying inclusions for food, decor, and time." },
      { id: "p2", question: "How far in advance should I book?", answer: "We recommend 3-4 weeks, especially for weekend parties." },
      { id: "p3", question: "Can I bring my own cake?", answer: "Absolutely! Outside cakes and cupcakes are welcome." },
      { id: "p4", question: "Is a deposit required?", answer: "Yes, a 50% deposit secures your reservation. Balance is due 3 days before the party." },
    ],
  },
  {
    title: "Waivers",
    items: [
      { id: "w1", question: "Who needs to sign a waiver?", answer: "A parent or legal guardian must sign a waiver for each child. One waiver covers all visits for 12 months." },
      { id: "w2", question: "Can I sign the waiver at home?", answer: "Yes! Complete it online anytime before your visit. It takes less than 90 seconds." },
    ],
  },
  {
    title: "Memberships",
    items: [
      { id: "m1", question: "Can I cancel anytime?", answer: "Yes. Memberships are month-to-month with no contracts. Cancel or pause at any time." },
      { id: "m2", question: "Do guest passes roll over?", answer: "No, unused guest passes expire at the end of each billing cycle." },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="pt-24 pb-16">
      <div className="container-content max-w-3xl">
        <div className="text-center mb-12">
          <h1 className="font-display text-h1 md:text-display-l text-ink">Frequently asked questions</h1>
          <p className="mt-3 text-body-l text-ink-secondary">
            Everything you need to know about visiting, booking, parties, and memberships.
          </p>
        </div>

        <div className="space-y-12">
          {faqCategories.map((cat) => (
            <div key={cat.title}>
              <h2 className="font-display text-h2 text-ink mb-4">{cat.title}</h2>
              <Accordion items={cat.items} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
