import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-brand-coffee pt-12 pb-8 border-t border-brand-cream/5 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 text-brand-muted">
          <div>
            <h3 className="text-xl font-serif text-brand-cream mb-4">Brew & Bite</h3>
            <p className="text-sm leading-relaxed max-w-xs">
              Artisan coffee, delightful bakery items, and fresh meals delivered hot to your door in our local region.
            </p>
          </div>
          <div>
            <h4 className="text-brand-cream font-medium mb-4 uppercase tracking-wider text-sm">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-brand-amber transition-colors">Home</Link></li>
              <li><Link href="/menu" className="hover:text-brand-amber transition-colors">Order Menu</Link></li>
              <li><Link href="/cart" className="hover:text-brand-amber transition-colors">Your Cart</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-brand-cream font-medium mb-4 uppercase tracking-wider text-sm">Contact Us</h4>
            <ul className="space-y-2 text-sm">
              <li>42 Artisan Avenue, Coffee District</li>
              <li>hello@brewandbite.com</li>
              <li>+1 (555) 123-4567</li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-brand-cream/5 flex flex-col md:flex-row justify-between items-center text-xs text-brand-muted/60">
          <p>© {new Date().getFullYear()} Brew & Bite Café. All rights reserved.</p>
          <div className="mt-4 md:mt-0 flex gap-4">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
