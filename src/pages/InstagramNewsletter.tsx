import React from "react";

export default function InstagramNewsletter() {
  return (
    <section className="bg-[#dbdbdb] py-16 px-6">
      <div className="max-w-6xl mx-auto text-center">
        {/* Instagram Heading */}
        <h2 className="text-2xl md:text-3xl font-bold mb-8">
          Follow Products And Discounts On Instagram
        </h2>

        {/* Instagram Images */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mb-12">
  <img
    src="https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
    alt="Instagram 1"
    className="w-full h-48 object-cover"
  />
  <img
    src="https://images.unsplash.com/photo-1495121605193-b116b5b9c5fe?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
    alt="Instagram 2"
    className="w-full h-48 object-cover"
  />
  <img
    src="https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
    alt="Instagram 3"
    className="w-full h-48 object-cover"
  />
  <img
    src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
    alt="Instagram 4"
    className="w-full h-48 object-cover"
  />
  <img
    src="https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
    alt="Instagram 5"
    className="w-full h-48 object-cover"
  />
  <img
    src="https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
    alt="Instagram 6"
    className="w-full h-48 object-cover"
  />
</div>


        {/* Newsletter Heading */}
        <h3 className="text-2xl md:text-3xl font-bold mb-6">
          Or Subscribe To The Newsletter
        </h3>

        {/* Newsletter Form */}
        <form className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto">
          <input
            type="email"
            placeholder="Email Address..."
            className="w-full sm:flex-1 border-b border-gray-400 bg-transparent focus:outline-none focus:border-black py-2 text-sm"
          />
          <button
            type="submit"
            className="uppercase text-sm font-medium tracking-wider"
          >
            Submit
          </button>
        </form>
      </div>
    </section>
  );
}
