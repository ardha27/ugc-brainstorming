import { useState } from 'react';
import { Button } from '../common';

export function ProductForm({ onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    productName: '',
    productCategory: '',
    productFeatures: '',
  });

  const categories = [
    'AI Tool',
    'SaaS',
    'Mobile App',
    'Physical Product',
    'Service',
    'E-commerce',
    'Education',
    'Entertainment',
    'Other',
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const isValid = formData.productName.length >= 2 &&
                  formData.productCategory &&
                  formData.productFeatures.length >= 10;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="productName" className="block text-sm font-medium text-gray-300 mb-2">
          Nama Produk
        </label>
        <input
          type="text"
          id="productName"
          name="productName"
          value={formData.productName}
          onChange={handleChange}
          placeholder="Contoh: ElevenLabs"
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent"
          required
          minLength={2}
          maxLength={100}
        />
      </div>

      <div>
        <label htmlFor="productCategory" className="block text-sm font-medium text-gray-300 mb-2">
          Kategori Produk
        </label>
        <select
          id="productCategory"
          name="productCategory"
          value={formData.productCategory}
          onChange={handleChange}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent"
          required
        >
          <option value="">Pilih kategori...</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="productFeatures" className="block text-sm font-medium text-gray-300 mb-2">
          Fitur Utama (2-3 poin)
        </label>
        <textarea
          id="productFeatures"
          name="productFeatures"
          value={formData.productFeatures}
          onChange={handleChange}
          placeholder="Contoh:&#10;- Clone suara dengan AI&#10;- Support 29 bahasa&#10;- Hasil natural seperti manusia"
          rows={5}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent"
          required
          minLength={10}
          maxLength={500}
        />
        <p className="text-sm text-gray-500 mt-1">
          {formData.productFeatures.length}/500 karakter
        </p>
      </div>

      <Button
        type="submit"
        disabled={!isValid || isLoading}
        className="w-full"
        size="lg"
      >
        {isLoading ? 'Generating...' : 'Generate Ide Skit'}
      </Button>
    </form>
  );
}