"use client";

import { useState, useEffect, useCallback } from "react";
import { Button, Card, CardContent, Input, Select, Modal, Badge, useToast } from "@/components/ui";
import { Plus, Pencil, Trash2, Loader2, UtensilsCrossed, Check } from "lucide-react";

const MENU_CATEGORIES = [
  { value: "Snacks", label: "Snacks" },
  { value: "Drinks", label: "Drinks" },
  { value: "Combos", label: "Combos" },
  { value: "Treats", label: "Treats" },
];

const CATEGORY_BADGE: Record<string, "mustard" | "sage" | "terracotta" | "dusty" | "default"> = {
  Snacks: "mustard",
  Drinks: "sage",
  Combos: "terracotta",
  Treats: "dusty",
};

interface MenuItemData {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  available: boolean;
  displayOrder: number;
}

export function MenuEditor() {
  const [items, setItems] = useState<MenuItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItemData | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Form state
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formCategory, setFormCategory] = useState("Snacks");
  const [formAvailable, setFormAvailable] = useState(true);

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/menu");
      const json = await res.json();
      setItems(json.items || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const resetForm = () => {
    setFormName("");
    setFormDescription("");
    setFormPrice("");
    setFormCategory("Snacks");
    setFormAvailable(true);
    setEditingItem(null);
  };

  const openAddModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = (item: MenuItemData) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormDescription(item.description || "");
    setFormPrice(item.price.toFixed(2));
    setFormCategory(item.category);
    setFormAvailable(item.available);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) {
      toast("error", "Name is required");
      return;
    }
    if (!formPrice || isNaN(Number(formPrice)) || Number(formPrice) < 0) {
      toast("error", "Valid price is required");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formName.trim(),
        description: formDescription.trim() || null,
        price: Number(formPrice),
        category: formCategory,
        available: formAvailable,
      };

      const url = editingItem
        ? `/api/admin/menu/${editingItem.id}`
        : "/api/admin/menu";
      const method = editingItem ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        toast("error", json.error || "Failed to save");
        return;
      }

      toast("success", editingItem ? "Menu item updated" : "Menu item added");
      setModalOpen(false);
      resetForm();
      fetchItems();
    } catch {
      toast("error", "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/menu/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast("success", "Menu item removed");
        fetchItems();
      } else {
        const json = await res.json();
        toast("error", json.error || "Failed to delete");
      }
    } catch {
      toast("error", "Something went wrong");
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleAvailable = async (item: MenuItemData) => {
    try {
      const res = await fetch(`/api/admin/menu/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available: !item.available }),
      });
      if (res.ok) {
        fetchItems();
      }
    } catch {
      // silently fail
    }
  };

  // Group items by category
  const grouped: Record<string, MenuItemData[]> = {};
  for (const item of items) {
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category].push(item);
  }
  const categoryOrder = ["Snacks", "Drinks", "Combos", "Treats"];
  const sortedCategories = Object.keys(grouped).sort(
    (a, b) => (categoryOrder.indexOf(a) === -1 ? 99 : categoryOrder.indexOf(a)) -
              (categoryOrder.indexOf(b) === -1 ? 99 : categoryOrder.indexOf(b))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-terracotta" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-h4 text-ink">Menu Items</h3>
        <Button onClick={openAddModal}>
          <Plus className="h-4 w-4" /> Add Item
        </Button>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <UtensilsCrossed className="h-10 w-10 text-ink-secondary mx-auto mb-4" />
            <h4 className="font-display text-h4 text-ink mb-2">No menu items yet</h4>
            <p className="text-body-s text-ink-secondary mb-4">
              Add your first snack bar or concession item.
            </p>
            <Button onClick={openAddModal}>
              <Plus className="h-4 w-4" /> Add Item
            </Button>
          </CardContent>
        </Card>
      ) : (
        sortedCategories.map((category) => (
          <div key={category} className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant={CATEGORY_BADGE[category] || "default"}>
                {category}
              </Badge>
              <span className="text-body-s text-ink-secondary">
                {grouped[category].length} item{grouped[category].length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="grid gap-3">
              {grouped[category].map((item) => (
                <Card key={item.id}>
                  <CardContent>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-body-s font-medium text-ink">
                            {item.name}
                          </span>
                          {!item.available && (
                            <Badge variant="default" className="text-[10px]">
                              Unavailable
                            </Badge>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-caption text-ink-secondary mt-0.5 truncate">
                            {item.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-body-s font-medium text-ink">
                          ${item.price.toFixed(2)}
                        </span>

                        <button
                          onClick={() => handleToggleAvailable(item)}
                          className={`relative w-9 h-5 rounded-full transition-colors ${
                            item.available ? "bg-success" : "bg-cream-400"
                          }`}
                          title={item.available ? "Mark unavailable" : "Mark available"}
                        >
                          <span
                            className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform shadow-sm ${
                              item.available ? "translate-x-4" : ""
                            }`}
                          />
                        </button>

                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 rounded-md text-ink-secondary hover:text-terracotta hover:bg-terracotta/10 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          className="p-1.5 rounded-md text-ink-secondary hover:text-error hover:bg-error/10 transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          {deletingId === item.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))
      )}

      {/* Add/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); resetForm(); }}
        title={editingItem ? "Edit Menu Item" : "Add Menu Item"}
        description={editingItem ? `Update ${editingItem.name}` : "Add a new item to your menu."}
      >
        <div className="space-y-4">
          <Input
            label="Name *"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="e.g., Pizza Slice"
          />

          <div>
            <label className="block text-body-s font-medium text-ink mb-1">
              Description
            </label>
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Short description (optional)"
              maxLength={200}
              className="flex w-full rounded-md border border-cream-300 bg-white px-3 py-2 text-body-s text-ink placeholder:text-ink-secondary/50 focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta min-h-[70px] resize-y"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price *"
              type="number"
              step="0.01"
              min="0"
              value={formPrice}
              onChange={(e) => setFormPrice(e.target.value)}
              placeholder="0.00"
            />
            <Select
              label="Category *"
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value)}
              options={MENU_CATEGORIES}
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formAvailable}
              onChange={(e) => setFormAvailable(e.target.checked)}
              className="h-4 w-4 rounded border-cream-400 text-terracotta focus:ring-terracotta/30"
            />
            <span className="text-body-s text-ink">Available for purchase</span>
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => { setModalOpen(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}{" "}
              {editingItem ? "Save Changes" : "Add Item"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
