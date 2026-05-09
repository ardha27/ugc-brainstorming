import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout';
import { ProductForm, GeneratingLoader, IdeaPreview } from '../components/generate';
import { api } from '../lib/api';

export function GenerateIdea() {
  const navigate = useNavigate();
  const [step, setStep] = useState('form'); // 'form' | 'generating' | 'preview'
  const [generatedIdea, setGeneratedIdea] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    setStep('generating');
    setError(null);

    try {
      const response = await fetch('/api/ideas/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to generate idea');
      }

      const data = await response.json();
      setGeneratedIdea(data.idea);
      setStep('preview');
    } catch (err) {
      setError(err.message);
      setStep('form');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = async () => {
    // Re-use existing form data would require storing it
    // For now, show message that this requires re-submitting
    alert('Silakan submit ulang form untuk regenerate ide');
  };

  const handleSave = async () => {
    if (!generatedIdea) return;

    try {
      // The idea is already saved by the API, just navigate to kanban
      navigate('/kanban');
    } catch (err) {
      setError('Failed to save idea');
    }
  };

  const handleDiscard = async () => {
    if (generatedIdea?.id) {
      try {
        await api.deleteIdea(generatedIdea.id);
      } catch (err) {
        console.error('Failed to delete idea:', err);
      }
    }
    navigate('/');
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Generate Ide Skit</h1>
          <p className="text-gray-600">
            Masukkan info produk dan AI akan generate ide skit kreatif untuk soft-selling
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <p className="font-medium">Error</p>
            <p>{error}</p>
          </div>
        )}

        {step === 'form' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <ProductForm onSubmit={handleSubmit} isLoading={isLoading} />
          </div>
        )}

        {step === 'generating' && (
          <div className="bg-white rounded-lg border border-gray-200 p-12">
            <GeneratingLoader />
          </div>
        )}

        {step === 'preview' && generatedIdea && (
          <IdeaPreview
            idea={generatedIdea}
            onRegenerate={handleRegenerate}
            onSave={handleSave}
            onDiscard={handleDiscard}
            isLoading={isLoading}
          />
        )}
      </div>
    </Layout>
  );
}
