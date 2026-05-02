"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/contexts/toast";

interface Tag {
  id: string;
  name: string;
  userId?: string;
}

export default function TagsPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [formData, setFormData] = useState({
    name: "",
  });

  useEffect(() => {
    loadTags();
  }, []);

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

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    try {
      const tag = await api.tags.create({
        name: formData.name,
        userId: user.id,
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

  const handleUpdateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTag) return;
    try {
      const updated = await api.tags.update(editingTag.id, {
        name: formData.name,
      });
      setTags(tags.map((t) => (t.id === editingTag.id ? (updated as Tag) : t)));
      setFormData({ name: "" });
      setEditingTag(null);
      addToast("Tag updated successfully!", "success");
    } catch (error) {
      addToast(
        `Failed to update tag: ${error instanceof Error ? error.message : "Unknown error"}`,
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

  const startEdit = (tag: Tag) => {
    setEditingTag(tag);
    setFormData({ name: tag.name });
    setShowForm(false);
  };

  const cancelEdit = () => {
    setEditingTag(null);
    setFormData({ name: "" });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-48 bg-muted rounded animate-pulse" />
        <div className="h-96 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tags</h1>
          <p className="text-muted-foreground mt-1">
            Organize transactions with custom tags
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingTag(null);
            setFormData({ name: "" });
          }}
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
              placeholder="e.g., Work, Personal, Travel"
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

      {editingTag && (
        <form
          onSubmit={handleUpdateTag}
          className="bg-card border border-primary rounded-lg p-6 space-y-4"
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">Edit Tag</h3>
            <button
              type="button"
              onClick={cancelEdit}
              className="text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          </div>
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
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium"
          >
            Update Tag
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
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tags.map((tag) => (
            <div
              key={tag.id}
              className="bg-card border border-border rounded-lg p-4 flex justify-between items-center hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏷️</span>
                <span className="font-medium">{tag.name}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(tag)}
                  className="text-muted-foreground hover:text-primary transition-colors"
                  title="Edit"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDeleteTag(tag.id)}
                  className="text-muted-foreground hover:text-red-600 transition-colors"
                  title="Delete"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
