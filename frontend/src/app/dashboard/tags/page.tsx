"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/contexts/toast";

interface Tag {
  id: string;
  name: string;
}

export default function TagsPage() {
  const { addToast } = useToast();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
  });

  useEffect(() => {
    const loadTags = async () => {
      try {
        setLoading(true);
        const data = await api.tags.getAll();
        setTags(Array.isArray(data) ? data : []);
      } catch (error) {
        addToast(
          `Failed to load tags: ${error instanceof Error ? error.message : "Unknown error"}`,
          "error",
        );
      } finally {
        setLoading(false);
      }
    };

    loadTags();
  }, [addToast]);

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const tag = await api.tags.create({
        name: formData.name,
      });
      setTags([...tags, tag as Tag]);
      setFormData({ name: "" });
      setShowForm(false);
      addToast("Tag created successfully!", "success");
    } catch (error) {
      addToast(
        `Failed to create tag: ${error instanceof Error ? error.message : "Unknown error"}`,
        "error",
      );
    }
  };

  const handleDeleteTag = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tag?")) return;
    try {
      await api.tags.delete(id);
      setTags(tags.filter((t) => t.id !== id));
      addToast("Tag deleted successfully!", "success");
    } catch (error) {
      addToast(
        `Failed to delete tag: ${error instanceof Error ? error.message : "Unknown error"}`,
        "error",
      );
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-48 bg-muted rounded animate-pulse" />
        <div className="h-64 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tags</h1>
          <p className="text-muted-foreground mt-1">
            Organize and categorize your transactions
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium"
        >
          {showForm ? "Cancel" : "Add Tag"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreateTag}
          className="bg-card border border-border rounded-lg p-6 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium mb-2">Tag Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., Business, Personal, Travel"
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium"
          >
            Create Tag
          </button>
        </form>
      )}

      {tags.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <p className="text-muted-foreground mb-4">
            No tags yet. Create your first tag to get started.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium"
          >
            Create Tag
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <div
              key={tag.id}
              className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2"
            >
              <span className="font-medium text-sm">{tag.name}</span>
              <button
                onClick={() => handleDeleteTag(tag.id)}
                className="text-muted-foreground hover:text-red-600 transition-colors font-bold"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
