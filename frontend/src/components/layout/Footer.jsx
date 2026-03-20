import { Link } from 'react-router-dom'
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="page-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🥦</span>
              <span className="font-display text-xl font-bold text-white">Smart Sabji</span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              Fresh vegetables delivered to your doorstep every day. Farm to table, always fresh.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-primary-400 transition-colors">Home</Link></li>
              <li><Link to="/products" className="hover:text-primary-400 transition-colors">Shop</Link></li>
              <li><Link to="/cart" className="hover:text-primary-400 transition-colors">Cart</Link></li>
              <li><Link to="/orders" className="hover:text-primary-400 transition-colors">My Orders</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-semibold mb-4">Categories</h3>
            <ul className="space-y-2 text-sm">
              {['Leafy Greens', 'Root Vegetables', 'Gourds', 'Exotic Vegetables', 'Herbs & Spices'].map(c => (
                <li key={c}>
                  <Link to={`/products?category=${c}`} className="hover:text-primary-400 transition-colors">{c}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2"><FiMapPin className="w-4 h-4 text-primary-400 shrink-0" /> Mumbai, Maharashtra</li>
              <li className="flex items-center gap-2"><FiPhone className="w-4 h-4 text-primary-400 shrink-0" /> +91 99999 00000</li>
              <li className="flex items-center gap-2"><FiMail className="w-4 h-4 text-primary-400 shrink-0" /> hello@smartsabji.com</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Smart Sabji. All rights reserved.</p>
          <p>Made with 💚 for fresh food lovers</p>
        </div>
      </div>
    </footer>
  )
}
