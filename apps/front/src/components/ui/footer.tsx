import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Instagram, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="xl:grid xl:grid-cols-4 xl:gap-8">
          {/* Logo and Description */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Link to="/" className="flex items-center gap-2">
                <img src="/logo-apollo.png" alt="Apollo" className="h-8 w-auto" />
              </Link>
            </div>
            <p className="text-sm text-gray-600 max-w-xs">
              Transformando o futuro financeiro de milhares de brasileiros.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="mt-16 grid grid-cols-3 gap-8 xl:col-span-3 xl:mt-0">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">EMPRESA</h3>
              <ul role="list" className="mt-6 space-y-4">
                <li>
                  <Link to="/sobre" className="text-sm text-gray-600 hover:text-gray-900">
                    Sobre
                  </Link>
                </li>
                <li>
                  <Link to="/carreiras" className="text-sm text-gray-600 hover:text-gray-900">
                    Carreiras
                  </Link>
                </li>
                <li>
                  <Link to="/blog" className="text-sm text-gray-600 hover:text-gray-900">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">RECURSOS</h3>
              <ul role="list" className="mt-6 space-y-4">
                <li>
                  <Link to="/guia" className="text-sm text-gray-600 hover:text-gray-900">
                    Guia
                  </Link>
                </li>
                <li>
                  <Link to="/documentacao" className="text-sm text-gray-600 hover:text-gray-900">
                    Documentação
                  </Link>
                </li>
                <li>
                  <Link to="/api" className="text-sm text-gray-600 hover:text-gray-900">
                    API
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">LEGAL</h3>
              <ul role="list" className="mt-6 space-y-4">
                <li>
                  <Link to="/privacidade" className="text-sm text-gray-600 hover:text-gray-900">
                    Privacidade
                  </Link>
                </li>
                <li>
                  <Link to="/termos" className="text-sm text-gray-600 hover:text-gray-900">
                    Termos
                  </Link>
                </li>
                <li>
                  <Link to="/cookies" className="text-sm text-gray-600 hover:text-gray-900">
                    Cookies
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t flex items-center justify-between">
          <p className="text-sm text-gray-600">© 2024 Apollo. Todos os direitos reservados.</p>
          <div className="flex space-x-4">
            <Button variant="ghost" size="icon" asChild>
              <a
                href="https://linkedin.com/company/apollo"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900"
              >
                <span className="sr-only">LinkedIn</span>
                <Linkedin className="h-5 w-5" />
              </a>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <a
                href="https://instagram.com/apollo"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900"
              >
                <span className="sr-only">Instagram</span>
                <Instagram className="h-5 w-5" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
} 