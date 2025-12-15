'use client';

import { useState } from 'react';
import { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import { MapPin, Phone, Mail, Clock, Send, Facebook, Instagram, Twitter, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui';

const storeInfo = {
  name: 'OSCAR Fashion',
  address: '123 Rue Didouche Mourad, Alger Centre, Alger 16000, Algérie',
  phone: '+213 XX XX XX XX',
  email: 'contact@oscarfashion.dz',
  hours: {
    weekdays: '09:00 - 20:00',
    saturday: '10:00 - 18:00',
    sunday: 'Fermé',
  },
  social: {
    facebook: 'https://facebook.com/oscarfashion',
    instagram: 'https://instagram.com/oscarfashion',
    twitter: 'https://twitter.com/oscarfashion',
  },
  mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3197.0191824932706!2d3.0576!3d36.7538!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzbCsDQ1JzEzLjciTiAzwrAwMyczNC42IkU!5e0!3m2!1sfr!2sdz!4v1234567890',
};

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setSubmitted(true);
    setIsSubmitting(false);
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary-dark text-white py-16">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Contactez-nous</h1>
            <p className="text-xl text-gray-100">
              Une question ? Une suggestion ? N'hésitez pas à nous contacter. Notre équipe est là pour vous aider.
            </p>
          </div>
        </div>
      </section>

      <div className="container-custom py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6">Envoyez-nous un message</h2>

              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Message envoyé !</h3>
                  <p className="text-gray-600 mb-6">
                    Merci de nous avoir contactés. Nous vous répondrons dans les plus brefs délais.
                  </p>
                  <Button onClick={() => setSubmitted(false)}>Envoyer un autre message</Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Nom complet *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                        placeholder="Votre nom"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                        placeholder="votre@email.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                        placeholder="+213 XX XX XX XX"
                      />
                    </div>
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                        Sujet *
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        required
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                      >
                        <option value="">Sélectionnez un sujet</option>
                        <option value="order">Question sur une commande</option>
                        <option value="product">Information produit</option>
                        <option value="return">Retour / Échange</option>
                        <option value="partnership">Partenariat</option>
                        <option value="other">Autre</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={6}
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors resize-none"
                      placeholder="Décrivez votre demande..."
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-2" />
                        Envoyer le message
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* Store Info Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-6">Informations de contact</h2>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Adresse</h3>
                    <p className="text-gray-600 text-sm">{storeInfo.address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Téléphone</h3>
                    <a href={`tel:${storeInfo.phone}`} className="text-primary hover:underline text-sm">
                      {storeInfo.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Email</h3>
                    <a href={`mailto:${storeInfo.email}`} className="text-primary hover:underline text-sm">
                      {storeInfo.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Horaires</h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Lun - Ven: {storeInfo.hours.weekdays}</p>
                      <p>Samedi: {storeInfo.hours.saturday}</p>
                      <p>Dimanche: {storeInfo.hours.sunday}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Suivez-nous</h2>
              <p className="text-gray-600 text-sm mb-4">
                Restez connectés pour découvrir nos nouveautés et promotions exclusives.
              </p>
              <div className="flex gap-3">
                <a
                  href={storeInfo.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
                >
                  <Facebook className="h-6 w-6" />
                </a>
                <a
                  href={storeInfo.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-500 text-white rounded-lg flex items-center justify-center hover:opacity-90 transition-opacity"
                >
                  <Instagram className="h-6 w-6" />
                </a>
                <a
                  href={storeInfo.social.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-sky-500 text-white rounded-lg flex items-center justify-center hover:bg-sky-600 transition-colors"
                >
                  <Twitter className="h-6 w-6" />
                </a>
                <a
                  href="https://wa.me/213XXXXXXXX"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-green-500 text-white rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors"
                >
                  <MessageCircle className="h-6 w-6" />
                </a>
              </div>
            </div>

            {/* Quick Help */}
            <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl shadow-lg p-6 text-white">
              <h2 className="text-xl font-bold mb-2">Besoin d'aide rapide ?</h2>
              <p className="text-gray-100 text-sm mb-4">
                Consultez notre FAQ pour trouver des réponses à vos questions les plus fréquentes.
              </p>
              <Button variant="secondary" size="sm" asChild>
                <a href="/faq">Voir la FAQ</a>
              </Button>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-12">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Notre emplacement</h2>
              <p className="text-gray-600 text-sm">Venez nous rendre visite dans notre boutique</p>
            </div>
            <div className="aspect-[21/9] w-full">
              <iframe
                src={storeInfo.mapUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="OSCAR Fashion Location"
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
