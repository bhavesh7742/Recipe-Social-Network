import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChefHat, Plus, Trash2, Clock, AlignLeft, Tag, Layers, Upload, Save, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { api } from '../context/AuthContext';
import { PageLoader } from '../components/SkeletonLoader';
import Toast from '../components/Toast';

export default function CreateRecipe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Form Fields State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [prepTime, setPrepTime] = useState(15);
  const [cookTime, setCookTime] = useState(20);
  const [difficulty, setDifficulty] = useState('Medium');
  const [category, setCategory] = useState('Breakfast');
  const [tags, setTags] = useState('');
  
  // Lists
  const [ingredients, setIngredients] = useState(['']);
  const [cookingSteps, setCookingSteps] = useState(['']);

  // Image Upload State
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(''); // Text paste option
  const [imagePreview, setImagePreview] = useState('');

  // Fetch recipe data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchRecipe = async () => {
        try {
          const res = await api.get(`/recipes/${id}`);
          if (res.data && res.data.success) {
            const r = res.data.recipe;
            setTitle(r.title);
            setDescription(r.description);
            setPrepTime(r.prepTime);
            setCookTime(r.cookTime);
            setDifficulty(r.difficulty);
            setCategory(r.category);
            setTags(r.tags?.join(', ') || '');
            setIngredients(r.ingredients?.length ? r.ingredients : ['']);
            setCookingSteps(r.cookingSteps?.length ? r.cookingSteps : ['']);
            
            if (r.image) {
              if (r.image.startsWith('/uploads')) {
                setImagePreview(`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${r.image}`);
              } else {
                setImageUrl(r.image);
                setImagePreview(r.image);
              }
            }
          }
        } catch (err) {
          console.error(err);
          setToast({ message: 'Error retrieving recipe data', type: 'error' });
        } finally {
          setLoading(false);
        }
      };
      fetchRecipe();
    }
  }, [id, isEditMode]);

  // Image file change preview generator
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImageUrl(''); // Clear URL field if uploading file
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // URL input field preview generator
  const handleUrlPreview = (val) => {
    setImageUrl(val);
    if (val.trim()) {
      setImagePreview(val);
      setImageFile(null); // Clear file upload if pasting URL
    } else {
      setImagePreview('');
    }
  };

  // Ingredient Helpers
  const addIngredientField = () => setIngredients([...ingredients, '']);
  const updateIngredientField = (index, value) => {
    const list = [...ingredients];
    list[index] = value;
    setIngredients(list);
  };
  const removeIngredientField = (index) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, idx) => idx !== index));
    }
  };

  // Cooking Steps Helpers
  const addStepField = () => setCookingSteps([...cookingSteps, '']);
  const updateStepField = (index, value) => {
    const list = [...cookingSteps];
    list[index] = value;
    setCookingSteps(list);
  };
  const removeStepField = (index) => {
    if (cookingSteps.length > 1) {
      setCookingSteps(cookingSteps.filter((_, idx) => idx !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validations
    if (!title.trim() || !description.trim()) {
      setToast({ message: 'Please fill out the title and description', type: 'error' });
      return;
    }

    const filteredIngredients = ingredients.filter((i) => i.trim() !== '');
    const filteredSteps = cookingSteps.filter((s) => s.trim() !== '');

    if (filteredIngredients.length === 0) {
      setToast({ message: 'Please add at least one ingredient', type: 'error' });
      return;
    }

    if (filteredSteps.length === 0) {
      setToast({ message: 'Please add at least one cooking step', type: 'error' });
      return;
    }

    setSaving(true);

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('prepTime', prepTime.toString());
      formData.append('cookTime', cookTime.toString());
      formData.append('difficulty', difficulty);
      formData.append('category', category);
      formData.append('ingredients', JSON.stringify(filteredIngredients));
      formData.append('cookingSteps', JSON.stringify(filteredSteps));
      
      const parsedTags = tags.split(',').map(t => t.trim()).filter(Boolean);
      formData.append('tags', JSON.stringify(parsedTags));

      if (imageFile) {
        formData.append('image', imageFile);
      } else if (imageUrl) {
        formData.append('image', imageUrl.trim());
      }

      let res;
      if (isEditMode) {
        res = await api.put(`/recipes/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        res = await api.post('/recipes', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      if (res.data && res.data.success) {
        setToast({ 
          message: isEditMode ? 'Recipe updated successfully!' : 'Recipe published successfully!', 
          type: 'success' 
        });
        setTimeout(() => navigate(`/recipe/${res.data.recipe._id}`), 1500);
      }
    } catch (err) {
      console.error(err);
      setToast({ 
        message: err.response?.data?.message || 'Error saving recipe', 
        type: 'error' 
      });
    } finally {
      setSaving(false);
    }
  };

  const categories = ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Salad', 'Appetizer', 'Snacks', 'Beverages'];
  const difficulties = ['Easy', 'Medium', 'Hard'];

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
      
      {/* Back link */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Cancel
      </button>

      {/* Header title */}
      <div className="flex items-center gap-3 mb-8 border-b border-slate-100 dark:border-slate-800/80 pb-4">
        <div className="h-12 w-12 rounded-2xl bg-primary-100 dark:bg-primary-950 flex items-center justify-center text-primary-600 dark:text-primary-400">
          <ChefHat className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
            {isEditMode ? 'Modify Recipe' : 'Create New Recipe'}
          </h1>
          <p className="text-xs text-slate-400 font-semibold uppercase mt-0.5">Share your kitchen magic with the community</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Card 1: Core Details */}
        <section className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 border-b border-slate-55 pb-3">
            <AlignLeft className="h-5 w-5 text-primary-500" />
            General Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Recipe Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="E.g., Grandma's Authentic Chocolate Fudge Cake"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 text-sm focus:bg-white"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Description / Story *
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Give your recipe a backstory, what makes it special, and who it serves..."
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 text-sm focus:bg-white resize-none"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 text-sm focus:bg-white"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Difficulty Level *
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 text-sm focus:bg-white"
              >
                {difficulties.map((diff) => (
                  <option key={diff} value={diff}>{diff}</option>
                ))}
              </select>
            </div>

            {/* Prep Time */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Clock className="h-4 w-4 text-slate-400" /> Prep Time (Minutes) *
              </label>
              <input
                type="number"
                required
                min={0}
                value={prepTime}
                onChange={(e) => setPrepTime(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 text-sm focus:bg-white"
              />
            </div>

            {/* Cook Time */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Clock className="h-4 w-4 text-slate-400" /> Cook Time (Minutes) *
              </label>
              <input
                type="number"
                required
                min={0}
                value={cookTime}
                onChange={(e) => setCookTime(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 text-sm focus:bg-white"
              />
            </div>

            {/* Tags comma separated */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Tag className="h-4 w-4 text-slate-400" /> Tags / Keywords
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="dessert, baking, chocolate, sweet, cake (comma separated)"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 text-sm focus:bg-white"
              />
            </div>

          </div>
        </section>

        {/* Card 2: Cover Media */}
        <section className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 border-b border-slate-55 pb-3">
            <ImageIcon className="h-5 w-5 text-primary-500" />
            Recipe Cover Image
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              
              {/* Option A: File Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Upload className="h-4 w-4 text-slate-400" /> Upload Local Image file
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 file:cursor-pointer hover:file:bg-primary-100"
                />
              </div>

              <div className="flex items-center gap-2 py-1 text-slate-300 dark:text-slate-850">
                <span className="h-px bg-slate-100 dark:bg-slate-800 flex-1" />
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Or paste image URL</span>
                <span className="h-px bg-slate-100 dark:bg-slate-800 flex-1" />
              </div>

              {/* Option B: External URL link */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Image Web URL
                </label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => handleUrlPreview(e.target.value)}
                  placeholder="https://images.unsplash.com/... or cloud image path"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 text-sm focus:bg-white"
                />
              </div>

            </div>

            {/* Media visual preview panel */}
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-4 min-h-[180px] bg-slate-50/50 dark:bg-slate-900/50 text-center relative overflow-hidden">
              {imagePreview ? (
                <img src={imagePreview} alt="Recipe Preview" className="h-full w-full object-cover max-h-[220px] rounded-2xl" />
              ) : (
                <div className="text-slate-400 space-y-2">
                  <ImageIcon className="h-10 w-10 mx-auto opacity-40" />
                  <p className="text-xs font-semibold">Image preview will load here</p>
                </div>
              )}
            </div>

          </div>
        </section>

        {/* Card 3: Dynamic Checklist Lists */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Ingredients list */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary-500" />
                Ingredients *
              </h2>
              <button
                type="button"
                onClick={addIngredientField}
                className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 hover:underline"
              >
                + Add Item
              </button>
            </div>

            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {ingredients.map((ing, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    type="text"
                    required
                    value={ing}
                    onChange={(e) => updateIngredientField(index, e.target.value)}
                    placeholder={`Ingredient #${index + 1}`}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => removeIngredientField(index)}
                    disabled={ingredients.length <= 1}
                    className="p-2.5 rounded-xl border border-transparent text-slate-400 hover:text-rose-500 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Cooking Steps list */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-55 pb-3">
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary-500" />
                Steps Sequence *
              </h2>
              <button
                type="button"
                onClick={addStepField}
                className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 hover:underline"
              >
                + Add Step
              </button>
            </div>

            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {cookingSteps.map((step, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <span className="h-7 w-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0 mt-1">
                    {index + 1}
                  </span>
                  <textarea
                    required
                    rows={2}
                    value={step}
                    onChange={(e) => updateStepField(index, e.target.value)}
                    placeholder={`Instruction details for step ${index + 1}`}
                    className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white resize-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeStepField(index)}
                    disabled={cookingSteps.length <= 1}
                    className="p-2.5 rounded-xl border border-transparent text-slate-400 hover:text-rose-500 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors mt-0.5"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </section>

        {/* Submit Bar */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3.5 border border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-2xl text-sm font-bold transition-all"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl text-sm shadow-md hover:shadow-lg disabled:opacity-50 transition-all shrink-0"
          >
            <Save className="h-5 w-5" />
            {saving ? 'Publishing...' : isEditMode ? 'Update Recipe' : 'Publish Recipe'}
          </button>
        </div>

      </form>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
