import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col flex-1">
      {/* Hero Section */}
      <section className="relative w-full h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Image Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-overlay"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1600')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-espresso via-brand-espresso/80 to-transparent" />
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
          <h1 className="text-5xl md:text-7xl font-serif text-brand-cream mb-6 drop-shadow-lg">
            Sip, Savor, <br className="md:hidden"/> Delivered.
          </h1>
          <p className="text-brand-muted text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            Experience the rich taste of artisan coffee and freshly baked delights, delivered right to your door with love.
          </p>
          <div className="flex gap-4">
            <Link href="/menu" className="btn-primary text-lg px-8 py-3">
              Explore Our Menu
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-brand-coffee/30">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-serif text-brand-amber mb-16">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { title: "Browse", desc: "Explore our rich menu of locally roasted coffees and artisanal pastries.", icon: "☕" },
              { title: "Order", desc: "Customize your items, add to cart, and checkout seamlessly.", icon: "🛍️" },
              { title: "Enjoy", desc: "Sit back while we deliver hot coffee and fresh food straight to you.", icon: "🚀" }
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center group">
                <div className="w-20 h-20 bg-brand-amber/10 rounded-full flex items-center justify-center text-4xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(212,163,106,0.1)]">
                  {step.icon}
                </div>
                <h3 className="text-xl font-medium text-brand-cream mb-3">{step.title}</h3>
                <p className="text-brand-muted leading-relaxed max-w-xs">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mini CTA */}
      <section className="py-24 px-4 text-center">
        <div className="max-w-3xl mx-auto glass-panel p-12">
          <h2 className="text-3xl font-serif text-brand-cream mb-4">Ready for your coffee break?</h2>
          <p className="text-brand-muted mb-8 text-lg">We're brewing right now. Let us treat you today.</p>
          <Link href="/menu" className="btn-primary px-8">
            Order Now
          </Link>
        </div>
      </section>
    </div>
  );
}
