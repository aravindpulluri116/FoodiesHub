import React from 'react';
import { Phone } from 'lucide-react';
import { config } from '../config';

const Contact = () => {
  const handleWhatsAppClick = () => {
    const message = "Hi, I'd like to know more about Sneha's Pickles!";
    const whatsappUrl = `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handlePhoneClick = () => {
    window.location.href = 'tel:++918886113839';
  };

  return (
    <section id="contact" className="py-16 px-4 bg-gradient-to-br from-orange-50 to-green-50">
      <div className="container mx-auto max-w-4xl">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Get In
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-green-600">
              Touch With Us
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Ready to taste our delicious pickles? Contact us today to place your order or learn more about our products.
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* WhatsApp Card */}
          <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 p-8 text-center border border-gray-100">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.690"/>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">WhatsApp</h3>
            <p className="text-gray-600 mb-6">
              Chat with us on WhatsApp for quick orders and instant responses
            </p>
            <button
              onClick={handleWhatsAppClick}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-full font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Chat on WhatsApp
            </button>
            <p className="text-sm text-gray-500 mt-3">+91 88861 13939</p>
          </div>

          {/* Phone Card */}
          <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 p-8 text-center border border-gray-100">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Phone Call</h3>
            <p className="text-gray-600 mb-6">
              Call us directly to discuss your pickle preferences and place orders
            </p>
            <button
              onClick={handlePhoneClick}
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-3 rounded-full font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Call Now
            </button>
            <p className="text-sm text-gray-500 mt-3">+91 88861 13939</p>
          </div>
        </div>

        {/* Location Info */}
        <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Our Location</h3>
          <p className="text-gray-600 mb-4">
            Yamnampet<br />
            Ghatkesar, Hyderabad 501301, India
          </p>
          <p className="text-sm text-gray-500 mb-6">
            We offer delivery across India
          </p>
          <a
            href={config.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800"
          >
            Ghatkesar, Hyderabad, India
          </a>
        </div>

        {/* Business Hours */}
        <div className="mt-8 text-center">
          <h4 className="text-lg font-semibold text-gray-800 mb-3">Business Hours</h4>
          <div className="grid md:grid-cols-2 gap-4 max-w-md mx-auto">
            <div className="bg-white rounded-lg p-4 shadow-md">
              <p className="font-medium text-gray-800">Monday - Saturday</p>
              <p className="text-gray-600">9:00 AM - 7:00 PM</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-md">
              <p className="font-medium text-gray-800">Sunday</p>
              <p className="text-gray-600">10:00 AM - 5:00 PM</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
